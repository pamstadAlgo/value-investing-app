from django.contrib import admin
from .models import Watchlist, WatchlistItem

class WatchlistItemInline(admin.TabularInline):
    model = WatchlistItem
    extra = 1
    # 'raw_id_fields' is crucial for performance if you have thousands of stocks. 
    # It replaces the dropdown with a search popup.
    raw_id_fields = ['company']

@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'created_at')
    search_fields = ('title', 'owner__username')
    inlines = [WatchlistItemInline]

@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ('watchlist', 'company', 'added_at')
    search_fields = ('watchlist__title', 'company__ticker')
    raw_id_fields = ['company', 'watchlist']