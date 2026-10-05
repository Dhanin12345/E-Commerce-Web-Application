from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import HealthCheckView, RootLandingView, favicon_view

urlpatterns = [
    # Root Landing & Favicon
    path('', RootLandingView.as_view(), name='root_landing'),
    path('favicon.ico', favicon_view, name='favicon'),

    path('admin/', admin.site.urls),
    
    # API Health & Observability
    path('api/health/', HealthCheckView.as_view(), name='health_check'),

    # API Endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),

    # Advanced Future Modules
    path('api/recommendations/', include('apps.recommendations.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
    path('api/loyalty/', include('apps.loyalty.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/support/', include('apps.support.urls')),
    path('api/nextgen/', include('apps.nextgen.urls')),
    path('api/enterprise/', include('apps.enterprise.urls')),

    # ============================================================
    # ENTERPRISE API GATEWAY & VERSIONING (Req 2, 3, 4)
    # ============================================================
    # API v1 Gateway
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/cart/', include('apps.cart.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/enterprise/', include('apps.enterprise.urls')),
    path('api/v1/recommendations/', include('apps.recommendations.urls')),
    path('api/v1/graphql/', include('apps.enterprise.urls')),

    # API v2 Gateway (Next-Generation Distributed Services)
    path('api/v2/enterprise/', include('apps.enterprise.urls')),
    path('api/v2/products/', include('apps.products.urls')),
    path('api/v2/orders/', include('apps.orders.urls')),
    path('api/v2/cart/', include('apps.cart.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
