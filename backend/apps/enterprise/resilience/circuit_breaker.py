import time
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

class CircuitBreakerOpenException(Exception):
    pass

class CircuitBreaker:
    STATE_CLOSED = "CLOSED"       # Normal operational state
    STATE_OPEN = "OPEN"           # Failed, fast-fail with graceful fallback
    STATE_HALF_OPEN = "HALF_OPEN" # Testing recovery

    _registry = {}

    def __init__(self, name: str, failure_threshold: int = 3, recovery_time_sec: float = 15.0):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_time_sec = recovery_time_sec
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = self.STATE_CLOSED
        self.total_trips = 0
        CircuitBreaker._registry[name] = self

    def call(self, func: Callable, fallback: Callable = None, *args, **kwargs) -> Any:
        now = time.time()

        # Check if OPEN breaker has cooled down to HALF_OPEN
        if self.state == self.STATE_OPEN:
            if now - self.last_failure_time > self.recovery_time_sec:
                logger.info(f"Circuit Breaker [{self.name}] transitioning OPEN -> HALF_OPEN")
                self.state = self.STATE_HALF_OPEN
            else:
                logger.warning(f"Circuit Breaker [{self.name}] is OPEN. Executing graceful degradation fallback.")
                if fallback:
                    return fallback(*args, **kwargs)
                raise CircuitBreakerOpenException(f"Service {self.name} is currently unavailable.")

        try:
            result = func(*args, **kwargs)
            # Success in HALF_OPEN resets to CLOSED
            if self.state == self.STATE_HALF_OPEN:
                logger.info(f"Circuit Breaker [{self.name}] recovered! HALF_OPEN -> CLOSED")
                self.state = self.STATE_CLOSED
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = now
            logger.error(f"Circuit Breaker [{self.name}] failure recorded ({self.failure_count}/{self.failure_threshold}): {e}")

            if self.failure_count >= self.failure_threshold:
                self.state = self.STATE_OPEN
                self.total_trips += 1
                logger.critical(f"Circuit Breaker [{self.name}] TRIPPED! State is now OPEN.")

            if fallback:
                return fallback(*args, **kwargs)
            raise e

    def force_state(self, new_state: str):
        self.state = new_state
        if new_state == self.STATE_CLOSED:
            self.failure_count = 0

    @classmethod
    def get(cls, name: str):
        if name not in cls._registry:
            cls._registry[name] = CircuitBreaker(name)
        return cls._registry[name]

    @classmethod
    def get_all_statuses(cls):
        return {
            name: {
                "name": cb.name,
                "state": cb.state,
                "failure_count": cb.failure_count,
                "failure_threshold": cb.failure_threshold,
                "total_trips": cb.total_trips,
            }
            for name, cb in cls._registry.items()
        }

# Pre-register default enterprise circuit breakers
cb_recommendations = CircuitBreaker("recommendation_engine", failure_threshold=3, recovery_time_sec=10.0)
cb_ai_agent = CircuitBreaker("ai_shopping_agent", failure_threshold=3, recovery_time_sec=15.0)
cb_shipping = CircuitBreaker("carrier_shipping_api", failure_threshold=4, recovery_time_sec=20.0)
cb_fraud = CircuitBreaker("fraud_risk_service", failure_threshold=3, recovery_time_sec=15.0)

CircuitBreakerRegistry = CircuitBreaker

