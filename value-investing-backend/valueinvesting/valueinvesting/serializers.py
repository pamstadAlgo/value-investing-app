from rest_framework import serializers
from dj_rest_auth.registration.serializers import SocialLoginSerializer


class WaccSerializer(serializers.Serializer):
    cost_of_debt = serializers.FloatField()

class TaxRateSerializer(serializers.Serializer):
    country = serializers.CharField(max_length=150)
    taxRate = serializers.FloatField()


class CustomSocialLoginSerializer(SocialLoginSerializer):
    def validate(self, attrs):
        print('we ar in custom validate')
