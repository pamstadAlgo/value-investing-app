from rest_framework import serializers
from screener.models import CustomMetrics, FilterViews, ValuationModel
from .helpers import tokenize, set_table

class StringListField(serializers.ListField):
    child = serializers.CharField()

class FilterQuantity(serializers.ListField):
    # identifier = serializers.CharField()
    techName = serializers.CharField()
    readableName = serializers.CharField()
    

class StockScreenerFiltersSerializer(serializers.Serializer):
    tableName = serializers.CharField(max_length=200)
    # tableColumns = StringListField()
    tableColumns = FilterQuantity()

    # tableColumns = serializers.CharField(max_length=200, many=True)
    # nrYears = serializers.IntegerField()
    # var5Year = serializers.FloatField()
    # var10Year = serializers.FloatField()
    # varNYear = serializers.FloatField()
    # varTTM = serializers.FloatField()
    # thld = serializers.CharField(max_length=50)
    # name = serializers.CharField(max_length = 150)
    # descn = serializers.CharField(max_length=5000)
    # formula = serializers.CharField(max_length = 400)

# class FilterQuerySerializer(serializers.ModelSerializer):
#     class Meta:
#         model 

class CustomMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomMetrics
        fields = ['id', 'tech_name', 'readable_name', 'description', 'user_id', 'html_formula']

    def to_representation(self, instance):
        """
        to_representation is called when the serializer is converting the Django model instance to a dictionary for the response.
        Convert the stored comma-separated string into an array for the response.
        We store the table property as a comma separated string, so we will transform it back to an array. balance,income becomes [balance, income]
        """
        data = super().to_representation(instance)

        #check if table is a single string or comma separated string
        # if len(data['table'].split(',')) > 1:
        #     data['table'] = data['table'].split(',')

        return data

    def to_internal_value(self, data):
        """
        This method is called when incoming data (e.g., from a POST request) is being deserialized.
        Convert the incoming array into a comma-separated string for storage.
        For custom metrics the table property can be a list of tables that are included in the custom metrics so like table: ['balance', 'income']. We store this as a string in the database: balance,income
        """
        #tokenize the custom metric to extract which tables are invovled
        print('we are in to_internal_value function CustomMetric; this is tech_name: ', data['tech_name'])
        tokens = tokenize(data['tech_name'])

        print('this is tokens: ', tokens)

        # table = set_table(tokens)

        # print('these are table in expression: ', table)

        #add table to data
        # data['table'] = list(table)

        # if 'table' in data and isinstance(data['table'], list):
        #     data['table'] = ','.join(data['table'])  # Convert array to string
        # elif 'table' in data and not isinstance(data['table'], str):
        #     raise serializers.ValidationError({"table": "The table field must be a string or an array."})
        return super().to_internal_value(data)
    

class FilterViewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterViews
        fields = ['id', 'view_name', 'view_description', 'view_filters']


class ValuationModelSerizalizer(serializers.ModelSerializer):
    class Meta:
        model = ValuationModel
        fields = ['id', 'qfs_symbol', 'name', 'description', 'data', 'created_at']

class CharFieldFilterOptions(serializers.Serializer):
    # Use DictField to handle dynamic keys
    field_options = serializers.DictField(child=serializers.ListField(child=serializers.CharField()))
