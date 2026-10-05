import logging
from django.db.models import Sum, Count, Avg
from apps.products.models import Product
from apps.orders.models import Order

logger = logging.getLogger(__name__)

class QueryHandler:
    @classmethod
    def execute_product_search(cls, query: str, category_id: int | None = None, min_price: float | None = None, max_price: float | None = None, limit: int = 10) -> dict:
        """
        CQRS Query: Optimized product search read model with hybrid ranking
        """
        qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
        
        if query:
            qs = qs.filter(name__icontains=query) | qs.filter(description__icontains=query)

        if category_id:
            qs = qs.filter(category_id=category_id)
        if min_price is not None:
            qs = qs.filter(price__gte=min_price)
        if max_price is not None:
            qs = qs.filter(price__lte=max_price)

        total_matches = qs.count()
        results = []
        for p in qs[:limit]:
            results.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": float(p.price),
                "current_price": float(p.current_price),
                "rating_avg": float(p.rating_avg),
                "reviews_count": p.reviews_count,
                "stock": p.stock,
                "is_in_stock": p.is_in_stock,
                "category": p.category.name if p.category else None,
                "image": p.images.first().image.url if p.images.exists() else None
            })

        return {
            "query": query,
            "total_matches": total_matches,
            "results": results
        }

    @classmethod
    def execute_analytics_summary(cls) -> dict:
        """
        CQRS Query: Read model for enterprise real-time commerce metrics
        """
        total_revenue = Order.objects.filter(status__in=['PAID', 'DELIVERED', 'SHIPPED']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0.0
        total_orders = Order.objects.count()
        delivered_orders = Order.objects.filter(status='DELIVERED').count()
        avg_order_value = Order.objects.aggregate(Avg('total_amount'))['total_amount__avg'] or 0.0

        return {
            "total_revenue": round(float(total_revenue), 2),
            "total_orders": total_orders,
            "delivered_orders": delivered_orders,
            "fulfillment_rate_pct": round((delivered_orders / total_orders * 100), 1) if total_orders > 0 else 100.0,
            "avg_order_value": round(float(avg_order_value), 2)
        }
