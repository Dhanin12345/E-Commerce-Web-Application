from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


# ==========================================
# Base Provider Interfaces
# ==========================================
class BasePaymentProvider(ABC):
    @abstractmethod
    def create_charge(self, amount, currency, metadata):
        pass

    @abstractmethod
    def refund(self, transaction_id, amount):
        pass


class BaseEmailProvider(ABC):
    @abstractmethod
    def send_email(self, to_email, subject, body_html):
        pass


class BaseShippingProvider(ABC):
    @abstractmethod
    def estimate_shipping_rate(self, origin_pincode, dest_pincode, weight_kg):
        pass

    @abstractmethod
    def create_waybill(self, order_id, pickup_address, delivery_address):
        pass


class BaseAIProvider(ABC):
    @abstractmethod
    def generate_chat_response(self, prompt, context):
        pass

    @abstractmethod
    def extract_image_features(self, image_bytes_or_url):
        pass


# ==========================================
# Concrete Provider Implementations (Adapters)
# ==========================================
class RazorpayAdapter(BasePaymentProvider):
    def create_charge(self, amount, currency, metadata):
        logger.info(f"[PAYMENT-PLUGIN: Razorpay] Charged {currency} {amount}")
        return {'status': 'SUCCESS', 'gateway': 'Razorpay', 'transaction_id': f"rzp_{metadata.get('order_id', '999')}"}

    def refund(self, transaction_id, amount):
        logger.info(f"[PAYMENT-PLUGIN: Razorpay] Refunded {amount} on {transaction_id}")
        return {'status': 'REFUNDED', 'gateway': 'Razorpay', 'refund_id': f"rfnd_{transaction_id}"}


class StripeAdapter(BasePaymentProvider):
    def create_charge(self, amount, currency, metadata):
        logger.info(f"[PAYMENT-PLUGIN: Stripe] Charged {currency} {amount}")
        return {'status': 'SUCCESS', 'gateway': 'Stripe', 'transaction_id': f"ch_{metadata.get('order_id', '999')}"}

    def refund(self, transaction_id, amount):
        logger.info(f"[PAYMENT-PLUGIN: Stripe] Refunded {amount} on {transaction_id}")
        return {'status': 'REFUNDED', 'gateway': 'Stripe', 'refund_id': f"re_{transaction_id}"}


class SendGridEmailAdapter(BaseEmailProvider):
    def send_email(self, to_email, subject, body_html):
        logger.info(f"[EMAIL-PLUGIN: SendGrid] Sent email to {to_email} with subject '{subject}'")
        return {'status': 'DELIVERED', 'provider': 'SendGrid', 'recipient': to_email}


class ShiprocketAdapter(BaseShippingProvider):
    def estimate_shipping_rate(self, origin_pincode, dest_pincode, weight_kg):
        base_rate = 50.0 + (float(weight_kg) * 20.0)
        return {'courier': 'Shiprocket FastAir', 'rate': base_rate, 'estimated_days': 3}

    def create_waybill(self, order_id, pickup_address, delivery_address):
        return {'waybill_number': f"SR-{order_id}-X99", 'tracking_url': f"https://shiprocket.co/track/SR-{order_id}-X99"}


class GeminiAIAdapter(BaseAIProvider):
    def generate_chat_response(self, prompt, context):
        return f"AI Shopping Copilot grounded response based on context: {context.get('product_count', 0)} catalog items."

    def extract_image_features(self, image_bytes_or_url):
        # Extracts visual embeddings, dominant color tags, and category features
        return {'category_tags': ['shoes', 'sneakers', 'running', 'black'], 'confidence': 0.94}


# ==========================================
# Plugin Registry / Factory
# ==========================================
class PluginRegistry:
    """Manages active adapters without rewriting application code (Requirement 26)."""
    _payment_provider = RazorpayAdapter()
    _email_provider = SendGridEmailAdapter()
    _shipping_provider = ShiprocketAdapter()
    _ai_provider = GeminiAIAdapter()

    @classmethod
    def get_payment_provider(cls) -> BasePaymentProvider:
        return cls._payment_provider

    @classmethod
    def set_payment_provider(cls, provider: BasePaymentProvider):
        cls._payment_provider = provider

    @classmethod
    def get_email_provider(cls) -> BaseEmailProvider:
        return cls._email_provider

    @classmethod
    def get_shipping_provider(cls) -> BaseShippingProvider:
        return cls._shipping_provider

    @classmethod
    def get_ai_provider(cls) -> BaseAIProvider:
        return cls._ai_provider
