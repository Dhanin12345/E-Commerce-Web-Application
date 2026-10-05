import uuid
from django.db import models
from django.contrib.auth.models import User

class TicketCategory(models.TextChoices):
    ORDER = 'ORDER', 'Order & Delivery'
    PAYMENT = 'PAYMENT', 'Payment & Refund'
    PRODUCT = 'PRODUCT', 'Product Inquiries'
    ACCOUNT = 'ACCOUNT', 'Account & Security'
    GENERAL = 'GENERAL', 'General Feedback'

class TicketPriority(models.TextChoices):
    LOW = 'LOW', 'Low Priority'
    MEDIUM = 'MEDIUM', 'Medium Priority'
    HIGH = 'HIGH', 'High Priority'
    URGENT = 'URGENT', 'Urgent'

class TicketStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'

class SupportTicket(models.Model):
    ticket_number = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=TicketCategory.choices, default=TicketCategory.GENERAL)
    priority = models.CharField(max_length=20, choices=TicketPriority.choices, default=TicketPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TKT-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number} - {self.subject} ({self.status})"

class TicketMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message by {self.sender.username} on {self.ticket.ticket_number}"
