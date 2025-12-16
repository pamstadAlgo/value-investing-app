from django.urls import path
from . import views

urlpatterns = [
    path('', views.WatchlistListAPIView.as_view(), name='watchlist-list'),
    path('<int:pk>/', views.WatchlistDetailAPIView.as_view(), name='watchlist-detail'),
    path('<int:pk>/add_stock/', views.WatchlistAddStockAPIView.as_view(), name='watchlist-add-stock'),
    path('<int:pk>/remove_stock/', views.WatchlistRemoveStockAPIView.as_view(), name='watchlist-remove-stock'),
    path('<int:pk>/share/', views.WatchlistShareAPIView.as_view(), name='watchlist-share'),
]