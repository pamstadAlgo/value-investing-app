from django.urls import path
from . import views

# StocksFilterQueryOptimizedAPIView

urlpatterns = [
    # path("filter-query/", views.StocksFilterQueryAPIView.as_view()),
    path("filter-query/", views.StocksFilterQueryOptimizedAPIView.as_view()),
    path("nr-of-filtered-stocks/", views.StocksFilterNumberOfStocksAPIView.as_view()),
    path("filter-quantities/", views.StockFilterAvailableQuantitiesAPIView.as_view()),
    path("compute-epv/", views.ComputeEPVAPIView.as_view()),
    path("epv-fundamentals/", views.EPVFundamentalsAPIView.as_view()),
    path("equity-value-penman/", views.ComputeEquityValuePenmanAPIView.as_view()),
    path("custom-metrics/", views.CustomMetricsAPIView.as_view()),
    path("filter-view/", views.FilterViewsAPIView.as_view()),
    path("charfield-filter-options/", views.CharFieldFilterOptionsAPIView.as_view()),
    path("add-column/", views.AddColumn.as_view()),
    path("get-ticker-symbols/", views.TickerSymbols.as_view()),
    path("last-close-price/<str:qfs_symbol>/", views.LastClosePriceAPIView.as_view()),
    path("micropcapclub-profiles/", views.MicroCapClubProfiles.as_view()),
    path("pybind-example/", views.PyBindExample.as_view())   
]