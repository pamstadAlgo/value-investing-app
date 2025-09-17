import pandas as pd
from abc import ABCMeta, abstractmethod, ABC

class Portfolio(ABC):

    def __init__(self):
        self.trading_log = pd.DataFrame(columns=['ticker', 'date', 'uuid', 'qty', 'type', 'price', 'currency'])

    @abstractmethod
    def add_trading_log_entry(self):
        """
        para entry:
            - type: dictionary
            - descn: dictionary with the following keys: {'ticker' : ['some ticker'], 'date': ['YYYY-MM-DD'], 'uuid': [uuid-generated-value], 'type': ['BUY or SELL'], 'price' : [float], 'currency' : ['USD']}
                     important that the values of the dictionary are wrapped inside a list, otherwise it cannot be converted to a dataframe
        """
        raise NotImplementedError('Implementation of add_trading_log_entry() for portfolio class is required!')
    

    def post_processing(self, trading_log_custom_columns):
        """
        Function that processes the trading_log dataframe. It will create a dataframe with the following columns

        ticker  uuid    annualized_return   simple_return   holding_period [days]  currency  buy_date    buy_price   sell_date    sell_price  [custom columns for sell & buy]
        
        simple_return = (sell_price - buy_price)/buy_price
        annualized_return = (1 + simple_return)^(365/holding_period) - 1
        """
        print('this is trading_log in post_processing: ', self.trading_log)