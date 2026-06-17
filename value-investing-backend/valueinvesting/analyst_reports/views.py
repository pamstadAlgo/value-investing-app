import boto3
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from quickfs_dj.models import TradedCompanies
from .models import UserUpload
from .serializers import UserUploadSerializer
from .tasks import process_uploaded_file


class PresignedUploadURLView(APIView):
    def post(self, request):
        qfs_symbol = request.data.get("qfs_symbol")
        file_name = request.data.get("file_name")
        file_type = request.data.get("file_type")

        s3_key = f"user-uploads/{qfs_symbol}/user_{request.user.id}/{file_name}"

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": file_type,
            },
            ExpiresIn=300,
        )

        return Response({"presigned_url": presigned_url, "s3_key": s3_key})


class ConfirmUploadView(APIView):
    def post(self, request):
        qfs_symbol = request.data.get("qfs_symbol")
        s3_key = request.data.get("s3_key")
        file_name = request.data.get("file_name")
        file_type = request.data.get("file_type")

        company = TradedCompanies.objects.get(qfs_symbol=qfs_symbol)

        upload = UserUpload.objects.create(
            user=request.user,
            qfs_symbol=company,
            s3_key=s3_key,
            file_name=file_name,
            file_type=file_type,
        )

        process_uploaded_file.delay(upload.pk)

        serializer = UserUploadSerializer(upload)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserUploadsView(APIView):
    def get(self, request, qfs_symbol):
        uploads = UserUpload.objects.filter(
            user=request.user,
            qfs_symbol__qfs_symbol=qfs_symbol,
        )
        serializer = UserUploadSerializer(uploads, many=True)
        return Response(serializer.data)


class RetryUploadView(APIView):
    def post(self, request, upload_id):
        try:
            upload = UserUpload.objects.get(pk=upload_id, user=request.user)
        except UserUpload.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        if upload.status != UserUpload.Status.FAILED:
            return Response({"error": "File is not in failed state."}, status=status.HTTP_400_BAD_REQUEST)

        if upload.retry_count >= 3:
            return Response({"error": "Max retries reached."}, status=status.HTTP_400_BAD_REQUEST)

        upload.retry_count += 1
        upload.status = UserUpload.Status.UPLOADED
        upload.save()

        process_uploaded_file.delay(upload.pk)

        serializer = UserUploadSerializer(upload)
        return Response(serializer.data)
