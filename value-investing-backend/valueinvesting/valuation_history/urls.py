from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ValuationSnapshotViewSet

router = DefaultRouter()
router.register(r'snapshots', ValuationSnapshotViewSet, basename='valuation-snapshots')

urlpatterns = [
    path('', include(router.urls)),
]