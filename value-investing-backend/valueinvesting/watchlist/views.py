from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
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