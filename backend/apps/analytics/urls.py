from django.urls import path
from .views import DashboardKPIView, TopProductsView, OrderRiskMonitoringView, TrackBehaviorEventView

urlpatterns = [
    path('dashboard/', DashboardKPIView.as_view(), name='dashboard_kpi'),
    path('top-products/', TopProductsView.as_view(), name='top_products'),
    path('risk-orders/', OrderRiskMonitoringView.as_view(), name='risk_orders'),
    path('events/', TrackBehaviorEventView.as_view(), name='track_event'),
]
