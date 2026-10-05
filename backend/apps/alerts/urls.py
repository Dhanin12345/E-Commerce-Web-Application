from django.urls import path
from .views import (
    PriceAlertListCreateView,
    PriceAlertDeleteView,
    StockAlertCreateView,
    CheckPriceAlertsView
)

urlpatterns = [
    path('price/', PriceAlertListCreateView.as_view(), name='price-alert-list-create'),
    path('price/<int:pk>/', PriceAlertDeleteView.as_view(), name='price-alert-delete'),
    path('stock/', StockAlertCreateView.as_view(), name='stock-alert-create'),
    path('check-prices/', CheckPriceAlertsView.as_view(), name='check-price-alerts'),
]
