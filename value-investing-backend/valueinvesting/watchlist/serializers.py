from rest_framework import serializers
from .models import Watchlist, WatchlistItem

class WatchlistItemSerializer(serializers.ModelSerializer):
    # Company info
    ticker = serializers.CharField(source='company.ticker', read_only=True)
    qfs_symbol = serializers.CharField(source='company.qfs_symbol', read_only=True)
    name = serializers.CharField(source='company.name', read_only=True)
    last_close_price = serializers.FloatField(source='company.last_close_price', read_only=True)
    company_id = serializers.IntegerField(source='company.id', read_only=True)
    
    # New Fields for "Pro" View
    industry = serializers.CharField(source='company.industry', read_only=True)
    currency = serializers.CharField(source='company.currency', read_only=True)
    market_cap = serializers.SerializerMethodField()

    # Dynamic fields from ValuationHistory
    price_target = serializers.SerializerMethodField()
    valuation_date = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    analyst_name = serializers.SerializerMethodField()
    valuation_inputs = serializers.SerializerMethodField()

    class Meta:
        model = WatchlistItem
        fields = [
            'id', 'company_id', 'ticker', 'qfs_symbol', 'name', 
            'last_close_price', 'industry', 'currency', 'market_cap', 'added_at',
            'price_target', 'valuation_date', 'notes', 'analyst_name', 'valuation_inputs'
        ]

    def get_latest_valuation(self, obj):
        # Fallback helper: used only if annotations are missing
        # Lazy import to prevent circular dependency errors
        from valuation_history.models import ValuationSnapshot
        return ValuationSnapshot.objects.filter(
            user=obj.watchlist.owner, 
            qfs_symbol=obj.company.qfs_symbol
        ).order_by('-created_at').first()

    def get_price_target(self, obj):
        if hasattr(obj, 'latest_price_target'):
            return obj.latest_price_target
        val = self.get_latest_valuation(obj)
        return val.price_target if val else None

    def get_valuation_date(self, obj):
        if hasattr(obj, 'latest_valuation_date'):
            return obj.latest_valuation_date.date() if obj.latest_valuation_date else None
        val = self.get_latest_valuation(obj)
        return val.created_at.date() if val else None

    def get_notes(self, obj):
        if hasattr(obj, 'latest_notes'):
            return obj.latest_notes
        val = self.get_latest_valuation(obj)
        return val.thesis if val else None
    
    def get_analyst_name(self, obj):
        if hasattr(obj, 'latest_analyst_name'):
            return obj.latest_analyst_name
        val = self.get_latest_valuation(obj)
        return val.analyst_name if val else None

    def get_valuation_inputs(self, obj):
        if hasattr(obj, 'latest_model_inputs'):
            return obj.latest_model_inputs
        val = self.get_latest_valuation(obj)
        return val.model_inputs if val else None
    
    def get_market_cap(self, obj):
        if hasattr(obj, 'latest_market_cap'):
            return obj.latest_market_cap
            
        # Lazy import to prevent circular dependency errors
        from quickfs_dj.models import ScreenerData
        # Fetch the latest quarterly market cap
        data = ScreenerData.objects.filter(qfs_symbol=obj.company.qfs_symbol).values('market_cap_q').first()
        return data['market_cap_q'] if data else None

class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'title', 'description', 'owner', 'owner_name', 'created_at', 'updated_at', 'items']
        read_only_fields = ['owner', 'created_at', 'updated_at']