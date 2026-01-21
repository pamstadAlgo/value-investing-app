from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.db.models import Q, Prefetch, Subquery, OuterRef
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Watchlist, WatchlistItem
from .serializers import WatchlistSerializer, WatchlistItemSerializer
from quickfs_dj.models import TradedCompanies
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

class WatchlistListAPIView(APIView):
    
    def get(self, request):
        user = request.user
        queryset = Watchlist.objects.filter(
            Q(owner=user) | Q(shared_with=user)
        ).distinct().order_by('-updated_at')
        serializer = WatchlistSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WatchlistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WatchlistDetailAPIView(APIView):
        
    def get_object(self, pk):
        return get_object_or_404(Watchlist, pk=pk)

    def get(self, request, pk):
        watchlist = self.get_object(pk)
        # Check permissions - though list query handles it, direct access might need check
        # Original ViewSet filtered get_queryset so users could only see their own/shared.
        # We should probably replicate that check or rely on the fact that if they have the ID they might have access?
        # Better safe: replicate get_queryset logic for single object retrieval if possible, OR
        # just check logic. 
        # For simplicity and to match ViewSet behavior which restricts access to get_queryset:
        user = request.user
        if not (watchlist.owner == user or user in watchlist.shared_with.all()):
            raise PermissionDenied("You do not have permission to access this watchlist.")

        serializer = WatchlistSerializer(watchlist)
        return Response(serializer.data)

    def put(self, request, pk):
        watchlist = self.get_object(pk)
        if watchlist.owner != request.user:
             return Response({"error": "Only owner can edit"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = WatchlistSerializer(watchlist, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        watchlist = self.get_object(pk)
        if watchlist.owner != request.user:
             return Response({"error": "Only owner can delete"}, status=status.HTTP_403_FORBIDDEN)
        watchlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class WatchlistAddStockAPIView(APIView):
    
    def post(self, request, pk):
        watchlist = get_object_or_404(Watchlist, pk=pk)
        qfs_symbol = request.data.get('ticker')

        if not qfs_symbol:
            return Response({"error": "Ticker/Symbol is required"}, status=status.HTTP_400_BAD_REQUEST)

        company = get_object_or_404(TradedCompanies, qfs_symbol=qfs_symbol)

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can add items"}, status=status.HTTP_403_FORBIDDEN)

        item, created = WatchlistItem.objects.get_or_create(watchlist=watchlist, company=company)
        return Response(WatchlistItemSerializer(item).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class WatchlistRemoveStockAPIView(APIView):
    
    def post(self, request, pk):
        watchlist = get_object_or_404(Watchlist, pk=pk)
        qfs_symbol = request.data.get('ticker')

        if not qfs_symbol:
            return Response({"error": "Ticker is required"}, status=status.HTTP_400_BAD_REQUEST)

        if watchlist.owner != request.user:
            return Response({"error": "Only the owner can remove items"}, status=status.HTTP_403_FORBIDDEN)

        deleted_count, _ = WatchlistItem.objects.filter(watchlist=watchlist, company__qfs_symbol=qfs_symbol).delete()

        if deleted_count == 0:
            return Response({"error": "Stock not found in this watchlist"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Stock removed"}, status=status.HTTP_200_OK)

class WatchlistShareAPIView(APIView):
    
    def post(self, request, pk):
        watchlist = get_object_or_404(Watchlist, pk=pk)
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