from rest_framework import serializers
from .models import ValuationSnapshot

class ValuationSnapshotSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ValuationSnapshot
        fields = [
            'id', 
            'user', 
            'username',
            'analyst_name',
            'qfs_symbol', 
            'created_at', 
            'price_target', 
            'current_price_at_submission',
            'thesis', 
            'tags', 
            'model_inputs'
        ]
        read_only_fields = ['id', 'created_at', 'user', 'username', 'analyst_name']