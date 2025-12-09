from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Watchlist, WatchlistItem, StockValuation
from .serializers import WatchlistSerializer, WatchlistItemSerializer, StockValuationSerializer
from quickfs_dj.models import TradedCompanies
import datetime

User = get_user_model()

class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Watchlist.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct().order_by('-updated_at')

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
        """
        Share this watchlist with another user by email.
        Payload: { "email": "colleague@example.com" }
        """
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

    # --- UPDATED: Save Valuation (Creates History) ---
    @action(detail=True, methods=['post']) 
    def save_valuation(self, request, pk=None):
        """
        Create a new valuation entry for a stock in this watchlist.
        Payload: { 
            "ticker": "AAPL:US", 
            "price_target": 150.00, 
            "notes": "Thesis update...",
            "valuation_date": "2023-10-25",
            "valuation_inputs": { ...JSON state... }
        }
        """
        watchlist = self.get_object()
        qfs_symbol = request.data.get('ticker')
        
        # Inputs
        price_target = request.data.get('price_target')
        notes = request.data.get('notes')
        valuation_date = request.data.get('valuation_date') or datetime.date.today()
        valuation_inputs = request.data.get('valuation_inputs')

        if not qfs_symbol:
            return Response({"error": "Ticker is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure stock is in list
        try:
            item = WatchlistItem.objects.get(watchlist=watchlist, company__qfs_symbol=qfs_symbol)
        except WatchlistItem.DoesNotExist:
            return Response({"error": "Stock not found in this watchlist"}, status=status.HTTP_404_NOT_FOUND)

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can modify items"}, status=status.HTTP_403_FORBIDDEN)

        # CREATE NEW VALUATION ENTRY (History)
        StockValuation.objects.create(
            watchlist_item=item,
            price_target=price_target,
            valuation_date=valuation_date,
            notes=notes,
            valuation_inputs=valuation_inputs
        )
        
        # Return the updated Item (serializer will automatically pick up the 'latest' valuation)
        return Response(WatchlistItemSerializer(item).data, status=status.HTTP_200_OK)

    # --- NEW: Get Valuation History ---
    @action(detail=True, methods=['get'], url_path='history/(?P<ticker>[^/.]+)')
    def history(self, request, pk=None, ticker=None):
        """
        Get all historical valuations for a specific stock in a watchlist
        URL: /api/watchlist/{id}/history/{ticker}/
        """
        watchlist = self.get_object()
        
        try:
            item = WatchlistItem.objects.get(watchlist=watchlist, company__qfs_symbol=ticker)
        except WatchlistItem.DoesNotExist:
            return Response({"error": "Stock not found in this watchlist"}, status=status.HTTP_404_NOT_FOUND)

        # Serialize all valuations for this item, ordered by created_at (via Model Meta)
        history = item.valuations.all()
        serializer = StockValuationSerializer(history, many=True)
        return Response(serializer.data)