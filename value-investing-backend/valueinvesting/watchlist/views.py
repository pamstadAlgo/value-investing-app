from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch, Subquery, OuterRef
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Watchlist, WatchlistItem
from .serializers import WatchlistSerializer, WatchlistItemSerializer
from quickfs_dj.models import TradedCompanies

User = get_user_model()

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Original base queryset
        queryset = Watchlist.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct().order_by('-updated_at')

        # Subqueries for ValuationSnapshot
        # We need a way to look up the latest valuation for (user, company)
        # We correlate on qfs_symbol.
        from valuation_history.models import ValuationSnapshot
        from quickfs_dj.models import ScreenerData

        newest_valuation = ValuationSnapshot.objects.filter(
            user=user,
            qfs_symbol=OuterRef('company__qfs_symbol')
        ).order_by('-created_at')

        screener_data = ScreenerData.objects.filter(
            qfs_symbol=OuterRef('company__qfs_symbol')
        )

        # Create the optimized item queryset with all necessary annotations
        items_qs = WatchlistItem.objects.select_related('company').annotate(
            latest_price_target=Subquery(newest_valuation.values('price_target')[:1]),
            latest_valuation_date=Subquery(newest_valuation.values('created_at')[:1]),
            latest_notes=Subquery(newest_valuation.values('thesis')[:1]),
            latest_analyst_name=Subquery(newest_valuation.values('analyst_name')[:1]),
            latest_model_inputs=Subquery(newest_valuation.values('model_inputs')[:1]),
            latest_market_cap=Subquery(screener_data.values('market_cap_q')[:1])
        )

        return queryset.prefetch_related(
            Prefetch('items', queryset=items_qs)
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        watchlist = self.get_object()
        qfs_symbol = request.data.get('ticker')

        if not qfs_symbol:
            return Response({"error": "Ticker/Symbol is required"}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(TradedCompanies, qfs_symbol=qfs_symbol)

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can add items"}, status=status.HTTP_403_FORBIDDEN)

        item, created = WatchlistItem.objects.get_or_create(watchlist=watchlist, company=company)
        return Response(WatchlistItemSerializer(item).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def remove_stock(self, request, pk=None):
        watchlist = self.get_object()
        qfs_symbol = request.data.get('ticker')

        if not qfs_symbol:
            return Response({"error": "Ticker is required"}, status=status.HTTP_400_BAD_REQUEST)

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can remove items"}, status=status.HTTP_403_FORBIDDEN)

        deleted_count, _ = WatchlistItem.objects.filter(watchlist=watchlist, company__qfs_symbol=qfs_symbol).delete()

        if deleted_count == 0:
            return Response({"error": "Stock not found in this watchlist"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Stock removed"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        watchlist = self.get_object()
        email = request.data.get('email')

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can share this list"}, status=status.HTTP_403_FORBIDDEN)

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_share = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email not found"}, status=status.HTTP_404_NOT_FOUND)

        if user_to_share == request.user:
             return Response({"error": "You cannot share with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        watchlist.shared_with.add(user_to_share)
        return Response({"message": f"Watchlist shared with {email}"}, status=status.HTTP_200_OK)