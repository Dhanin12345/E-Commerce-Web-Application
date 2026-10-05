from django.urls import path
from .views import (
    OrderListView,
    OrderDetailView,
    CreateOrderView,
    OrderTimelineView,
    DeliveryTrackingView,
    UpdateShipmentStatusView,
    OrderReturnRequestView,
    OrderReturnListView,
    OrderReturnModerateView,
    OrderDigitalInvoiceView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('create/', CreateOrderView.as_view(), name='order_create'),
    path('returns/list/', OrderReturnListView.as_view(), name='order_return_list'),
    path('returns/<int:pk>/moderate/', OrderReturnModerateView.as_view(), name='order_return_moderate'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/timeline/', OrderTimelineView.as_view(), name='order_timeline'),
    path('<str:order_number>/tracking/', DeliveryTrackingView.as_view(), name='order_tracking'),
    path('<str:order_number>/update-shipment/', UpdateShipmentStatusView.as_view(), name='order_update_shipment'),
    path('<str:order_number>/return/', OrderReturnRequestView.as_view(), name='order_return_request'),
    path('<str:order_number>/invoice/', OrderDigitalInvoiceView.as_view(), name='order_digital_invoice'),
]
