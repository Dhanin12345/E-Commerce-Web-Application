from django.db import models
from django.contrib.auth.models import User

class CustomerEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='behavior_events')
    event_type = models.CharField(max_length=50) # VIEW, SEARCH, ADD_TO_CART, WISHLIST, CHECKOUT
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} at {self.created_at}"
