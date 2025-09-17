from django.urls import path
from . import views

urlpatterns = [
    path("gpm/", views.GrossProfitMarginAPIView.as_view()),
    path("sgam/", views.SellingGeneralAdminMarginAPIView.as_view()),
    path("radm/", views.ResearchAndDevelopMarginAPIView.as_view()),
    path("daam/", views.DeprecAndAmortMarginAPIView.as_view()),
    path("nim/", views.NetIncomeMarginAPIView.as_view()),
    path("roa/", views.ReturnOnTotalAssetsAPIView.as_view()),
    path("tta/", views.TotalAssetsAPIView.as_view()),
    path("roe/", views.ReturnOnStockholderEquityAPIView.as_view()),
    path("current-ratio/", views.CurrentAssetsToCurrentLiabilitiesAPIView.as_view()),
    path("cash-ratio/", views.CashAndEquityToCurrentLiabilitiesAPIView.as_view()),
    path("debt-to-equity/", views.TotalDebtToEquityAPIView.as_view()),
    path("adj-debt-to-equity/", views.AdjTotalDebtToEquityAPIView.as_view()),
    path("interest-margin/", views.InterestExpenseToEBITAPIView.as_view()),
    path("cash-to-debt/", views.CashAndEquivToDebtAPIView.as_view()),
    path("debt-to-netincome/", views.LongTermDebtToNetIncomeAPIView.as_view()),
    path("short-to-long-debt/", views.ShortToLongDebtAPIView.as_view()),

]
