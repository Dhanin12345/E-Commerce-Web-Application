import re
import logging
from typing import Dict, Any
from apps.products.models import Product
from apps.enterprise.models import Warehouse, AIModelRegistry
from apps.enterprise.cqrs.queries import QueryHandler

logger = logging.getLogger(__name__)

class SimpleGraphQLEngine:
    """
    Selective Enterprise GraphQL Executor (Req 4)
    Executes selective graph queries for products, warehouses, and real-time analytics.
    """

    @classmethod
    def execute(cls, query_string: str) -> Dict[str, Any]:
        data = {}
        errors = []

        clean_query = query_string.strip()

        # Parse requested root fields
        if 'products' in clean_query:
            try:
                products = Product.objects.filter(is_active=True)[:10]
                data['products'] = [
                    {
                        "id": p.id,
                        "name": p.name,
                        "slug": p.slug,
                        "price": float(p.price),
                        "current_price": float(p.current_price),
                        "rating": float(p.rating_avg),
                        "stock": p.stock,
                        "category": p.category.name if p.category else None
                    }
                    for p in products
                ]
            except Exception as e:
                errors.append(f"products query error: {str(e)}")

        if 'warehouses' in clean_query:
            try:
                whs = Warehouse.objects.filter(is_active=True)
                data['warehouses'] = [
                    {
                        "id": w.id,
                        "code": w.code,
                        "name": w.name,
                        "city": w.city,
                        "state": w.state,
                        "capacity": w.capacity_units
                    }
                    for w in whs
                ]
            except Exception as e:
                errors.append(f"warehouses query error: {str(e)}")

        if 'analytics' in clean_query:
            try:
                data['analytics'] = QueryHandler.execute_analytics_summary()
            except Exception as e:
                errors.append(f"analytics query error: {str(e)}")

        if 'aiModels' in clean_query:
            try:
                models = AIModelRegistry.objects.all()
                data['aiModels'] = [
                    {
                        "model_id": m.model_id,
                        "name": m.name,
                        "version": m.version,
                        "status": m.status,
                        "metrics": m.evaluation_metrics
                    }
                    for m in models
                ]
            except Exception as e:
                errors.append(f"aiModels query error: {str(e)}")

        return {
            "data": data,
            "errors": errors if errors else None
        }
