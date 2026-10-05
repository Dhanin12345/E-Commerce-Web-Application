from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.products.serializers import ProductListSerializer
from .services import RecommendationService

class PersonalizedRecommendationsView(APIView):
    def get(self, request):
        products = RecommendationService.get_personalized(request.user, limit=6)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class SimilarProductsView(APIView):
    def get(self, request, product_id):
        products = RecommendationService.get_similar(product_id, limit=4)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class TrendingProductsView(APIView):
    def get(self, request):
        products = RecommendationService.get_trending(limit=6)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class FrequentlyBoughtView(APIView):
    def get(self, request, product_id):
        products = RecommendationService.get_frequently_bought_together(product_id, limit=3)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
