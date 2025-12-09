from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WatchlistViewSet

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'', WatchlistViewSet, basename='watchlist')

urlpatterns = [
    # This includes the router URLs (e.g., /api/watchlists/, /api/watchlists/1/)
    path('', include(router.urls)),
]