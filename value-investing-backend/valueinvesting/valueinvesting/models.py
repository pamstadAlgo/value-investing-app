from django.db import models

class TaxRates(models.Model):
    """
    Model that stores the corporate tax rate of different countries
    """
    country = models.CharField(max_length=150)
    taxRate = models.DecimalField()