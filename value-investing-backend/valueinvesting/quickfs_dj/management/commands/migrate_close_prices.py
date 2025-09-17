from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
#from valueinvesting.quickfs_dj.management.commands.helpers import update_denormalized_model
import requests
#from .epv import migrate_valuation_data #this is from cpp package
from quickfs_dj.models import TradedCompanies, Valuation
from django.db.models import F
from screener.CppModules.EPV.build.epv import migrate_close_prices #this is C++ package

INCOME_FIELDS_TO_EXCLUDE = ["id", "ticker"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "ticker"]

class Command(BaseCommand):

  
    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING CLOSE PRICES ###########')
        #model = options["type"]
        countries = ["EUROPE", "AU", "US", "US/OTC"]

        for country in countries:
            url = f"https://public-api.quickfs.net/v1/market-data/last-close/{country}?api_key={os.environ['QUICKFS_API_KEY']}"

            print('url we pass: ', url)

            migrate_close_prices(url)
