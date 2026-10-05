from django.urls import path
from .views import WishlistListView, ToggleWishlistView

urlpatterns = [
    path('', WishlistListView.as_view(), name='wishlist_list'),
    path('toggle/', ToggleWishlistView.as_view(), name='wishlist_toggle'),
]
