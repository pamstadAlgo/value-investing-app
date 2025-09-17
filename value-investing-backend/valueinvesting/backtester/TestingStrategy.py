from Strategy import Strategy
from django.core.exceptions import ObjectDoesNotExist
import sys
import os
import django
sys.path.append("..")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()
from quickfs_dj.models import KeyRatiosQuarter, IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter, BalanceSheetQuarter
from PerformanceMetrics import acquirers_multiple, ebit
from datetime import datetime

class TestingStrategy(Strategy):

    # def __init__(self):
    #     print('we are in init')
    
    def check_buy_signal(self, ticker, date):
        #check if market cap is smaller than 50 Millions and Acquireres multiple is smaller than 8
        try:
            #get key_ratios_quart object to extract market cap 
            key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = ticker, period_end_date = date)

            #get acquireres multiple
            am = acquirers_multiple(ticker, date)

            #get also ebit
            EBIT = ebit(ticker, date)

            # print(f'ticker: {ticker}, date: {date}; this is market_cap: {key_ratios_quart.market_cap} and acquirers multiple: {am}')

            # if key_ratios_quart.market_cap < 5*10**6 and am < 8 and am > 0:
            if key_ratios_quart.market_cap > 50*10**6 and key_ratios_quart.market_cap < 250*10**6 and am < 8 and am > 0 and EBIT > 0:
                return 'BUY'
            else:
                return None
        except ObjectDoesNotExist:
            #if data does not exist we return None, which will not result in a buy
            return None
        except:
            return None
    
    def check_sell_signal(self, ticker, date, portfolio):
        #we will sell when the holding period is 1 year; get date when stock was bought
        log_entry = portfolio.trading_log[(portfolio.trading_log['ticker'] == ticker) & (portfolio.trading_log['type'] == 'BUY')].sort_values(by='date', ascending=True)

        #get date value
        buy_date = log_entry.iloc[0]['date']
        buy_date = datetime.strptime(buy_date, '%Y-%m-%d')

        #convert given date string to datetime object
        current_date = datetime.strptime(date, '%Y-%m-%d')

        # print(f'ticker: {ticker}, current-date: {date}, buy date: {datetime.strftime(buy_date, "%Y-%m-%d")} days between current date and buy date: {abs((current_date-buy_date).days)}')

        #convert difference between two dates
        if abs((current_date-buy_date).days) > 3*365:
            # print(f'we SELL ticker: {ticker}')
            return 'SELL'
        else:
            return None





# strategy = TestingStrategy()