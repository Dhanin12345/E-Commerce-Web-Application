from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import LoyaltyAccount
from .serializers import LoyaltyAccountSerializer
from apps.coupons.models import Coupon
from django.utils import timezone
import datetime
import uuid

class LoyaltyProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        account, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        serializer = LoyaltyAccountSerializer(account)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LoyaltyRedeemView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        points_to_redeem = int(request.data.get('points', 100))
        if points_to_redeem < 50:
            return Response({"error": "Minimum redemption is 50 points ($5 reward)."}, status=status.HTTP_400_BAD_REQUEST)

        account, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        if account.points_balance < points_to_redeem:
            return Response({"error": "Insufficient points balance."}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct points
        dollar_discount = round(points_to_redeem * 0.10, 2)
        account.redeem_points(points_to_redeem, f"Redeemed ${dollar_discount} coupon")

        # Generate a personalized coupon code for the customer!
        code = f"REWARD-{uuid.uuid4().hex[:6].upper()}"
        expires_at = timezone.now() + datetime.timedelta(days=30)
        Coupon.objects.create(
            code=code,
            discount_type='FIXED',
            discount_value=dollar_discount,
            min_order_amount=dollar_discount * 1.5,
            valid_from=timezone.now(),
            valid_to=expires_at,
            is_active=True
        )

        return Response({
            "detail": f"Successfully redeemed {points_to_redeem} points for a ${dollar_discount} discount voucher!",
            "coupon_code": code,
            "discount_value": dollar_discount,
            "new_balance": account.points_balance
        }, status=status.HTTP_200_OK)
