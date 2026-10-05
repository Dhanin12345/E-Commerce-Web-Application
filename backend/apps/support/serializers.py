from rest_framework import serializers
from .models import SupportTicket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ('id', 'ticket', 'sender', 'sender_name', 'message', 'is_admin_reply', 'created_at')
        read_only_fields = ('id', 'sender', 'sender_name', 'is_admin_reply', 'created_at')

class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SupportTicket
        fields = ('id', 'ticket_number', 'user', 'user_name', 'subject', 'category', 'priority', 'status', 'messages', 'created_at', 'updated_at')
        read_only_fields = ('id', 'ticket_number', 'user', 'user_name', 'created_at', 'updated_at')
