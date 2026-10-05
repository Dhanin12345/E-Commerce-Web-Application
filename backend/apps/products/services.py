import re
import difflib
from django.db.models import Q
from .models import Product
from apps.categories.models import Category

class SmartSearchService:
    SYNONYM_MAP = {
        'bluetooh': 'bluetooth',
        'hedphones': 'headphones',
        'headfone': 'headphones',
        'earphone': 'earphones',
        'earbud': 'earbuds',
        'notbook': 'laptop',
        'lap top': 'laptop',
        'laptops': 'laptop',
        'macbok': 'macbook',
        'computr': 'computer',
        'gamming': 'gaming',
        'wirless': 'wireless',
        'wireles': 'wireless',
        'camra': 'camera',
        'fotograpy': 'photography',
        'smartwach': 'smartwatch',
        'bakpack': 'backpack',
        'backpak': 'backpack',
        'bag': 'backpack',
        'cheep': 'budget',
    }

    @classmethod
    def correct_spelling(cls, raw_query):
        words = raw_query.lower().split()
        corrected_words = []
        has_correction = False

        known_vocab = list(cls.SYNONYM_MAP.keys()) + [
            'laptop', 'headphones', 'camera', 'keyboard', 'mouse', 'monitor', 'backpack', 'smartwatch', 'speaker', 'gaming', 'wireless', 'bluetooth'
        ]

        for word in words:
            if word in cls.SYNONYM_MAP:
                corrected_words.append(cls.SYNONYM_MAP[word])
                has_correction = True
            else:
                matches = difflib.get_close_matches(word, known_vocab, n=1, cutoff=0.75)
                if matches and matches[0] != word:
                    # check if match maps to synonym
                    match_term = cls.SYNONYM_MAP.get(matches[0], matches[0])
                    corrected_words.append(match_term)
                    has_correction = True
                else:
                    corrected_words.append(word)

        corrected_query = " ".join(corrected_words)
        return corrected_query, has_correction

    @classmethod
    def extract_price_constraint(cls, query):
        """Extracts 'under 5000', 'under $200', 'less than 100', etc."""
        price_pattern = r'(?:under|below|less than|within|\<)\s*[\$₹€£]?\s*(\d+(?:\.\d+)?)'
        match = re.search(price_pattern, query, re.IGNORECASE)
        max_price = None
        cleaned_query = query
        if match:
            max_price = float(match.group(1))
            cleaned_query = re.sub(price_pattern, '', query, flags=re.IGNORECASE).strip()

        return cleaned_query, max_price

    @classmethod
    def get_smart_suggestions(cls, query):
        if not query or len(query.strip()) < 2:
            return {"suggestions": [], "corrected_query": None, "categories": []}

        corrected_query, has_correction = cls.correct_spelling(query)
        search_term, max_price = cls.extract_price_constraint(corrected_query)

        qs = Product.objects.filter(is_active=True)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # Match titles or descriptions
        matches = qs.filter(
            Q(name__icontains=search_term) |
            Q(description__icontains=search_term) |
            Q(category__name__icontains=search_term)
        )[:6]

        matched_categories = Category.objects.filter(
            name__icontains=search_term
        ).values('id', 'name', 'slug')[:3]

        suggestions = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category.name if p.category else "General",
                "price": float(p.current_price),
                "rating": float(p.rating_avg),
                "in_stock": p.stock > 0
            }
            for p in matches
        ]

        return {
            "query": query,
            "corrected_query": corrected_query if has_correction else None,
            "has_correction": has_correction,
            "price_constraint": max_price,
            "categories": list(matched_categories),
            "suggestions": suggestions
        }


class AIAssistantService:
    @classmethod
    def process_query(cls, user_message):
        raw = user_message.lower().strip()
        cleaned_query, max_price = SmartSearchService.extract_price_constraint(raw)
        corrected_query, _ = SmartSearchService.correct_spelling(cleaned_query)

        qs = Product.objects.filter(is_active=True)

        # Apply price constraint if user specified
        if max_price:
            # Handle currency conversion intuition: if query contains numbers > 1000 without $, assume INR/cents or convert
            qs = qs.filter(price__lte=max_price)

        # Keyword filtering
        keywords = [k for k in corrected_query.split() if len(k) > 2 and k not in ['show', 'find', 'give', 'what', 'which', 'with', 'some', 'need', 'want', 'please', 'the', 'for']]
        
        if keywords:
            q_filter = Q()
            for kw in keywords:
                q_filter |= Q(name__icontains=kw) | Q(description__icontains=kw) | Q(category__name__icontains=kw)
            qs = qs.filter(q_filter)

        results = qs.order_by('-rating_avg', '-reviews_count')[:4]

        # Generate intelligent assistant response
        if results.exists():
            count = results.count()
            top_item = results.first()
            if max_price:
                reply = f"I found {count} great option{'s' if count > 1 else ''} matching '{corrected_query}' under ${max_price:.2f}. The top recommended pick is the **{top_item.name}** rated {top_item.rating_avg}★ for ${top_item.current_price}."
            else:
                reply = f"Here are the top {count} product{'s' if count > 1 else ''} I recommend for '{corrected_query}'. The highest rated choice is **{top_item.name}**."
        else:
            # Fallback recommendations if zero exact match
            fallback = Product.objects.filter(is_active=True).order_by('-rating_avg')[:3]
            results = fallback
            reply = f"I couldn't find an exact match for '{user_message}', but here are our top-rated trending items you might like!"

        product_list = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category.name if p.category else "Electronics",
                "price": float(p.current_price),
                "original_price": float(p.price),
                "rating": float(p.rating_avg),
                "stock": p.stock,
                "description": p.description[:120] + "..." if len(p.description) > 120 else p.description
            }
            for p in results
        ]

        return {
            "reply": reply,
            "extracted_requirements": {
                "keywords": keywords,
                "max_price": max_price,
                "detected_terms": corrected_query
            },
            "products": product_list
        }
