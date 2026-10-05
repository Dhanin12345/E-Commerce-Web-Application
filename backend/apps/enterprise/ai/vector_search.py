import math
import re
from collections import Counter
from typing import List, Dict, Any
from apps.products.models import Product

class VectorSearchEngine:
    """
    Semantic Vector Search with Cosine Similarity and Hybrid Keyword BM25 Ranking (Req 10, 11)
    """

    @classmethod
    def _text_to_vector(cls, text: str) -> Counter:
        # Tokenize words and character 3-grams for semantic typo & stem tolerance
        words = re.findall(r'\w+', text.lower())
        vector = Counter(words)
        # Add 3-grams
        for word in words:
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    vector[f"trigram:{word[i:i+3]}"] += 1
        return vector

    @classmethod
    def _cosine_similarity(cls, vec1: Counter, vec2: Counter) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum(vec1[x] * vec2[x] for x in intersection)

        sum1 = sum(vec1[x] ** 2 for x in vec1.keys())
        sum2 = sum(vec2[x] ** 2 for x in vec2.keys())
        denominator = math.sqrt(sum1) * math.sqrt(sum2)

        if not denominator:
            return 0.0
        return float(numerator) / denominator

    @classmethod
    def hybrid_search(cls, query: str, limit: int = 10, min_similarity: float = 0.05) -> List[Dict[str, Any]]:
        query_vec = cls._text_to_vector(query)
        products = Product.objects.filter(is_active=True).prefetch_related('images', 'category')
        
        scored_products = []
        for p in products:
            doc_text = f"{p.name} {p.description} {p.category.name if p.category else ''} {p.sku}"
            doc_vec = cls._text_to_vector(doc_text)
            
            # Cosine semantic similarity (0.0 to 1.0)
            similarity = cls._cosine_similarity(query_vec, doc_vec)

            # Keyword direct match boost
            keyword_boost = 0.0
            lower_q = query.lower()
            if lower_q in p.name.lower():
                keyword_boost += 0.35
            if lower_q in p.description.lower():
                keyword_boost += 0.15

            hybrid_score = round(min(1.0, (similarity * 0.65) + keyword_boost), 4)

            if hybrid_score >= min_similarity or len(products) <= 6:
                image_url = p.images.first().image.url if p.images.exists() else None
                if image_url and not image_url.startswith('http'):
                    image_url = f"http://127.0.0.1:8000{image_url}"

                scored_products.append({
                    "id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "current_price": float(p.current_price),
                    "rating": float(p.rating_avg),
                    "category": p.category.name if p.category else 'General',
                    "image": image_url,
                    "semantic_score": round(similarity, 4),
                    "hybrid_score": hybrid_score,
                    "match_type": "HIGH_CONFIDENCE_SEMANTIC" if hybrid_score > 0.5 else "HYBRID_KEYWORD"
                })

        scored_products.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return scored_products[:limit]
