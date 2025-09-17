from abc import ABCMeta, abstractmethod, ABC

class Strategy(ABC):
    """
    Strategy is an abstract base class providing an interface for strategy handling objects
    """

    # __metaclass__ = ABCMeta

    @abstractmethod
    def check_buy_signal(self):
        """
        Method that will check whether ticker at given date is a BUY or not

        return:
            - type: string
            - descn: BUY or None
        """
        raise NotImplementedError('Implementation of check_buy_signal() for strategy class is required!')
    
    @abstractmethod
    def check_sell_signal(self):
        """
        Method that will check whether ticker at given date is a SELL or not

        return:
            - type: string
            - descn: BUY or None
        """
        raise NotImplementedError('Implementation of check_buy_signal() for strategy class is required!')
    

    