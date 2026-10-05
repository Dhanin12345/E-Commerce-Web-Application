from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'username', 'rating', 'title', 'comment', 'is_verified_purchase', 'created_at')
        read_only_fields = ('id', 'user', 'is_verified_purchase', 'created_at')
