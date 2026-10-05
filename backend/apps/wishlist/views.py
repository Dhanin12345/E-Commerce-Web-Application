from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import WishlistItem
from .serializers import WishlistItemSerializer

class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

class ToggleWishlistView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "product_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        existing = WishlistItem.objects.filter(user=request.user, product_id=product_id).first()
        if existing:
            existing.delete()
            return Response({"detail": "Removed from wishlist.", "is_saved": False}, status=status.HTTP_200_OK)
        else:
            WishlistItem.objects.create(user=request.user, product_id=product_id)
            return Response({"detail": "Added to wishlist.", "is_saved": True}, status=status.HTTP_201_CREATED)
