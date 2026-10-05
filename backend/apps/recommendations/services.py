from django.db.models import Count, Q, Avg
from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from apps.cart.models import CartItem
from apps.wishlist.models import WishlistItem

class RecommendationService:
    @staticmethod
    def get_personalized(user, limit=6):
        """
        Recommends products based on user orders, cart items, and wishlist categories.
        Falls back to high-rated/trending products for guests or new accounts.
        """
        if user and user.is_authenticated:
            category_ids = set()
            
            ordered_cat_ids = OrderItem.objects.filter(
                order__user=user
            ).values_list('product__category_id', flat=True)
            category_ids.update([cid for cid in ordered_cat_ids if cid])

            wishlist_cat_ids = WishlistItem.objects.filter(
                user=user
            ).values_list('product__category_id', flat=True)
            category_ids.update([cid for cid in wishlist_cat_ids if cid])

            cart_cat_ids = CartItem.objects.filter(
                cart__user=user
            ).values_list('product__category_id', flat=True)
            category_ids.update([cid for cid in cart_cat_ids if cid])

            if category_ids:
                recommended = Product.objects.filter(
                    category_id__in=category_ids,
                    is_active=True
                ).order_by('-rating_avg', '-reviews_count')[:limit]
                if recommended.count() >= 3:
                    return recommended

        return Product.objects.filter(is_active=True).order_by('-rating_avg', '-reviews_count', '-created_at')[:limit]

    @staticmethod
    def get_similar(product_id, limit=4):
        """
        Recommends products in the same category or matching price range.
        """
        try:
            target_product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Product.objects.filter(is_active=True)[:limit]

        similar = Product.objects.filter(
            category=target_product.category,
            is_active=True
        ).exclude(id=target_product.id).order_by('-rating_avg')[:limit]

        if similar.count() < limit:
            min_price = float(target_product.price) * 0.7
            max_price = float(target_product.price) * 1.3
            extra = Product.objects.filter(
                price__gte=min_price,
                price__lte=max_price,
                is_active=True
            ).exclude(id=target_product.id).exclude(id__in=[p.id for p in similar])[:limit - similar.count()]
            return list(similar) + list(extra)
        return similar
    @staticmethod
    def get_trending(limit=6):
        """
        Products with highest reviews count and rating >= 4.0
        """
        return Product.objects.filter(is_active=True).order_by('-reviews_count', '-rating_avg')[:limit]

    @staticmethod
    def get_frequently_bought_together(product_id, limit=3):
        """
        Products frequently purchased in the same orders as the given product.
        """
        order_ids = OrderItem.objects.filter(product_id=product_id).values_list('order_id', flat=True)
        
        if order_ids:
            frequent_product_ids = OrderItem.objects.filter(
                order_id__in=order_ids
            ).exclude(product_id=product_id).values(
                'product_id'
            ).annotate(count=Count('id')).order_by('-count')[:limit]

            p_ids = [item['product_id'] for item in frequent_product_ids if item['product_id']]
            if p_ids:
                return Product.objects.filter(id__in=p_ids, is_active=True)
        return RecommendationService.get_similar(product_id, limit=limit)
