from django.db import models
from django.conf import settings

class ValuationSnapshot(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="valuations")
    qfs_symbol = models.CharField(max_length=50, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    analyst_name = models.CharField(max_length=150, blank=True)
    price_target = models.FloatField()
    current_price_at_submission = models.FloatField(null=True, blank=True)
    thesis = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=100, blank=True)
    model_inputs = models.JSONField(default=dict)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['qfs_symbol', 'created_at']),
        ]

    def __str__(self):
        return f"{self.qfs_symbol} | {self.analyst_name} | {self.created_at.strftime('%Y-%m-%d')}"

    def save(self, *args, **kwargs):
        if not self.analyst_name and self.user:
            self.analyst_name = self.user.get_full_name() or self.user.username
        super().save(*args, **kwargs)