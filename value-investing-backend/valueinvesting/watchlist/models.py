from django.db import models
from django.conf import settings
from quickfs_dj.models import TradedCompanies

class Watchlist(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_watchlists'
    )
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='shared_watchlists',
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.owner})"

class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(
        Watchlist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    company = models.ForeignKey(
        TradedCompanies,
        on_delete=models.CASCADE,
        related_name='watchlist_occurrences'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('watchlist', 'company')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.company.ticker} in {self.watchlist.title}"