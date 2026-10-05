from rest_framework import generics, permissions
from django.contrib.auth.models import User
from apps.authentication.serializers import UserSerializer
from .models import UserProfile, Address
from .serializers import UserProfileSerializer, AddressSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AuditLogListView(generics.ListAPIView):
    permission_classes = (permissions.IsAdminUser,)

    def get_serializer_class(self):
        from .serializers import AuditLogSerializer
        return AuditLogSerializer

    def get_queryset(self):
        from .models import AuditLog
        return AuditLog.objects.all().select_related('user')[:50]

