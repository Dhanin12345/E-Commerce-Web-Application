from django.contrib.auth.models import User
from .models import Notification

class NotificationService:
    @staticmethod
    def send_notification(user: User, title: str, message: str) -> Notification:
        # In production this can trigger WebSocket pushes (Channels) or Email/SMS (Twilio/SendGrid)
        return Notification.objects.create(
            user=user,
            title=title,
            message=message
        )
