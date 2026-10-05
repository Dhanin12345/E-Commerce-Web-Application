from rest_framework import generics, permissions
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewSerializer
from apps.products.models import Product

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = Review.objects.all().select_related('user')
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        # Recalculate product aggregate ratings
        product = review.product
        stats = Review.objects.filter(product=product).aggregate(avg=Avg('rating'), count=Count('id'))
        product.rating_avg = stats['avg'] or 0.00
        product.reviews_count = stats['count'] or 0
        product.save(update_fields=['rating_avg', 'reviews_count'])

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return Review.objects.all()
