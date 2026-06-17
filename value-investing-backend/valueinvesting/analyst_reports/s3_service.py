import boto3
from django.conf import settings


def _client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )


def download_file(s3_key: str, local_path: str) -> None:
    _client().download_file(settings.AWS_STORAGE_BUCKET_NAME, s3_key, local_path)


def upload_text(content: str, s3_key: str, content_type: str = "text/markdown") -> None:
    _client().put_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=s3_key,
        Body=content.encode("utf-8"),
        ContentType=content_type,
    )
