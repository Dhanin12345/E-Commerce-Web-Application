from django.urls import path
from .views import (
    InventoryLogListView,
    AdjustStockView,
    DemandForecastingView,
    DynamicPricingRuleListCreateView,
    DynamicPricingRuleDeleteView,
    ApplyDynamicPricingView
)

urlpatterns = [
    path('logs/', InventoryLogListView.as_view(), name='inventory_logs'),
    path('adjust/', AdjustStockView.as_view(), name='inventory_adjust'),
    path('forecasting/', DemandForecastingView.as_view(), name='inventory_forecasting'),
    path('dynamic-pricing/', DynamicPricingRuleListCreateView.as_view(), name='dynamic_pricing_list_create'),
    path('dynamic-pricing/<int:pk>/', DynamicPricingRuleDeleteView.as_view(), name='dynamic_pricing_delete'),
    path('dynamic-pricing/apply/', ApplyDynamicPricingView.as_view(), name='dynamic_pricing_apply'),
]
