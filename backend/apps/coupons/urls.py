from django.urls import path
from .views import CouponListCreateView, ValidateCouponView

urlpatterns = [
    path('', CouponListCreateView.as_view(), name='coupon_list_create'),
    path('validate/', ValidateCouponView.as_view(), name='coupon_validate'),
]
