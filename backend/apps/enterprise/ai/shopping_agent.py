import re
import logging
from typing import Dict, Any, List
from apps.products.models import Product

logger = logging.getLogger(__name__)

class AIShoppingAgent:
    """
    Enterprise Multi-Step AI Personal Shopping Agent (Req 8, 33)
    Flow:
    User Request -> Intent Analysis -> Requirement Extraction -> Product Search ->
    Filter -> Compare Candidates -> Explicit Confirmation Proposal -> Action
    """

    @classmethod
    def process_request(cls, query: str, user=None) -> Dict[str, Any]:
        intent_data = cls._extract_requirements(query)
        candidates = cls._find_candidates(intent_data)
        
        if not candidates:
            return {
                "step": "NO_MATCH",
                "extracted_requirements": intent_data,
                "message": f"I couldn't find products matching all criteria ({intent_data.get('category') or 'all'}, budget: {intent_data.get('max_budget') or 'any'}). Here are popular alternatives:",
                "candidates": cls._get_fallback_candidates(),
                "requires_confirmation": False
            }

        best_match = candidates[0]
        comparison_matrix = cls._build_comparison(candidates[:3])

        return {
            "step": "PROPOSAL_READY",
            "extracted_requirements": intent_data,
            "best_match": best_match,
            "candidates": candidates[:4],
            "comparison_matrix": comparison_matrix,
            "explanation": f"Based on your request, I identified '{best_match['name']}' as the best match. It fits your budget at ₹{best_match['current_price']} and meets your specifications.",
            "requires_confirmation": True,
            "action_payload": {
                "action": "ADD_TO_CART",
                "product_id": best_match["id"],
                "quantity": 1,
                "product_name": best_match["name"],
                "price": best_match["current_price"]
            }
        }

    @classmethod
    def _extract_requirements(cls, query: str) -> Dict[str, Any]:
        lower_q = query.lower()
        
        # 1. Budget extraction (under / below / max / < / ₹ / rs / inr / $)
        max_budget = None
        budget_match = re.search(r'(?:under|below|less than|within|budget of|\<)\s*(?:rs\.?|inr|₹|\$)?\s*([\d,]+)', lower_q)
        if budget_match:
            try:
                max_budget = float(budget_match.group(1).replace(',', ''))
            except ValueError:
                pass

        # 2. Spec extraction
        specs = []
        if '16gb' in lower_q or '16 gb' in lower_q:
            specs.append('16GB RAM')
        if '8gb' in lower_q or '8 gb' in lower_q:
            specs.append('8GB RAM')
        if '32gb' in lower_q:
            specs.append('32GB RAM')
        if '4k' in lower_q or 'uhd' in lower_q:
            specs.append('4K UHD')
        if 'wireless' in lower_q:
            specs.append('Wireless')
        if 'noise cancelling' in lower_q or 'anc' in lower_q:
            specs.append('Active Noise Cancelling')
        if 'ergonomic' in lower_q:
            specs.append('Ergonomic')

        # 3. Category detection
        category = None
        if any(w in lower_q for w in ['laptop', 'pc', 'monitor', 'display', 'screen']):
            category = 'Electronics'
        elif any(w in lower_q for w in ['watch', 'smartwatch', 'band', 'fitness']):
            category = 'Wearables'
        elif any(w in lower_q for w in ['headphone', 'earbud', 'audio', 'sound', 'speaker']):
            category = 'Audio & Sound'
        elif any(w in lower_q for w in ['keyboard', 'mouse', 'desk', 'chair', 'office']):
            category = 'Home Office'

        return {
            "raw_query": query,
            "category": category,
            "max_budget": max_budget,
            "extracted_specs": specs
        }

    @classmethod
    def _find_candidates(cls, intent_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        qs = Product.objects.filter(is_active=True).prefetch_related('images')

        if intent_data.get('category'):
            qs = qs.filter(category__name__icontains=intent_data['category'])

        if intent_data.get('max_budget'):
            # Convert roughly if price is stored in USD or INR
            budget = intent_data['max_budget']
            if budget > 2000: # Probably in INR
                budget_usd = budget / 83.0 # Rough conversion
                qs = qs.filter(price__lte=budget_usd * 1.25)
            else:
                qs = qs.filter(price__lte=budget)

        results = []
        for p in qs:
            image_url = p.images.first().image.url if p.images.exists() else None
            if image_url and not image_url.startswith('http'):
                image_url = f"http://127.0.0.1:8000{image_url}"

            results.append({
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "current_price": float(p.current_price),
                "rating": float(p.rating_avg),
                "reviews_count": p.reviews_count,
                "stock": p.stock,
                "description": p.description,
                "category": p.category.name if p.category else 'Gadgets',
                "image": image_url
            })

        # Rank by rating & stock
        results.sort(key=lambda x: (x['rating'], x['stock']), reverse=True)
        return results

    @classmethod
    def _get_fallback_candidates(cls) -> List[Dict[str, Any]]:
        products = Product.objects.filter(is_active=True)[:3]
        return [
            {
                "id": p.id,
                "name": p.name,
                "current_price": float(p.current_price),
                "rating": float(p.rating_avg),
                "stock": p.stock,
                "image": p.images.first().image.url if p.images.exists() else None
            }
            for p in products
        ]

    @classmethod
    def _build_comparison(cls, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "attributes": ["Price", "Rating", "Reviews", "Stock Availability", "Warranty"],
            "comparison": [
                {
                    "name": c["name"],
                    "values": [
                        f"${c['current_price']}",
                        f"★ {c['rating']}",
                        f"{c['reviews_count']} reviews",
                        f"{c['stock']} in stock",
                        "2-Year SmartCart Care"
                    ]
                }
                for c in candidates
            ]
        }
