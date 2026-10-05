from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SellerProfile, SellerSettlement
from .serializers import SellerProfileSerializer, SellerSettlementSerializer
from apps.notifications.models import Notification

class SellerListView(generics.ListAPIView):
    """Public list of approved marketplace sellers."""
    queryset = SellerProfile.objects.filter(is_approved=True)
    serializer_class = SellerProfileSerializer
    permission_classes = (permissions.AllowAny,)

class SellerRegisterView(APIView):
    """Customer applies to become a seller."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        if hasattr(request.user, 'seller_profile'):
            return Response({"detail": "You already have a seller application on file."}, status=status.HTTP_400_BAD_REQUEST)

        store_name = request.data.get('store_name')
        business_email = request.data.get('business_email')
        phone = request.data.get('phone', '')
        description = request.data.get('description', '')

        if not store_name or not business_email:
            return Response({"error": "Store name and business email are required."}, status=status.HTTP_400_BAD_REQUEST)

        profile = SellerProfile.objects.create(
            user=request.user,
            store_name=store_name,
            business_email=business_email,
            phone=phone,
            description=description,
            is_approved=False
        )

        return Response({
            "detail": "Seller application submitted! Our admin team will review and approve your store.",
            "seller": SellerProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)

class SellerDashboardView(APIView):
    """View metrics, products, and settlements for current seller."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if not hasattr(request.user, 'seller_profile'):
            return Response({"error": "You do not have a seller profile."}, status=status.HTTP_403_FORBIDDEN)

        seller = request.user.seller_profile
        settlements = SellerSettlement.objects.filter(seller=seller)[:10]

        return Response({
            "seller_profile": SellerProfileSerializer(seller).data,
            "recent_settlements": SellerSettlementSerializer(settlements, many=True).data,
            "commission_rate": f"{seller.commission_pct}%",
            "net_revenue": float(seller.total_sales) * (1 - float(seller.commission_pct) / 100)
        }, status=status.HTTP_200_OK)

class AdminSellerListView(generics.ListAPIView):
    """Admin view of all seller applications (pending & approved)."""
    queryset = SellerProfile.objects.all().order_by('-created_at')
    serializer_class = SellerProfileSerializer
    permission_classes = (permissions.IsAdminUser,)

class AdminSellerModerateView(APIView):
    """Admin approves or modifies seller commission."""
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk):
        try:
            seller = SellerProfile.objects.get(id=pk)
        except SellerProfile.DoesNotExist:
            return Response({"error": "Seller not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action', 'APPROVE')
        commission = request.data.get('commission_pct')

        if commission is not None:
            seller.commission_pct = commission

        if action == 'APPROVE':
            seller.is_approved = True
            seller.save()
            Notification.objects.create(
                user=seller.user,
                title="Seller Account Approved!",
                message=f"Congratulations! Your store '{seller.store_name}' is approved for the SmartCart Marketplace."
            )
            return Response({"detail": f"Store {seller.store_name} has been approved."}, status=status.HTTP_200_OK)
        elif action == 'REJECT':
            seller.is_approved = False
            seller.save()
            return Response({"detail": f"Store {seller.store_name} has been rejected."}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
