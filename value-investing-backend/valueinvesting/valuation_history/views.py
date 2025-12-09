from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ValuationSnapshot
from .serializers import ValuationSnapshotSerializer

class ValuationSnapshotViewSet(viewsets.ModelViewSet):
    serializer_class = ValuationSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        By default, show all valuations or filter by ticker.
        """
        queryset = ValuationSnapshot.objects.all()
        ticker = self.request.query_params.get('ticker')
        if ticker:
            queryset = queryset.filter(qfs_symbol=ticker)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        name = user.get_full_name() or user.username
        serializer.save(user=user, analyst_name=name)

    @action(detail=False, methods=['get'])
    def my_history(self, request):
        """
        Get only valuations created by the current user.
        """
        queryset = ValuationSnapshot.objects.filter(user=request.user)
        ticker = request.query_params.get('ticker')
        if ticker:
            queryset = queryset.filter(qfs_symbol=ticker)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)