import time
import uuid
import threading
from django.utils.deprecation import MiddlewareMixin
from collections import deque

# Global thread-safe metrics collector
class GatewayMetricsCollector:
    _lock = threading.Lock()
    total_requests = 0
    total_errors = 0
    latency_samples = deque(maxlen=500)
    status_distribution = {}
    active_requests = 0

    @classmethod
    def record_request(cls, duration_ms, status_code):
        with cls._lock:
            cls.total_requests += 1
            if status_code >= 400:
                cls.total_errors += 1
            cls.latency_samples.append(duration_ms)
            cls.status_distribution[status_code] = cls.status_distribution.get(status_code, 0) + 1

    @classmethod
    def get_summary(cls):
        with cls._lock:
            samples = list(cls.latency_samples)
            count = len(samples)
            if count == 0:
                p50, p95, p99, avg_lat = 0, 0, 0, 0
            else:
                sorted_samples = sorted(samples)
                p50 = sorted_samples[int(count * 0.50)]
                p95 = sorted_samples[min(int(count * 0.95), count - 1)]
                p99 = sorted_samples[min(int(count * 0.99), count - 1)]
                avg_lat = sum(samples) / count

            error_rate = (cls.total_errors / cls.total_requests * 100) if cls.total_requests > 0 else 0.0

            return {
                "total_requests": cls.total_requests,
                "total_errors": cls.total_errors,
                "error_rate_pct": round(error_rate, 2),
                "avg_latency_ms": round(avg_lat, 2),
                "p50_latency_ms": round(p50, 2),
                "p95_latency_ms": round(p95, 2),
                "p99_latency_ms": round(p99, 2),
                "status_distribution": dict(cls.status_distribution),
                "gateway_status": "HEALTHY" if error_rate < 5.0 else "DEGRADED",
            }

class DistributedTracingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.perf_counter()
        
        # 1. Propagate or generate correlation & trace IDs
        correlation_id = request.headers.get('X-Correlation-ID') or str(uuid.uuid4())
        trace_id = request.headers.get('X-Trace-ID') or uuid.uuid4().hex[:16]
        span_id = uuid.uuid4().hex[:8]

        request.correlation_id = correlation_id
        request.trace_id = trace_id
        request.span_id = span_id

    def process_response(self, request, response):
        if not hasattr(request, 'start_time'):
            return response

        duration_ms = (time.perf_counter() - request.start_time) * 1000.0
        GatewayMetricsCollector.record_request(duration_ms, response.status_code)

        # Attach telemetry headers
        response['X-Correlation-ID'] = getattr(request, 'correlation_id', '')
        response['X-Trace-ID'] = getattr(request, 'trace_id', '')
        response['X-Span-ID'] = getattr(request, 'span_id', '')
        response['X-Response-Time-Ms'] = f"{duration_ms:.2f}"
        response['X-Gateway-Engine'] = 'SmartCartX-API-Gateway/v2'

        # Record sample trace asynchronously or non-blocking
        if request.path.startswith('/api/'):
            try:
                from apps.enterprise.models import TraceSpan
                # Log trace record sample
                TraceSpan.objects.create(
                    trace_id=request.trace_id,
                    span_id=request.span_id,
                    service_name='api-gateway',
                    endpoint=request.path,
                    http_method=request.method,
                    status_code=response.status_code,
                    duration_ms=round(duration_ms, 2)
                )
            except Exception:
                pass

        return response
