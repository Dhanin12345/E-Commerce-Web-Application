from django.urls import path
from .views import (
    PersonalizedRecommendationsView,
    SimilarProductsView,
    TrendingProductsView,
    FrequentlyBoughtView
)

urlpatterns = [
    path('', PersonalizedRecommendationsView.as_view(), name='recommendations-personalized'),
    path('similar/<int:product_id>/', SimilarProductsView.as_view(), name='recommendations-similar'),
    path('trending/', TrendingProductsView.as_view(), name='recommendations-trending'),
    path('frequently-bought/<int:product_id>/', FrequentlyBoughtView.as_view(), name='recommendations-frequently-bought'),
]
