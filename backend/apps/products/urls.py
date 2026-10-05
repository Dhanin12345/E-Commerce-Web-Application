from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    SmartSearchSuggestionsView,
    AIAssistantChatView,
    ProductCompareView
)

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product_list_create'),
    path('search/suggestions/', SmartSearchSuggestionsView.as_view(), name='search_suggestions'),
    path('assistant/', AIAssistantChatView.as_view(), name='ai_assistant'),
    path('compare/', ProductCompareView.as_view(), name='product_compare'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
]
