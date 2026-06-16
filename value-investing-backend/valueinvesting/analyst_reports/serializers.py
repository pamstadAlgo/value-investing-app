from rest_framework import serializers
from .models import UserUpload


class UserUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserUpload
        fields = ["id", "s3_key", "file_name", "file_type", "uploaded_at", "status"]
        read_only_fields = ["id", "uploaded_at", "status"]
