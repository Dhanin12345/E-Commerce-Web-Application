from django.urls import path
from .views import (
    TicketListCreateView,
    TicketDetailView,
    TicketMessageCreateView,
    TicketStatusUpdateView
)

urlpatterns = [
    path('tickets/', TicketListCreateView.as_view(), name='support-ticket-list-create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='support-ticket-detail'),
    path('tickets/<int:pk>/messages/', TicketMessageCreateView.as_view(), name='support-ticket-message-create'),
    path('tickets/<int:pk>/status/', TicketStatusUpdateView.as_view(), name='support-ticket-status-update'),
]
