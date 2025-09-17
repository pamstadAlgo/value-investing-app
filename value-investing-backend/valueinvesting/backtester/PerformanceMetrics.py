"""
Python module that defines various performance metrics that can be used in trading strategies
"""
import sys
import os
import django
from django.core.exceptions import ObjectDoesNotExist
sys.path.append("..")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()

from quickfs_dj.models import KeyRatiosQuarter, IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter, BalanceSheetQuarter


def enterprise_value(ticker, date):
    """
    Function that computes the enterprise value for a given ticker symbol at a given date
    The Enterprise Value (EV) is the cost a purchaser must pay to buy the whole company. It includes all equity, including the preferred stocks, the debt, which the purchase must service, any minority interests and adjust for excess case, which the purchase of the whole company can access
    The Enterprise Value (EV) is defined as: EV = market cap + total debt + preferred stock + minority interest - excess cash, where excess cash = current assets - current liabilities
    
    What is minority interest? When a company acquires more than 80% the stock of another company it can shift the acquired company's balance sheet onto its balance sheet eventhough it may own only 85% (and not 100%). Same happens with the income statement. What the minority interest represents is the value of the 15% that the company does not actually own (remember balance sheet needs to stay balanced)

    para ticker:
        - type: string
        - descn: ticker symbol for which the enterprise value should be computed

    para date:
        - type: string in format YYYY-MM-DD
        - descn: given date for which the enterprise value of a company should be computed
    
    return:
        - type: float
        - descn: returns the Enterprise value for the request ticker at the requested date
    """
    # print(f'enterprise value for ticker {ticker} at date: {date}')
    try:
        #get key ratios and balance sheet object
        key_ratios_quart = KeyRatiosQuarter.objects.get(ticker_id = ticker, period_end_date = date)
        balance_sheet_quart = BalanceSheetQuarter.objects.get(ticker_id = ticker, period_end_date = date)

        #compute total debt and excess cash
        total_debt = balance_sheet_quart.st_debt + balance_sheet_quart.lt_debt
        excess_cash = balance_sheet_quart.total_current_assets - balance_sheet_quart.total_current_liabilities

        #compute enterprise value
        ev = key_ratios_quart.market_cap + total_debt + balance_sheet_quart.preferred_stock + balance_sheet_quart.minority_interest_liability - excess_cash

        return ev
    except ObjectDoesNotExist:
        raise Exception(f'Exception enterprise_value function: Enterprise value for ticker {ticker} at date {date} is not available.')
    except:
        return None
    # except:
    #     pass
        # print('some exception in Enterprise Value')

def acquirers_multiple(ticker, date):
    """
    Function that computes the Acquirer's multiple. The acquirer's multiple is defined as: AM = EV/EBIT, where AM is the Acquirer's Multiple, EV is the enterprise value (see function enterprise_value for explanation) and EBIT are the Earnings Before Interest and Taxes
    The lower the Acquirer's multiple, the cheaper the company.
    
    para ticker:
        - type: string
        - descn: ticker symbol for which the enterprise value should be computed

    para date:
        - type: string in format YYYY-MM-DD
        - descn: given date for which the enterprise value of a company should be computed

    return:
        - type: float
        - descn: returns the acquirer's multiple for the requested ticker and date
    """
    #get the enterprise value
    ev = enterprise_value(ticker, date)

    #get the ebit
    try:
        income_statement_quart = IncomeStatementQuarter.objects.get(ticker_id = ticker, period_end_date = date)
        ebit = income_statement_quart.operating_income

        #return acquirer's multiple
        return ev/ebit

    except ObjectDoesNotExist:
        raise Exception(f'Exception acquirers_multiple function: EBIT value for ticker {ticker} at date {date} is not available')
    except:
        return None
    
    # except:
    #     return 500

def ebit(ticker, date):
     #get the ebit
    try:
        income_statement_quart = IncomeStatementQuarter.objects.get(ticker_id = ticker, period_end_date = date)
        ebit = income_statement_quart.operating_income

        #return acquirer's multiple
        return ebit

    except ObjectDoesNotExist:
        raise Exception(f'Exception acquirers_multiple function: EBIT value for ticker {ticker} at date {date} is not available')
    except:
        return None