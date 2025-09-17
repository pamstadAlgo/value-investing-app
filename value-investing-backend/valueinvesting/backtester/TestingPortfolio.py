from Portfolio import Portfolio
import pandas as pd
from PerformanceMetrics import acquirers_multiple, enterprise_value, ebit

class TestingPortfolio(Portfolio):

    def __init__(self, trading_log_columns = []):
        """
        para trading_log_columns:
            - type: list of strings
            - descn: defines custom columns that should be added to trading log dataframe; standard columns in trading log dataframe are: ticker, date, uuid, qty, type, price, currency
        """
        #call parent constructur to create trading log dataframe with standard columns: ticker, date, uuid, qty, type, price, currency
        super().__init__()

        #store custom trading_log_columns in an attribute
        self.custom_trading_log_cols = trading_log_columns

        #add custom columns to trading log; for example you may like to add the Acquirer's multiple as a column whenever you make a transaction etc
        for col in self.custom_trading_log_cols:
            self.trading_log[col] = pd.Series(index=self.trading_log.index)

    def add_custom_cols(self, new_row, ticker, date):
        """
        Method that adds custom defined columns to trading log dataframe
        """
        custom_values = []
        custom_values.append(acquirers_multiple(ticker, date))
        custom_values.append(enterprise_value(ticker, date))
        custom_values.append(ebit(ticker, date))

        for idx, col in enumerate(self.custom_trading_log_cols):
            new_row[col] = custom_values[idx]

        return new_row


    def add_trading_log_entry(self, new_row, ticker, date):
        """
        para new_row:
            - type: dictionary
            - descn: dictionary of the format {'ticker' : ['some ticker'], 'date': ['YYYY-MM-DD'], 'uuid': [uuid-generated-value], 'type': ['BUY or SELL'], 'price' : [float], 'currency' : ['USD']}
                     new_row contains standard columns of trading_log dataframe; if you added custom columns these custom columns need to be added
        """

        if len(self.custom_trading_log_cols) > 0:
            try:
                new_row = self.add_custom_cols(new_row, ticker, date)
            except AttributeError:
                raise NotImplementedError('When you add custom trading log columns, you need to implement the add_custom_cols() method in your portfolio class')
        
        #add new row to dataframe
        new_row = pd.DataFrame.from_dict(new_row)

        #append new row to existing dataframe
        self.trading_log = pd.concat([self.trading_log, new_row], ignore_index=True)

    def construct_portfolio(self, date):
        """
        Constructs current portfolio holdings for a given date

        para trading_logs:
            - type: pandas dataframe
            - descn: pandas dataframe with columns ticker, date, uuid, qty, type, currency (potentially also additional columns)

        para date:
            - type: string
            - format: YYYY-MM-DD

        return
            - type: dictionary with date as key and list as value
            - descn: return a list of ticker symbols which are at the given date part of the portfolio
                     Example: {'YYYY-MM-DD' : ['META', 'AAPL', 'TSLA', etc.]}
        """
        #create portfolio in form of a dictionary: {'YYYY-MM-DD' : ['META', 'AAPL', etc.]}
        portf = {date: []}

        if self.trading_log.empty == False:
            #filter dataframe based on date parameter
            trading_logs = self.trading_log[self.trading_log['date'] <= date]

            #group rows by uuid and sum by qty column: where resulting qty is larger than 0 corresponds to a portfolio position
            # holdings =  trading_logs.groupby('uuid', as_index=False).sum()
            holdings =  trading_logs.groupby('uuid', as_index=False)['qty'].sum()

            #only keep rows where qty is larger than 0
            holdings = holdings[holdings['qty'] > 0]

            #iterate through dataframe
            for index, row in holdings.iterrows():
                ticker = trading_logs[trading_logs['uuid'] == row['uuid']]
                portf[date].append(ticker['ticker'].values[0])

        return portf
    
    def find_buy_uuid(self, ticker, date):
        """
        Function that finds uuid for a SELL transaction
        """
        #filter trading logs based on current date
        trading_logs = self.trading_log[self.trading_log['date'] <= date]

        #filter remaning trading logs based on ticker symbol and type = 'BUY'
        # uuid_buy = trading_logs[(trading_logs['ticker'] == ticker) & (trading_logs['type'] == 'BUY')].sort_values('date').iloc[0]['uuid']
        trading_logs = trading_logs[(trading_logs['ticker'] == ticker)].sort_values(by='date')

        #group by uuid and compute size of group
        trading_logs = trading_logs.groupby(by='uuid', as_index=False).size()

        #only keep trading_logs where size is smaller than 2 (not yet a matched sell order)
        uuid_buy = trading_logs[trading_logs['size']<2].iloc[0]['uuid']

        #return the buy_uuid
        return uuid_buy



