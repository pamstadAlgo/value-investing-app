import pandas as pd
import uuid
import sys
import os
import django
import collections
#create django setup; needed otherwise we cannot use django models outside of django apps
sys.path.append("..")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()
from quickfs_dj.models import KeyRatiosQuarter, IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter, BalanceSheetQuarter
from django.core.exceptions import ObjectDoesNotExist
from datetime import date
from pyxirr import xirr 
# https://anexen.github.io/pyxirr/functions.html#xirr
# https://medium.com/freefincal-articles/how-to-calculate-annualized-return-xirr-from-a-stock-investment-243b7476a41e


dates = [ date(2010, 1, 1), date(2017, 7, 7), date(2017, 10, 8)]
#buys are negative values, sell are positive: if you have not yet soldd just take the current market value as a positive number (act like you sell)
amounts = [ -200000, 150000, 1067500]

# feed columnar data
res = xirr(dates, amounts)

print(f'xirr: {res}')

# try:
#     key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2021-09-01')
#     balance_sheet_quart = BalanceSheetQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2021-09-01')
#     print(f'market cap: {key_ratios_quart.market_cap}')
#     print(f'total debt: {balance_sheet_quart.st_debt + balance_sheet_quart.lt_debt}')
#     print(f'preferred stock: {balance_sheet_quart.preferred_stock}')
#     print(f'minority interest: {balance_sheet_quart.minority_interest_liability}')
#     print(f'excess cash: {balance_sheet_quart.total_current_assets - balance_sheet_quart.total_current_liabilities}')

# except ObjectDoesNotExist:
#     raise Exception(f'En')

# key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = 'ANNX', period_end_date = '2021-09-01').values_list('period_end_price', 'ticker_id__currency', 'ticker_id__industry')

# print(key_ratios_quart.period_end_price)
# print(key_ratios_quart.ticker.industry)
# print(key_ratios_quart)