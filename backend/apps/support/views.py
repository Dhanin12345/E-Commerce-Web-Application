from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SupportTicket, TicketMessage, TicketStatus
from .serializers import SupportTicketSerializer, TicketMessageSerializer
from apps.notifications.models import Notification

class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        # Create initial message if provided
        initial_msg = self.request.data.get('initial_message')
        if initial_msg:
            TicketMessage.objects.create(
                ticket=ticket,
                sender=self.request.user,
                message=initial_msg,
                is_admin_reply=False
            )

class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = SupportTicketSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_staff:
            return SupportTicket.objects.all()
        return SupportTicket.objects.filter(user=self.request.user)

class TicketMessageCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.get(id=pk)
            else:
                ticket = SupportTicket.objects.get(id=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message')
        if not message_text:
            return Response({"error": "Message content is required."}, status=status.HTTP_400_BAD_REQUEST)

        is_admin = request.user.is_staff
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            message=message_text,
            is_admin_reply=is_admin
        )

        if is_admin:
            ticket.status = TicketStatus.IN_PROGRESS
            ticket.save()
            Notification.objects.create(
                user=ticket.user,
                title=f"Support Update: {ticket.ticket_number}",
                message=f"A support agent has replied to your ticket '{ticket.subject}'."
            )
        else:
            if ticket.status == TicketStatus.RESOLVED:
                ticket.status = TicketStatus.IN_PROGRESS
                ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)

class TicketStatusUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, pk):
        try:
            if request.user.is_staff:
                ticket = SupportTicket.objects.get(id=pk)
            else:
                ticket = SupportTicket.objects.get(id=pk, user=request.user)
        except SupportTicket.DoesNotExist:
            return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in TicketStatus.values:
            ticket.status = new_status
            ticket.save()
            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)
