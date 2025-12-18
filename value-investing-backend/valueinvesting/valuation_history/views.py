from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import ValuationSnapshot
from .serializers import ValuationSnapshotSerializer

class ValuationSnapshotListAPIView(APIView):
    
    def get(self, request):
        """
        By default, show all valuations or filter by ticker.
        """
        queryset = ValuationSnapshot.objects.all()
        ticker = request.query_params.get('ticker')
        if ticker:
            queryset = queryset.filter(qfs_symbol=ticker)
        
        serializer = ValuationSnapshotSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ValuationSnapshotSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            name = user.get_full_name() or user.username
            serializer.save(user=user, analyst_name=name)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ValuationSnapshotDetailAPIView(APIView):
        
    def get_object(self, pk):
        return get_object_or_404(ValuationSnapshot, pk=pk)

    def get(self, request, pk):
        snapshot = self.get_object(pk)
        serializer = ValuationSnapshotSerializer(snapshot)
        return Response(serializer.data)

    def put(self, request, pk):
        snapshot = self.get_object(pk)
        serializer = ValuationSnapshotSerializer(snapshot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        snapshot = self.get_object(pk)
        snapshot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserValuationHistoryAPIView(APIView):
    
    def get(self, request):
        """
        Get only valuations created by the current user.
        """
        queryset = ValuationSnapshot.objects.filter(user=request.user)
        ticker = request.query_params.get('ticker')
        if ticker:
            queryset = queryset.filter(qfs_symbol=ticker)
        
        serializer = ValuationSnapshotSerializer(queryset, many=True)
        return Response(serializer.data)