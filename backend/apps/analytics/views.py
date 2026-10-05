from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .services import AnalyticsService
from .models import CustomerEvent

class DashboardKPIView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        time_filter = request.query_params.get('period', 'all')
        data = AnalyticsService.get_dashboard_kpis(time_filter=time_filter)
        return Response(data, status=status.HTTP_200_OK)

class TopProductsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        limit = int(request.query_params.get('limit', 5))
        data = AnalyticsService.get_top_products(limit=limit)
        return Response(list(data), status=status.HTTP_200_OK)

class OrderRiskMonitoringView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        data = AnalyticsService.get_risk_monitoring_orders()
        return Response(data, status=status.HTTP_200_OK)

class TrackBehaviorEventView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        event_type = request.data.get('event_type')
        payload = request.data.get('payload', {})

        if not event_type:
            return Response({"error": "event_type is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None
        CustomerEvent.objects.create(
            user=user,
            event_type=event_type,
            payload=payload
        )
        return Response({"status": "recorded"}, status=status.HTTP_201_CREATED)
