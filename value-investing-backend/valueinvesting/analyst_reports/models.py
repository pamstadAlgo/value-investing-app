from django.db import models
from django.conf import settings
from quickfs_dj.models import TradedCompanies


class UserUpload(models.Model):

    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        DONE = "done", "Done"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    qfs_symbol = models.ForeignKey(TradedCompanies, to_field="qfs_symbol", on_delete=models.CASCADE, db_column="qfs_symbol")
    s3_key = models.CharField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.UPLOADED)

    class Meta:
        unique_together = ("user", "s3_key")
