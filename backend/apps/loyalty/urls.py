from django.urls import path
from .views import LoyaltyProfileView, LoyaltyRedeemView

urlpatterns = [
    path('me/', LoyaltyProfileView.as_view(), name='loyalty-me'),
    path('redeem/', LoyaltyRedeemView.as_view(), name='loyalty-redeem'),
]
