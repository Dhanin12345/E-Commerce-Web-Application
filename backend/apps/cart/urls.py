from django.urls import path
from .views import CartView, AddToCartView, CartItemUpdateDeleteView, ClearCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart_detail'),
    path('items/', AddToCartView.as_view(), name='cart_add_item'),
    path('items/<int:pk>/', CartItemUpdateDeleteView.as_view(), name='cart_item_update_delete'),
    path('clear/', ClearCartView.as_view(), name='cart_clear'),
]
