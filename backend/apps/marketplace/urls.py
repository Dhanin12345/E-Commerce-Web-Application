from django.urls import path
from .views import (
    SellerListView,
    SellerRegisterView,
    SellerDashboardView,
    AdminSellerListView,
    AdminSellerModerateView
)

urlpatterns = [
    path('sellers/', SellerListView.as_view(), name='marketplace-sellers-list'),
    path('register/', SellerRegisterView.as_view(), name='marketplace-register'),
    path('dashboard/', SellerDashboardView.as_view(), name='marketplace-dashboard'),
    path('admin/sellers/', AdminSellerListView.as_view(), name='admin-sellers-list'),
    path('admin/sellers/<int:pk>/moderate/', AdminSellerModerateView.as_view(), name='admin-sellers-moderate'),
]
