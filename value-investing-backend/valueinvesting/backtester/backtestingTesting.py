import django
import sys
import os
sys.path.append("..")

# sys.path.append("/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/valueinvesting") 
# file_path = "/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/valueinvesting/valueinvesting.settings"
# sys.path.append('/Users/chris/Documents/Python/Django/nft/')  # This path being the directory at the top of my screenshot
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()
from quickfs_dj.models import IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter
from collections import defaultdict
from django.core.exceptions import ObjectDoesNotExist

try:
    #get ticker symbol for certain date
    # obj = IncomeStatementQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2025-09-01')
    # meta_dates = IncomeStatementQuarter.objects.get(ticker_id = 'META').values('period_end_date')
    meta_dates = IncomeStatementQuarter.objects.filter(ticker_id = 'META').values_list('period_end_date')

    #transform into list of string
    # meta_dates = [str(date.values()) for date in meta_dates]

    meta_dates = [str(date[0]) for date in meta_dates]

    print(meta_dates)

    # for date in meta_dates:
    #     print('date: ', date)

    # print('these are meta_dates: ', meta_dates)
    # print(f'obj does exist: {obj.ticker_id}, sga: {obj.sga}')
except ObjectDoesNotExist:
    print('searched object does not exist')


tickers = list(TradedCompanies.objects.values('ticker'))

# data_available = defaultdict(dict)


# print(f'type of tickers: {tickers}')
# data = {}

# for ticker in tickers:
#     print(ticker['ticker'])

