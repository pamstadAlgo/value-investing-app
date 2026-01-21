from django.urls import path
from . import views

urlpatterns = [
    path('snapshots/', views.ValuationSnapshotListAPIView.as_view(), name='valuation-snapshots-list'),
    path('snapshots/<int:pk>/', views.ValuationSnapshotDetailAPIView.as_view(), name='valuation-snapshots-detail'),
    path('snapshots/my_history/', views.UserValuationHistoryAPIView.as_view(), name='valuation-snapshots-my-history'),
]