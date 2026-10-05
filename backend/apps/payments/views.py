from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import PaymentSerializer, ProcessPaymentRequestSerializer
from .services import PaymentService
from apps.orders.models import Order

class ProcessPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ProcessPaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = get_object_or_404(Order, order_number=data['order_number'], user=request.user)
        payment = PaymentService.process_payment(order=order, payment_method=data['payment_method'])

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)

class PaymentDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, order_number):
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        payment = get_object_or_404(Payment, order=order)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)
