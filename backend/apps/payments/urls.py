from django.urls import path
from .views import ProcessPaymentView, PaymentDetailView

urlpatterns = [
    path('process/', ProcessPaymentView.as_view(), name='payment_process'),
    path('<str:order_number>/', PaymentDetailView.as_view(), name='payment_detail'),
]
