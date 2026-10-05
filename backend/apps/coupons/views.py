from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from decimal import Decimal
from .models import Coupon
from .serializers import CouponSerializer, ValidateCouponSerializer
from apps.authentication.permissions import IsAdminOrReadOnly

class CouponListCreateView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = (IsAdminOrReadOnly,)

class ValidateCouponView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ValidateCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].strip().upper()
        subtotal = serializer.validated_data.get('subtotal', Decimal('0.00'))

        coupon = Coupon.objects.filter(code=code).first()
        if not coupon:
            return Response({"error": "Invalid promo code."}, status=status.HTTP_404_NOT_FOUND)

        is_valid, message = coupon.is_valid(subtotal)
        if not is_valid:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = (subtotal * coupon.discount_percentage) / Decimal('100.00')

        return Response({
            "code": coupon.code,
            "discount_percentage": coupon.discount_percentage,
            "discount_amount": round(discount_amount, 2),
            "message": message
        }, status=status.HTTP_200_OK)
