from rest_framework.views import APIView
from .serializers import WaccSerializer, TaxRateSerializer
from rest_framework.response import Response
import pandas as pd
import os
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class CustomGoogleOAuth2Client(OAuth2Client):
    def __init__(
        self,
        request,
        consumer_key,
        consumer_secret,
        access_token_method,
        access_token_url,
        callback_url,
        _scope,  # This is fix for incompatibility between django-allauth==65.3.1 and dj-rest-auth==7.0.1
        scope_delimiter=" ",
        headers=None,
        basic_auth=False,
    ):
        super().__init__(
            request,
            consumer_key,
            consumer_secret,
            access_token_method,
            access_token_url,
            callback_url,
            scope_delimiter,
            headers,
            basic_auth,
        )


class GoogleLogin(SocialLoginView): # if you want to use Authorization Code Grant, use this
    print('google callback uri that we set in google login: ', os.environ["GOOGLE_CALLBACK_URI"])
    adapter_class = GoogleOAuth2Adapter
    callback_url = os.environ["GOOGLE_CALLBACK_URI"]
    client_class = CustomGoogleOAuth2Client


class Wacc:
    def __init__(self, cost_of_debt):
        self.cost_of_debt = cost_of_debt


class TaxRate(APIView):
    def get(self,request):
        # create response list
        response = []

        # read file with tax rate and extract country + tax rate column
        data = pd.read_csv('static/CorporateTaxRate.csv')
        tax_rates = data[["Country", "Corporate Tax Rate"]]

        for index, row in tax_rates.iterrows():
            tax_rate = row["Corporate Tax Rate"]
            if '%' in tax_rate:
                tax_rate = float(tax_rate.split('%')[0])/100
            else:
                tax_rate = float(tax_rate)/100

            # create dictionary that will be added to response
            tax = {"country" : row['Country'], "taxRate": tax_rate}

            response.add(tax)
        
        # serialized the response (meaning transform python native data type to json object)
        responseSerialized = TaxRateSerializer(response, many=True).data

        return Response(responseSerialized)


class WaccAPIView(APIView):
    def get(self, request):
        wacc = Wacc(0.08)
        result = WaccSerializer(wacc).data
        return Response(result)
    
