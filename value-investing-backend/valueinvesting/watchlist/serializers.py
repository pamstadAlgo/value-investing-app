from rest_framework import serializers
from .models import Watchlist, WatchlistItem, StockValuation

class StockValuationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockValuation
        fields = ['id', 'price_target', 'valuation_date', 'created_at', 'notes', 'valuation_inputs']

class WatchlistItemSerializer(serializers.ModelSerializer):
    # Company info
    ticker = serializers.CharField(source='company.ticker', read_only=True)
    qfs_symbol = serializers.CharField(source='company.qfs_symbol', read_only=True)
    name = serializers.CharField(source='company.name', read_only=True)
    last_close_price = serializers.FloatField(source='company.last_close_price', read_only=True)
    company_id = serializers.IntegerField(source='company.id', read_only=True)

    # Flattened "Latest Valuation" fields for the Table Display
    price_target = serializers.SerializerMethodField()
    valuation_date = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    valuation_inputs = serializers.SerializerMethodField()

    class Meta:
        model = WatchlistItem
        fields = [
            'id', 'company_id', 'ticker', 'qfs_symbol', 'name', 'last_close_price', 'added_at',
            'price_target', 'valuation_date', 'notes', 'valuation_inputs'
        ]

    def get_latest_valuation(self, obj):
        # Helper to fetch the most recent valuation
        return obj.valuations.first() # Because we ordered by -created_at in Meta

    def get_price_target(self, obj):
        val = self.get_latest_valuation(obj)
        return val.price_target if val else None

    def get_valuation_date(self, obj):
        val = self.get_latest_valuation(obj)
        return val.valuation_date if val else None

    def get_notes(self, obj):
        val = self.get_latest_valuation(obj)
        return val.notes if val else None
        
    def get_valuation_inputs(self, obj):
        val = self.get_latest_valuation(obj)
        return val.valuation_inputs if val else None

class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'title', 'description', 'owner', 'owner_name', 'created_at', 'updated_at', 'items']
        read_only_fields = ['owner', 'created_at', 'updated_at']