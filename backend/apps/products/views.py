from rest_framework import generics, filters, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer, ProductListSerializer
from .filters import ProductFilter
from .services import SmartSearchService, AIAssistantService
from apps.authentication.permissions import IsAdminOrReadOnly

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_class = ProductFilter
    search_fields = ('name', 'description', 'sku')
    ordering_fields = ('price', 'rating_avg', 'created_at')

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all().select_related('category').prefetch_related('images')
    serializer_class = ProductSerializer
    permission_classes = (IsAdminOrReadOnly,)

class SmartSearchSuggestionsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        query = request.query_params.get('q', '')
        result = SmartSearchService.get_smart_suggestions(query)
        return Response(result, status=status.HTTP_200_OK)

class AIAssistantChatView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        user_message = request.data.get('message', '')
        if not user_message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        response_payload = AIAssistantService.process_query(user_message)
        return Response(response_payload, status=status.HTTP_200_OK)

class ProductCompareView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        if not isinstance(product_ids, list) or len(product_ids) == 0:
            return Response({"error": "Please provide an array of product_ids to compare."}, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(id__in=product_ids[:4], is_active=True).select_related('category').prefetch_related('images')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response({
            "count": len(products),
            "products": serializer.data
        }, status=status.HTTP_200_OK)
