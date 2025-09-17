from django.db import models
from django.conf import settings

# Create your models here.
class CustomMetrics(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # References the current user model
        on_delete=models.CASCADE  # Deletes related metrics if the user is deleted
    )
    tech_name = models.CharField(max_length=256)
    readable_name = models.CharField(max_length=256)
    html_formula = models.CharField(max_length=10000, default='')
    # table = models.CharField(max_length=300)
    description = models.CharField(max_length=5000)

class FilterViews(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # References the current user model
        on_delete=models.CASCADE  # Deletes related metrics if the user is deleted
    )
    view_name = models.CharField(max_length=500)
    view_description = models.CharField(max_length=5000)
    view_filters = models.CharField(max_length=50000)

