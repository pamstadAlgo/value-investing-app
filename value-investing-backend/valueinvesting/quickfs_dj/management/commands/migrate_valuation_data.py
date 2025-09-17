from django.core.management.base import BaseCommand, CommandError
import os.path
from datetime import datetime, date
from django.db.models import Q
import requests
#from .epv import migrate_valuation_data #this is from cpp package
from quickfs_dj.models import TradedCompanies, Valuation
from django.db.models import F
from screener.CppModules.EPV.build.epv import migrate_valuation_data #this is C++ package

INCOME_FIELDS_TO_EXCLUDE = ["id", "ticker"]
BALANCE_FIELDS_TO_EXCLUDE = ["id", "ticker"]

class Command(BaseCommand):

    def update_prices_for_tickers_and_date(self, qfs_symbols, valuation_date):
        valuations = Valuation.objects.select_related('qfs_symbol').filter(
        qfs_symbol__qfs_symbol__in=qfs_symbols,
        valuation_date=valuation_date,
        price__isnull=True
        )

        # Update price from related model
        for valuation in valuations:
            valuation.price = valuation.qfs_symbol.last_close_price

        Valuation.objects.bulk_update(valuations, ['price'], batch_size=1000)


    def handle(self, *args, **options):
        """
        this management command will migrate the data for the denormalized models LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestCashFlowStatementAnnual, LatestKeyRatiosAnnual
        Example Command: python manage.py migrate_denormalized_models -t ALL
        """
        print('########### START MIGRATING VALUATION DATA ###########')
        #model = options["type"]

        qfs_symbols = list(TradedCompanies.objects.filter(has_new_financials=True).values_list('qfs_symbol', flat=True))

        today = datetime.today().strftime('%Y-%m-%d')

        #this computes EPV and EPV_TTM for each company
        migrate_valuation_data(qfs_symbols, today)
        #migrate_valuation_data(["YRD:US"], today)

        #update prices with the last close price that is available
        self.update_prices_for_tickers_and_date(qfs_symbols, today)

