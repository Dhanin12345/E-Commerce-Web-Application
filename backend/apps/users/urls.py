from django.urls import path
from .views import UserProfileView, AddressListCreateView, AddressDetailView, UserListView, AuditLogListView

urlpatterns = [
    path('', UserListView.as_view(), name='user_list'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('addresses/', AddressListCreateView.as_view(), name='user_addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='user_address_detail'),
    path('audit-logs/', AuditLogListView.as_view(), name='audit_logs'),
]

