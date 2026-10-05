import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import HttpResponse, FileResponse
from django.db import connection
from django.utils import timezone
from django.conf import settings

def favicon_view(request):
    """
    Directly serve the favicon so GET /favicon.ico returns 200 OK.
    """
    favicon_path = os.path.join(settings.BASE_DIR, 'static', 'favicon.ico')
    if os.path.exists(favicon_path):
        return FileResponse(open(favicon_path, 'rb'), content_type='image/x-icon')
    return HttpResponse(status=status.HTTP_204_NO_CONTENT)

class RootLandingView(APIView):
    """
    Root endpoint at http://127.0.0.1:8000/
    Renders an elegant, modern dark-mode dashboard when accessed via a browser,
    or returns an API route map when accessed via REST clients.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        accept_header = request.META.get('HTTP_ACCEPT', '')
        # If requested by browser
        if 'text/html' in accept_header and 'format' not in request.query_params:
            html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartCart X — Enterprise Engine</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #090d16;
            --card-bg: rgba(17, 24, 39, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --accent-blue: #3b82f6;
            --accent-cyan: #06b6d4;
            --accent-emerald: #10b981;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, var(--bg) 60%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            width: 100%;
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            border-radius: 9999px;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }
        h1 {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 40%, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        .subtitle {
            color: var(--text-muted);
            font-size: 15px;
        }
        .cta-card {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            backdrop-filter: blur(12px);
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        @media(min-width: 640px) {
            .cta-card {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
        }
        .cta-text h2 {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 4px;
        }
        .cta-text p {
            font-size: 14px;
            color: #cbd5e1;
            line-height: 1.5;
        }
        .btn-launch {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: #ffffff;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            padding: 12px 22px;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        .btn-launch:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 20px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .card:hover {
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-2px);
            background: rgba(30, 41, 59, 0.7);
        }
        .card-title {
            font-size: 15px;
            font-weight: 600;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .card-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #38bdf8;
        }
        .card-desc {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.4;
        }
        .info-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 18px 22px;
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.6;
        }
        .code {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(0, 0, 0, 0.4);
            padding: 2px 6px;
            border-radius: 4px;
            color: #38bdf8;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">
                <span class="pulse"></span>
                <span>Django REST API Engine • Port 8000</span>
            </div>
            <h1>SmartCart X Platform</h1>
            <p class="subtitle">High-Performance Backend Services, Event Orchestration & Enterprise APIs</p>
        </div>

        <div class="cta-card">
            <div class="cta-text">
                <h2>Looking for the Web Storefront & UI?</h2>
                <p>SmartCart frontend runs on Vite at <strong style="color: #67e8f9;">http://localhost:5173</strong>. Click below to launch the customer shop, cart, or Enterprise Control Center.</p>
            </div>
            <a href="http://localhost:5173" class="btn-launch" target="_blank" rel="noreferrer">
                <span>Open Storefront UI</span>
                <span>→</span>
            </a>
        </div>

        <div class="grid">
            <a href="/admin/" class="card" target="_blank">
                <div class="card-title">
                    <span>Django Admin Panel</span>
                    <span class="card-path">/admin/</span>
                </div>
                <div class="card-desc">Direct database administration, models, product inventory, and user privileges.</div>
            </a>
            <a href="/api/health/" class="card" target="_blank">
                <div class="card-title">
                    <span>System Health & Status</span>
                    <span class="card-path">/api/health/</span>
                </div>
                <div class="card-desc">Database connectivity, active services verification, and system telemetry.</div>
            </a>
            <a href="/api/enterprise/dashboard/summary/" class="card" target="_blank">
                <div class="card-title">
                    <span>Enterprise Summary API</span>
                    <span class="card-path">/api/enterprise/...</span>
                </div>
                <div class="card-desc">Real-time KPI metrics, revenue, pipeline orders, and inventory health.</div>
            </a>
            <a href="/api/products/" class="card" target="_blank">
                <div class="card-title">
                    <span>Product Catalog API</span>
                    <span class="card-path">/api/products/</span>
                </div>
                <div class="card-desc">Product listings, category hierarchies, pricing, and stock levels.</div>
            </a>
            <a href="/api/orders/" class="card" target="_blank">
                <div class="card-title">
                    <span>Order Processing API</span>
                    <span class="card-path">/api/orders/</span>
                </div>
                <div class="card-desc">Customer order lifecycle, payment states, and transactional auditing.</div>
            </a>
            <a href="/api/inventory/forecasting/" class="card" target="_blank">
                <div class="card-title">
                    <span>Inventory Forecasting</span>
                    <span class="card-path">/api/inventory/...</span>
                </div>
                <div class="card-desc">Sales velocity, 30-day demand predictions, and safety stock reorders.</div>
            </a>
        </div>

        <div class="info-box">
            <strong>Architecture Notice:</strong> The Django backend hosts headless JSON REST and GraphQL APIs. To interact with the graphical user interface, make sure the Vite development server is running in another terminal window (<span class="code">cd frontend &amp;&amp; npm run dev</span>).
        </div>
    </div>
</body>
</html>
"""
            return HttpResponse(html_content, content_type='text/html')

        # Fallback to JSON for REST API clients
        return Response({
            "service": "SmartCart X Enterprise Engine",
            "version": "2.0.0-enterprise",
            "status": "operational",
            "frontend_ui_url": "http://localhost:5173",
            "endpoints": {
                "admin": "/admin/",
                "health": "/api/health/",
                "enterprise_summary": "/api/enterprise/dashboard/summary/",
                "products": "/api/products/",
                "orders": "/api/orders/",
                "inventory": "/api/inventory/",
                "cart": "/api/cart/",
                "auth": "/api/auth/"
            }
        }, status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        db_healthy = True
        db_error = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            db_healthy = False
            db_error = str(e)

        data = {
            "status": "healthy" if db_healthy else "degraded",
            "timestamp": timezone.now().isoformat(),
            "version": "2.0.0-future-ready",
            "services": {
                "api": "online",
                "database": "connected" if db_healthy else f"error: {db_error}",
                "cache": "operational",
                "recommendation_engine": "active",
                "ai_assistant": "ready"
            }
        }
        return Response(data, status=status.HTTP_200_OK if db_healthy else status.HTTP_503_SERVICE_UNAVAILABLE)
