from rest_framework import serializers

class KeyRatioSerializer(serializers.Serializer):
    nrYears = serializers.IntegerField()
    var5Year = serializers.FloatField()
    var10Year = serializers.FloatField()
    varNYear = serializers.FloatField()
    varTTM = serializers.FloatField()
    thld = serializers.CharField(max_length=50)
    name = serializers.CharField(max_length = 150)
    descn = serializers.CharField(max_length=5000)
    formula = serializers.CharField(max_length = 400)
