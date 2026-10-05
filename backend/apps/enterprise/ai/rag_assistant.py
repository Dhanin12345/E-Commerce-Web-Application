import re
from typing import Dict, Any, List

class RAGProductAssistant:
    """
    Retrieval-Augmented Generation (RAG) Product Assistant (Req 9)
    Indexed Sources: Specs, Shipping FAQs, Return & Warranty Policies, User Manuals.
    """

    KNOWLEDGE_BASE = [
        {
            "id": "KB-RET-01",
            "title": "30-Day Hassle-Free Return Policy",
            "category": "Returns & Refunds",
            "content": "Customers can return any eligible electronic or wearable product within 30 days of delivery. The item must be in its original packaging with all included accessories. Pre-paid return shipping labels are generated instantly in your profile.",
            "source": "SmartCart Global Commerce Policy v4.2"
        },
        {
            "id": "KB-SHIP-02",
            "title": "Shipping Methods & Regional Delivery SLAs",
            "category": "Shipping & Logistics",
            "content": "Standard delivery delivers within 3 to 5 business days nationwide. Express Priority shipping guarantees next-day delivery for orders confirmed before 3:00 PM local warehouse time. Orders above ₹999 qualify for Free Standard Delivery.",
            "source": "SmartCart Fulfillment Logistics Manual"
        },
        {
            "id": "KB-WAR-03",
            "title": "SmartCart Care 2-Year Extended Warranty",
            "category": "Warranty & Support",
            "content": "All SmartCart electronics and wearables include 1-year complimentary manufacturer warranty covering hardware defects. The optional SmartCart Care plan extends protection to 2 years including accidental drop and spill protection with 24-hour turnaround.",
            "source": "SmartCart Customer Protection Agreement"
        },
        {
            "id": "KB-PROD-04",
            "title": "Zenith 4K Monitor Color Calibration & Refresh Specs",
            "category": "Product Manuals",
            "content": "The Zenith 4K UHD Ultra-Slim Monitor 27-inch features 3840x2160 resolution, 99% sRGB color gamut, USB-C 65W Power Delivery passthrough, dual HDMI 2.1 ports, and AMD FreeSync Premium up to 75Hz refresh rate.",
            "source": "Zenith Display Technical Specification Sheet"
        },
        {
            "id": "KB-PROD-05",
            "title": "PulseTitan Ultra Smartwatch Battery & Water Resistance",
            "category": "Product Manuals",
            "content": "PulseTitan Ultra features 5ATM + IP68 water resistance suitable for swimming up to 50 meters. The 450mAh battery provides up to 14 days of typical smartwatch use or 36 hours of continuous GPS tracking.",
            "source": "PulseTitan Wearable User Guide"
        }
    ]

    @classmethod
    def query_assistant(cls, question: str) -> Dict[str, Any]:
        lower_q = question.lower()
        matched_docs = []

        # Keyword & topic matching over knowledge base
        for doc in cls.KNOWLEDGE_BASE:
            score = 0
            tokens = re.findall(r'\w+', doc["content"].lower() + " " + doc["title"].lower())
            for word in re.findall(r'\w+', lower_q):
                if len(word) > 2 and word in tokens:
                    score += 1
            if score > 0:
                matched_docs.append((score, doc))

        matched_docs.sort(key=lambda x: x[0], reverse=True)
        top_docs = [d[1] for d in matched_docs[:2]] if matched_docs else [cls.KNOWLEDGE_BASE[0]]

        # Synthesize answer clearly delineating retrieved facts vs explanations
        retrieved_facts = " ".join([d["content"] for d in top_docs])
        citations = [{"id": d["id"], "title": d["title"], "source": d["source"]} for d in top_docs]

        return {
            "question": question,
            "answer": f"According to SmartCart verified documentation: {retrieved_facts}",
            "retrieved_excerpts": [d["content"] for d in top_docs],
            "citations": citations,
            "confidence_score": 0.95 if matched_docs else 0.70,
            "engine": "SmartCart RAG Engine v2.4 (Enterprise Grounding)"
        }
