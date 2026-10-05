from rest_framework import generics, permissions
from .models import Category
from .serializers import CategorySerializer
from apps.authentication.permissions import IsAdminOrReadOnly

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(parent__isnull=True)
    serializer_class = CategorySerializer
    permission_classes = (IsAdminOrReadOnly,)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = (IsAdminOrReadOnly,)
