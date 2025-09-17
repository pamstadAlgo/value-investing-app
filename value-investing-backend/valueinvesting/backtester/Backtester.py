from datetime import datetime
from dateutil.relativedelta import relativedelta
from collections import defaultdict
import sys
import os
import uuid
import django
import collections
#create django setup; needed otherwise we cannot use django models outside of django apps
sys.path.append("..")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()

from quickfs_dj.models import KeyRatiosQuarter, IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter, BalanceSheetQuarter
from django.core.exceptions import ObjectDoesNotExist
from TestingPortfolio import TestingPortfolio
from TestingStrategy import TestingStrategy
from LogEntry import create_info_log_entry

#3$SZ&i5q612sVu_
#	bcmWNkyDscpr1&

class Backtester:
    def __init__(self, start_date, end_date, strategy, portfolio, tickers = 'ALL'):
        """
        Constructor of backtester class

        para start_date:
            - type: string
            - descn: start date from which data should be considered. Expected format is YYYY-MM

        para end_date:
            - type: string
            - descn: end date until backtest will be run. Expected format is YYYY-MM
        
        para strategy:
            - type: Object of class that inherits from Stragety Abstract base class
            - descn: object that has methods check_buy_signal and check_sell_signal, that will decided based on given ticker symbol and date, whether ticker should be bought, sold or nothing to be done

        para portfolio:
            - type: object of class that inherits Portfolio abstract base class
            - descn: TODO

        para timestemp:
            - type: not sure if needed yet
        
        para tickers:
            - type: string or list of ticker symbols
            - descn: if no list of ticker symbols is provided (example: ['META', 'GOOG', 'TSLA', etc.] if defaults to ALL, which means all available ticker symbols will be used in the backtest)
        """
        #convert date strings to datetime objects
        self.start_date = datetime.strptime(start_date+'-01', '%Y-%m-%d')
        self.end_date = datetime.strptime(end_date+'-01', '%Y-%m-%d')
        self.current_date = self.start_date
        self.time_line = []
        self.available_data = defaultdict(list)
        self.tickers = []
        self.portfolio = portfolio
        self.strategy = strategy

        #construct timeline: timeline is a list of dates starting at self.start_date up to self.end_date, increasing the date by one month
        create_info_log_entry('Construct backtest timeline START')
        self.construct_time_line()
        create_info_log_entry('Construct backtest timeline END')

        #extract all available ticker symbols
        if type(tickers) != list:
            self.get_available_tickers()
        elif type(tickers) == list:
            self.tickers = tickers
        else:
            raise Exception('tickers parameter must be of type list!')

        #construct data dictionary if data is available; available_date will be a dictionary of dictionaries of the format: {'META' : {'start_date' : False,  '2003-04-01': True, 'end_date' : True, etc. }}
        create_info_log_entry('Get available data for ticker symbols START')
        self.construct_available_data()
        create_info_log_entry('Get available data for ticker symbols END')

    def construct_time_line(self):
        current_date = self.current_date
        while current_date <= self.end_date:
            self.time_line.append(datetime.strftime(current_date, '%Y-%m-%d'))
            current_date = current_date + relativedelta(months=+1)

    def get_available_tickers(self):
        #get all ticker values that are available
        tickers = TradedCompanies.objects.values('ticker')

        #iterate trough tickers to create a list
        for ticker in tickers:
            self.tickers.append(ticker['ticker'])

    def construct_available_data(self):
        # for date in self.time_line:
        for ticker in self.tickers:
            #check if data is available for that date & ticker symbol
            try:
                #we check whether balance sheet + incomestatement data is available
                income_dates = IncomeStatementQuarter.objects.filter(ticker_id = ticker).values_list('period_end_date')
                balance_dates = BalanceSheetQuarter.objects.filter(ticker_id = ticker).values_list('period_end_date')

                #intersect dates
                result = collections.Counter(income_dates) & collections.Counter(balance_dates)
                intersection = list(result.elements())

                #convert to string objects
                dates = [str(date[0]) for date in intersection]
              
                self.available_data[ticker] = dates
            except ObjectDoesNotExist:
                print('object does not exist')
    
    def data_is_present(self, ticker, date):
        """
        checks if data for a certain ticker and date is present
        """
        if date in self.available_data[ticker]:
            return True
        else:
            return False

    def run_backtest(self):
        """
        method that executes backtest
        """
        create_info_log_entry('Backtest START')
        #iterate through time lines and stocks
        for date in self.time_line:
            #get current portfolio (dictionary of the format: {'YYYY-MM-DD' : ['META', 'AAPL', 'TSLA']})
            portf = self.portfolio.construct_portfolio(date)
            # print('this is portf: ', portf)
            for ticker in self.tickers:
                # if ticker == 'DIZNF':
                #     print(f'this is ticker and this is portf: {ticker}, {portf}')
                #     if ticker in portf[date]:
                #         print(f'ticker {ticker} is in portf: {portf}')
                #     else:
                #         print(f'ticker {ticker} is not in portf: {portf}')

                #check if data is present for that data and ticker
                if self.data_is_present(ticker, date):
                    #if ticker is already part of portfolio: If yes we will call CheckSellSignalMethod and otherwise CheckBuySignalMethod
                    # print(f'this is ticker: {ticker}, this is portf.values: {portf.values()}')
                    # if ticker in portf.values():
                    if ticker in portf[date]:
                        # print(f'ticker is in portf: {ticker}')
                        signal = self.strategy.check_sell_signal(ticker, date, self.portfolio)

                        if signal == 'SELL':
                            #extract data from database; we can also access fields from the TradedCompanies model via a KeyRatiosQuarter object
                            key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = ticker, period_end_date = date)

                            #find uuid of BUY transaction
                            uuid_buy = self.portfolio.find_buy_uuid(ticker, date)

                            #construct new row for trading log dataframe
                            new_sell = {'ticker' : [ticker], 'date' : [date], 'uuid' : [uuid_buy], 'qty' : [-1], 'type' : ['SELL'], 'price' : [key_ratios_quart.period_end_price], 'currency' : [key_ratios_quart.ticker.currency] }

                            #add buy entry to portfolio
                            self.portfolio.add_trading_log_entry(new_sell, ticker, date)
                    else:
                        signal = self.strategy.check_buy_signal(ticker, date)

                        if signal == 'BUY':
                            #extract data from database; we can also access fields from the TradedCompanies model via a KeyRatiosQuarter object
                            key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = ticker, period_end_date = date)

                            #check that the period end price does exist (not equal to zero and not null)
                            if key_ratios_quart.period_end_price != 0 and key_ratios_quart.period_end_price is not None:
                                #construct new row for trading log dataframe
                                new_buy = {'ticker' : [ticker], 'date' : [date], 'uuid' : [uuid.uuid4()], 'qty' : [1], 'type' : ['BUY'], 'price' : [key_ratios_quart.period_end_price], 'currency' : [key_ratios_quart.ticker.currency] }

                                #add buy entry to portfolio
                                self.portfolio.add_trading_log_entry(new_buy, ticker, date)
                            

            #convert trading_logs to csv
            self.portfolio.trading_log.to_csv('trading_log_test.csv', index=False)

        create_info_log_entry('Backtest END')



#initalize Portfolio object
# portf = TestingPortfolio(trading_log_columns=['AcquirersMultiple'])
portf = TestingPortfolio(trading_log_columns=['AcquirersMultiple', 'EnterpriseValue', 'EBIT'])

#initalize Trading strategy object
strategy = TestingStrategy()

traded_companies = TradedCompanies.objects.values_list('ticker', flat=True)
tickers = list(traded_companies)

#only take first thousand companies
tickers = tickers[:1000]


bt = Backtester('2012-01', '2022-01', strategy=strategy, portfolio=portf, tickers=tickers)
bt.run_backtest()
print('finished')