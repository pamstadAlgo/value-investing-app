from rest_framework.views import APIView
from urllib.request import urlopen
import numpy as np
import pandas as pd
import os
import json
from rest_framework.response import Response
from .serializers import KeyRatioSerializer



def get_request_header_para(request, header_param):
    """
    Function that extracts parameter from request header

    para request:
        - type: django object
        - descn: request coming from frontend

    para header_param:
        - type: string
        - descn: header parameter that should be extracted
    """
    try:
        param = request.headers[header_param]

        return param
    except Exception as err:
        print(f'Error extracting header parameter: {header_param}, ERROR: {err}')



def compute_income_ratio(ticker, API_KEY, numerator, denominator, multiplier=100, handleInfs="setToZero"):
    """
    Function that computes ratio based on information given in the income statement. Example is Gross Profit Margin = Gross Profit/Revenue

    para ticker:
        - type: string
        - descn: ticker symbol of company of which you would like to compute the ratio
    
    para API_KEY:
        - type: string
        - descn: API key of Financial Modelling Prep API
    
    para numerator:
        - type: string
        - descn: item of income statement that should be used in numerator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/income-statement/META?limit=120&apikey=<API_KEY> for example values of string
    
    para denominator:
        - type: string
        - descn: descn: item of income statement that should be used in denominator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/income-statement/META?limit=120&apikey=<API_KEY> for example values of string
    
    para multiplier:
        - type: number
        - descn: multiplier by which result will be mutliplied; can be used for margins to get result in percent if you set multiplier to 100
    
    para handleInfs:
        - type: string
        - descn: Describes how ratios with infinite values are handled. For example the ratio gross profit/revenue results in an inf value if revenue is zero. Supported values are currently: 
                - setToZero: This means that values that result in inf values, will be replaced with zero values
    """
    # allocate variables
    var10y = -1
    var5y = -1
    varNy = -1
    varTTM = -1

    # get yearly and annual income statement
    url_q_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
    url_y_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?limit=120&apikey={API_KEY}'

    #Get annual income statement
    response = urlopen(url_y_income_statement)
    y_income_statement = response.read().decode("utf-8")
    y_income_statement = pd.DataFrame(json.loads(y_income_statement))

    #Get quarterly income statement
    response = urlopen(url_q_income_statement)
    q_income_statement = response.read().decode("utf-8")
    q_income_statement = pd.DataFrame(json.loads(q_income_statement))

    # compute number of years of data that is available
    nr_years = y_income_statement.shape[0]

    #Compute GPM of annual income statements
    y_income_statement['var'] = y_income_statement[numerator]/y_income_statement[denominator]*multiplier

    # check if inf values are present
    if handleInfs == "setToZero":
        y_income_statement['var'].replace([np.inf, -np.inf], 0, inplace=True)

    if nr_years >= 10:
        var5y = round((y_income_statement['var'][:5].mean()),1)
        var10y = round((y_income_statement['var'][:10].mean()),1)
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    elif nr_years >= 5:
        var5y = round((y_income_statement['var'][:5].mean()),1)
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    else:
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    
    # compute TTM GPM
    varTTM = round(((q_income_statement[numerator][:4]).sum()/(q_income_statement[denominator][:4]).sum())*multiplier,1)

    return nr_years, varTTM, varNy, var5y, var10y


def compute_income_balance_ratio(ticker, API_KEY, numerator, denominator, multiplier=100,handleInfs="setToZero"):
    """
    Function that computes ratio based on information given in the income statement and balance sheet. numerator is taken from income statement, denominator from balance sheet. Example is Net Income/Total Assets

    para ticker:
        - type: string
        - descn: ticker symbol of company of which you would like to compute the ratio
    
    para API_KEY:
        - type: string
        - descn: API key of Financial Modelling Prep API
    
    para numerator:
        - type: string
        - descn: item of income statement that should be used in numerator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/income-statement/META?limit=120&apikey=<API_KEY> for example values of string
    
    para denominator:
        - type: string
        - descn: descn: item of balance sheet that should be used in denominator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/balance-sheet-statement/AAPL?limit=120&apikey=<API_KEY> for example values of string
    """
    # allocate variables
    var10y = -1
    var5y = -1
    varNy = -1
    varTTM = -1

    # get yearly and annual income statement
    url_q_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
    url_y_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?limit=120&apikey={API_KEY}'

    #Load quarterly and yearly balance sheets
    url_q_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
    url_y_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=120&apikey={API_KEY}'


    #Get annual income statement
    response = urlopen(url_y_income_statement)
    y_income_statement = response.read().decode("utf-8")
    y_income_statement = pd.DataFrame(json.loads(y_income_statement))

    #Get quarterly income statement
    response = urlopen(url_q_income_statement)
    q_income_statement = response.read().decode("utf-8")
    q_income_statement = pd.DataFrame(json.loads(q_income_statement))

    #Get annual balance sheet
    response = urlopen(url_y_balance_sheet)
    y_balance_sheet = response.read().decode("utf-8")
    y_balance_sheet = pd.DataFrame(json.loads(y_balance_sheet))

    #Get quarterly balance sheet
    response = urlopen(url_q_balance_sheet)
    q_balance_sheet = response.read().decode("utf-8")
    q_balance_sheet = pd.DataFrame(json.loads(q_balance_sheet))

    # compute number of years of data that is available
    nr_years = y_income_statement.shape[0]

    #Compute GPM of annual income statements
    y_income_statement['var'] = y_income_statement[numerator]/y_balance_sheet[denominator]*multiplier

    # check if inf values are present
    if handleInfs == "setToZero":
        y_income_statement['var'].replace([np.inf, -np.inf], 0, inplace=True)
    elif handleInfs == "debtToNetIncome":
        y_income_statement['var'].replace([np.inf, -np.inf], 0.25, inplace=True) #in case we have zero debt we will set to 0.25, which corresponds to threshold that company can pay long-term debt with 4 net incomes


    if nr_years >= 10:
        var5y = round((y_income_statement['var'][:5].mean()),1)
        var10y = round((y_income_statement['var'][:10].mean()),1)
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    elif nr_years >= 5:
        var5y = round((y_income_statement['var'][:5].mean()),1)
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    else:
        varNy = round((y_income_statement['var'][:nr_years].mean()),1)
    
    # compute TTM GPM
    varTTM = round((q_income_statement[numerator][:4].sum()/q_balance_sheet[denominator][:4].mean())*multiplier,1)            
    
    return nr_years, varTTM, varNy, var5y, var10y

def compute_balance_ratio(ticker, API_KEY, numerator, denominator, multiplier=100, handleInfs = "setToZero"):
    """
    Function that computes ratio based on information given in the balance sheet. numerator and denominator are taken from balance sheet. Example is current assets/current liabilities

    para ticker:
        - type: string
        - descn: ticker symbol of company of which you would like to compute the ratio
    
    para API_KEY:
        - type: string
        - descn: API key of Financial Modelling Prep API
    
    para numerator:
        - type: string
        - descn: item of balance sheet that should be used in numerator of ratio; string must be a value as present in the balance sheet of financial modelling prep; see https://financialmodelingprep.com/api/v3/balance-sheet-statement/META?limit=120&apikey=<API_KEY> for example values of string
    
    para denominator:
        - type: string
        - descn: descn: item of balance sheet that should be used in denominator of ratio; string must be a value as present in the balance sheet of financial modelling prep; see https://financialmodelingprep.com/api/v3/balance-sheet-statement/META?limit=120apikey=<API_KEY> for example values of string
    """
    # allocate variables
    var10y = -1
    var5y = -1
    varNy = -1
    varTTM = -1

    #Load quarterly and yearly balance sheets
    url_q_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
    url_y_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=120&apikey={API_KEY}'

    #Get annual balance sheet
    response = urlopen(url_y_balance_sheet)
    y_balance_sheet = response.read().decode("utf-8")
    y_balance_sheet = pd.DataFrame(json.loads(y_balance_sheet))

    #Get quarterly balance sheet
    response = urlopen(url_q_balance_sheet)
    q_balance_sheet = response.read().decode("utf-8")
    q_balance_sheet = pd.DataFrame(json.loads(q_balance_sheet))

    # compute number of years of data that is available
    nr_years = y_balance_sheet.shape[0]

    #Compute GPM of annual income statements
    y_balance_sheet['var'] = y_balance_sheet[numerator]/y_balance_sheet[denominator]*multiplier

    # check if inf values are present
    if handleInfs == "setToZero":
        y_balance_sheet['var'].replace([np.inf, -np.inf], 0, inplace=True)

    if nr_years >= 10:
        var5y = round((y_balance_sheet['var'][:5].mean()),1)
        var10y = round((y_balance_sheet['var'][:10].mean()),1)
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    elif nr_years >= 5:
        var5y = round((y_balance_sheet['var'][:5].mean()),1)
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    else:
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    
    # compute TTM GPM
    varTTM = round((q_balance_sheet[numerator][:4]/q_balance_sheet[denominator][:4]).mean(),2)
    
    return nr_years, varTTM, varNy, var5y, var10y

def get_balance_sheet_item(ticker, API_KEY, item, multiplier=100):
    """
    Function that gets an item from the balance sheet and compute the 5y, 10y, N-year average and the most current number (TTM)

    para ticker:
        - type: string
        - descn: ticker symbol of company of which you would like to compute the ratio
    
    para API_KEY:
        - type: string
        - descn: API key of Financial Modelling Prep API
    
    para numerator:
        - type: string
        - descn: item of income statement that should be used in numerator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/income-statement/META?limit=120&apikey=<API_KEY> for example values of string
    
    para denominator:
        - type: string
        - descn: descn: item of balance sheet that should be used in denominator of ratio; string must be a value as present in the income statement of financial modelling prep; see https://financialmodelingprep.com/api/v3/balance-sheet-statement/AAPL?limit=120&apikey=<API_KEY> for example values of string
    """
    # allocate variables
    var10y = None
    var5y = None
    varNy = None
    varTTM = None

    #Load quarterly and yearly balance sheets
    url_q_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
    url_y_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=120&apikey={API_KEY}'

    #Get annual balance sheet
    response = urlopen(url_y_balance_sheet)
    y_balance_sheet = response.read().decode("utf-8")
    y_balance_sheet = pd.DataFrame(json.loads(y_balance_sheet))

    #Get quarterly balance sheet
    response = urlopen(url_q_balance_sheet)
    q_balance_sheet = response.read().decode("utf-8")
    q_balance_sheet = pd.DataFrame(json.loads(q_balance_sheet))

    # compute number of years of data that is available
    nr_years = y_balance_sheet.shape[0]

    #Compute GPM of annual income statements
    y_balance_sheet['var'] = y_balance_sheet[item]*multiplier

    if nr_years >= 10:
        var5y = round((y_balance_sheet['var'][:5].mean()),1)
        var10y = round((y_balance_sheet['var'][:10].mean()),1)
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    elif nr_years >= 5:
        var5y = round((y_balance_sheet['var'][:5].mean()),1)
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    else:
        varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
    
    # compute TTM GPM
    varTTM = round(q_balance_sheet[item][0]*multiplier,1)
    
    return nr_years, varTTM, varNy, var5y, var10y


# Create your views here.
class GrossProfitMarginAPIView(APIView):
    def get(self, request):
        """
        Handles GET request to retrieve Gross Profit Margin = Gross Profit/Revenue
        Gross profit margin = Gross Proft/Total Revenue (page 33)
            - A durable competitive advantage can give freedom to price products freely
        and therefore leading to high gross profit margin.
            - Companies with durable competitive advantage have Gross Profit Margin > 40%
            - We are looking for consistency in high GPM, therefore consider last 10 years
            - It is important to note that a high GPM is not fail-safe as high operating expenses can eat up high GPM
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, gpmTTM, gpmNy, gpm5y, gpm10y = compute_income_ratio(ticker, API_KEY, "grossProfit", "revenue", handleInfs="setToZero")
            
            # construct response data dictionary
            response = {'name': 'Gross Profit Margin', 'formula' : 'Gross Profit/Total Revenue', 'nrYears' : nr_years, 'var5Year': gpm5y, 'var10Year' : gpm10y, 'varNYear' : gpmNy, 'varTTM' : gpmTTM, 'thld' : '> 40%' ,'descn' : """- A durable competitive advantage can give freedom to price products freely and therefore leading to high gross profit margin.
                        - Companies with durable competitive advantage have Gross Profit Margin > 40%
                        - We are looking for consistency in high GPM, therefore consider last 10 years
                        - It is important to note that a high GPM is not fail-safe as high operating expenses can eat up high GPM """
                        }

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('ticker not present in session!')
            return Response([])

class SellingGeneralAdminMarginAPIView(APIView):
    def get(self, request):
        """
        Handles GET request to retrieve SGA Margin = Selling General Admin Expenses/Gross Profit
        SGA Margin = SGA Expense/Gross Profit
            - Anything with SGA Margin < 30 % is considered fantastic
            - Note that also companies with competitive durable advantage can have SGA Margin > 30%. Therefore the
            absolute value does not always tell complete story, but consistency!
            - Anything above 80% should raise a red flag
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, sgamTTM, sgamNy, sgam5y, sgam10y = compute_income_ratio(ticker, API_KEY, "sellingGeneralAndAdministrativeExpenses", "grossProfit" , handleInfs="setToZero")
            
            # construct response data dictionary
            response = {'name': 'SGA Margin', 'formula' : 'SGA Expense/Gross Profit', 'nrYears' : nr_years, 'var5Year': sgam5y, 'var10Year' : sgam10y, 'varNYear' : sgamNy, 'varTTM' : sgamTTM, 'thld' : '< 30%', 'descn' : """- Anything with SGA Margin < 30 % is considered fantastic
            - Note that also companies with competitive durable advantage can have SGA Margin > 30%. Therefore the
            absolute value does not always tell complete story, but consistency!
            - Anything above 80% should raise a red flag"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])

class ResearchAndDevelopMarginAPIView(APIView):
    def get(self, request):
        """
        Handles GET request to retrieve R&D Margin = Research and Development Expenses/Revenue
        R&D Margin = R&D Expenses/Gross Profit
            - Anything with R&D Margin > 30 % is probably in an industry requires constant change in order to stay competitive
            - Usually companies with a durable competitive advantage have low R&D expenses
            - Anything that is constantly above 40% should raise a red flag (or you have to be sure that these expenses will pay off at some time)
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, radmTTM, radmNy, radm5y, radm10y = compute_income_ratio(ticker, API_KEY, "researchAndDevelopmentExpenses", "grossProfit", handleInfs="setToZero")
            
            # construct response data dictionary
            response = {'name' : 'R&D Margin', 'formula' : 'R&D Expenses/Gross Profit',  'nrYears' : nr_years, 'var5Year': radm5y, 'var10Year' : radm10y, 'varNYear' : radmNy, 'varTTM' : radmTTM, 'thld' : '< 30%', 'descn' : """ - Anything with R&D Margin > 30 % is probably in an industry requires constant change in order to stay competitive
            - Usually companies with a durable competitive advantage have low R&D expenses
            - Anything that is constantly above 40% should raise a red flag (or you have to be sure that these expenses will pay off at some time)"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])

class DeprecAndAmortMarginAPIView(APIView):
    def get(self, request):
        """
        Handles GET request to retrieve D&A = Deprecitation & Amortization/Gross Profit
        Depreciation & Amortization Margin = Deprecitation & Amortization/Gross Profit
            - Anything with Depreciation & Amortization Margin < 10 % is considered fantastic
            - Note that a high Depreciation & Amortization Margin can indicate an industry that is highly competitive and capital-intensive (like automobiile industry)
            - Anything above 30 % should raise a red flag
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, daamTTM, daamNy, daam5y, daam10y = compute_income_ratio(ticker, API_KEY, "depreciationAndAmortization", "grossProfit", handleInfs="setToZero")
            
            # construct response data dictionary
            response = {'name' : 'D&A Margin', 'formula' : 'D&A/Gross Profit',  'nrYears' : nr_years, 'var5Year': daam5y, 'var10Year' : daam10y, 'varNYear' : daamNy, 'varTTM' : daamTTM, 'thld' : '< 10%', 'descn' : """     - Anything with Depreciation & Amortization Margin < 10 % is considered fantastic
            - Note that a high Depreciation & Amortization Margin can indicate an industry that is highly competitive and capital-intensive (like automobiile industry)
            - Anything above 30 % should raise a red flag"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])

class NetIncomeMarginAPIView(APIView):
    def get(self, request):
        """
        Net Income Margin = Net Income/Total Revenue
            - Net Income Margins above 20 % are considered fantastic
            - Net income Margins between 10 % and 20 % are fine and need deeper analysis
            - Net Income Margin below 10 % over several years is concerning or indicates highly competitive industry
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, nimTTM, nimNy, nim5y, nim10y = compute_income_ratio(ticker, API_KEY, "netIncome", "revenue", handleInfs="setToZero")
            
            # construct response data dictionary
            response = {'name' : 'Net Income Margin', 'formula' : 'Net income/Total Revenue',  'nrYears' : nr_years, 'var5Year': nim5y, 'var10Year' : nim10y, 'varNYear' : nimNy, 'varTTM' : nimTTM , 'thld' : '> 20%', 'descn' : """- Net Income Margins above 20 % are considered fantastic
            - Net income Margins between 10 % and 20 % are fine and need deeper analysis
            - Net Income Margin below 10 % over several years is concerning or indicates highly competitive industry"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class ReturnOnTotalAssetsAPIView(APIView):
    def get(self, request):
        """
        Return on Total asset is defined as = Net Income/Total Assets
            - It is used to measure the company's effciency
            - Note that a high return on total assets alone is not always a good indicator, also consider how high the total assets are (moat),
              because a high return on assets is often not sustainable
            - Coca-Cola has 12 % return on total assets, Moody has 43 % return on total assets (but much less total assets --> easier to enter and compete with Moody's)
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, nimTTM, nimNy, nim5y, nim10y = compute_income_balance_ratio(ticker, API_KEY, "netIncome", "totalAssets")
            
            # construct response data dictionary
            response = {'name' : 'Return on total asset', 'formula' : 'Net Income/Total Assets', 'nrYears' : nr_years, 'var5Year': nim5y, 'var10Year' : nim10y, 'varNYear' : nimNy, 'varTTM' : nimTTM , 'thld' : '> 15%', 'descn' : """ - It is used to measure the company's effciency
            - Note that a high return on total assets alone is not always a good indicator, also consider how high the total assets are (moat),
              because a high return on assets is often not sustainable
            - Coca-Cola has 12 % return on total assets, Moody has 43 % return on total assets (but much less total assets --> easier to enter and compete with Moody's)"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class TotalAssetsAPIView(APIView):
    def get(self,request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, ttaTTM, ttaNy, tta5y, tta10y = get_balance_sheet_item(ticker, API_KEY, 'totalAssets')
            
            # construct response data dictionary
            response = {'name': 'Total Assets', 'formula' : 'current assets + non-current assets', 'nrYears' : nr_years, 'var5Year': tta5y, 'var10Year' : tta10y, 'varNYear' : ttaNy, 'varTTM' : ttaTTM , 'thld' : '', 'descn' : """The total assets can determine how big the moat of a company with a durable competitive advantage is.
        For example Coca-Cola has a return on assets (net income/total assets) of 12 %, but total assets of 43 billions. Moody has a return on assets
        of 1.7 Billions, but a return on assets of 43 %. High return on assets in company with a small number for total assets is hard to sustain, because
        raising 1.7 billion and then compete with moody is not impossible. But raising 43 billion is a hard thing to do. So a really high return on assets
        may indicate vulnerability in the durability of a company's advantage/moat. Therefore always consider return on assets in combination with total assets"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class ReturnOnStockholderEquityAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, roeTTM, roeNy, roe5y, roe10y = compute_income_balance_ratio(ticker, API_KEY, "netIncome", "totalStockholdersEquity")
            
            # construct response data dictionary
            response = {'name' : 'Return on Shareholder equity', 'formula' : 'Net income/Shareholder equity', 'nrYears' : nr_years, 'var5Year': roe5y, 'var10Year' : roe10y, 'varNYear' : roeNy, 'varTTM' : roeTTM , 'thld' : '> 25%', 'descn' : """        Function computes the return on shareholder equity, which is defined as net income/shareholder equity. Shareholder equity can increase by sellling
        preferred and common stock the retained earnings that are kept in the company. Net income/shareholder equity is a measure of how efficient companies
        make use of the shareholder's money/the earnings the retain an reinvest
        Everything above 25 % is considered great"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        

class CurrentAssetsToCurrentLiabilitiesAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, curTTM, curNy, cur5y, cur10y = compute_balance_ratio(ticker, API_KEY, "totalCurrentAssets", "totalCurrentLiabilities", multiplier=1)
            
            # construct response data dictionary
            response = {'name' : 'current ratio', 'formula' : 'current assets/current liabilities', 'nrYears' : nr_years, 'var5Year': cur5y, 'var10Year' : cur10y, 'varNYear' : curNy, 'varTTM' : curTTM , 'thld' : '> 1', 'descn' : """ This can determine the liquidity of the company. A current ratio higher than 1 is considered good, below 1 bad.
        But companies with durable competitive advantage often have current ratio < 1, because they have such high earning power, they 
        do not need a liquidity cushion, as a lot of money is coming in regularly"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class CashAndEquityToCurrentLiabilitiesAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, cashRatioTTM, cashRatioNy, cashRatio5y, cashRatio10y = compute_balance_ratio(ticker, API_KEY, "cashAndCashEquivalents", "totalCurrentLiabilities", multiplier=1)
            
            # construct response data dictionary
            response = {'name' : 'Cash Ratio', 'formula' : 'cash + equivalents/current liabilities', 'nrYears' : nr_years, 'var5Year': cashRatio5y, 'var10Year' : cashRatio10y, 'varNYear' : cashRatioNy, 'varTTM' : cashRatioTTM , 'thld' : '> 1', 'descn' : """  Cash ratio is defined as (Cash + Cash Equivalents)/Current Liabilities. Cash is the most liquid asset and makes sure that
        short term obligations can be covered with 100 % certainty."""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        

class TotalDebtToEquityAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, debtEquityTTM, debtEquityNy, debtEquity5y, debtEquity10y = compute_balance_ratio(ticker, API_KEY, "totalLiabilities", "totalStockholdersEquity", multiplier=1)
            
            # construct response data dictionary
            response = {'name' : 'Debt to Equity', 'formula' : 'Total Liabilities/Equity', 'nrYears' : nr_years, 'var5Year': debtEquity5y, 'var10Year' : debtEquity10y, 'varNYear' : debtEquityNy, 'varTTM' : debtEquityTTM , 'thld' : '< 0.8', 'descn' : """  We expect that a company with durable competitive advantage should show
        higher level of shareholder's equity than total liabilities, so they will not use debt to finance their operation. It is also important to look
        at share buybacks when consider total liabilites/Shareholder's equity, as share buybacks can decrease shareholder's equity (treasury stock) and
        therefore increase the ratio, eventhough share buybacks are a positive sign
        Anything below 0.8 is a good chance that company has competitive advantage"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])


class AdjTotalDebtToEquityAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            # allocate variables
            var10y = -1
            var5y = -1
            varNy = -1
            varTTM = -1

            #Load quarterly and yearly balance sheets
            url_q_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
            url_y_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=120&apikey={API_KEY}'

            #Load quarterly and yearly cash flow statements
            url_q_cash_flow = f'https://financialmodelingprep.com/api/v3/cash-flow-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
            url_y_cash_flow = f'https://financialmodelingprep.com/api/v3/cash-flow-statement/{ticker}?limit=120&apikey={API_KEY}'

            #Get annual balance sheet
            response = urlopen(url_y_balance_sheet)
            y_balance_sheet = response.read().decode("utf-8")
            y_balance_sheet = pd.DataFrame(json.loads(y_balance_sheet))

            #Get quarterly balance sheet
            response = urlopen(url_q_balance_sheet)
            q_balance_sheet = response.read().decode("utf-8")
            q_balance_sheet = pd.DataFrame(json.loads(q_balance_sheet))

            #get cash flow statements (yearly and quarterly)
            response = urlopen(url_q_cash_flow)
            q_cash_flow = response.read().decode("utf-8")
            q_cash_flow = pd.DataFrame(json.loads(q_cash_flow))

            #Get quarterly balance sheet
            response = urlopen(url_y_cash_flow)
            y_cash_flow = response.read().decode("utf-8")
            y_cash_flow = pd.DataFrame(json.loads(y_cash_flow))

            # compute number of years of data that is available
            nr_years = y_cash_flow.shape[0]

            #compute cumulative sum (cumsum) of share buybacks over the last years
            y_cash_flow['stock_repurchase'] = abs(y_cash_flow["commonStockRepurchased"])
            y_cash_flow['stock_repurchase_cumsum'] = y_cash_flow['stock_repurchase'][::-1].cumsum()
            y_cash_flow['stock_repurchase_cumsum'] = y_cash_flow['stock_repurchase_cumsum'][::-1]

            #compute adjusted debt to equity ratio, where share buybacks are added to denominator
            y_balance_sheet['var'] = y_balance_sheet["totalLiabilities"]/(y_balance_sheet["totalStockholdersEquity"]+ y_cash_flow['stock_repurchase_cumsum'])

            if nr_years >= 10:
                var5y = round((y_balance_sheet['var'][:5].mean()),1)
                var10y = round((y_balance_sheet['var'][:10].mean()),1)
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
            elif nr_years >= 5:
                var5y = round((y_balance_sheet['var'][:5].mean()),1)
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
            else:
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)

            q_cash_flow = q_cash_flow[:4]
             #compute cumulative sum (cumsum) of share buybacks over the last years
            q_cash_flow['stock_repurchase'] = abs(q_cash_flow["commonStockRepurchased"][:4])
            q_cash_flow['stock_repurchase_cumsum'] = q_cash_flow['stock_repurchase'][::-1].cumsum()
            q_cash_flow['stock_repurchase_cumsum'] = q_cash_flow['stock_repurchase_cumsum'][::-1]

            varTTM = round((q_balance_sheet["totalLiabilities"][:4]/(q_balance_sheet["totalStockholdersEquity"][:4] + q_cash_flow['stock_repurchase_cumsum'])).mean(),2)
            
            # construct response data dictionary
            response = {'name' : 'Adjusted Debt to Equity', 'formula' : 'Total Liabilities/(Equity + share buybacks)', 'nrYears' : nr_years, 'var5Year': var5y, 'var10Year' : var10y, 'varNYear' : varNy, 'varTTM' : varTTM , 'thld' : '< 0.8', 'descn' : """  Adjusted debt to shareholder equity takes into account the amount of stock repurchases and stock issuance. Adjusted debt to shareholder equity should also be below 0.8; if significantly lower than debt to shareholder equity ratio sign that
        company buys back a lot of shares"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class InterestExpenseToEBITAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            # allocate variables
            var10y = -1
            var5y = -1
            varNy = -1
            varTTM = -1

            # get yearly and annual income statement
            url_q_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
            url_y_income_statement = f'https://financialmodelingprep.com/api/v3/income-statement/{ticker}?limit=120&apikey={API_KEY}'

            #Get annual income statement
            response = urlopen(url_y_income_statement)
            y_income_statement = response.read().decode("utf-8")
            y_income_statement = pd.DataFrame(json.loads(y_income_statement))

            #Get quarterly income statement
            response = urlopen(url_q_income_statement)
            q_income_statement = response.read().decode("utf-8")
            q_income_statement = pd.DataFrame(json.loads(q_income_statement))

            # compute number of years of data that is available
            nr_years = y_income_statement.shape[0]

            #compute difference between interest income and interest expense to determine whether money was gained or lost from interest
            #in case of interest income = interest expense it means that money was earned (bit of a bug from financial modelling prep)
            #in case the difference is negative, money was spent on interest
            y_income_statement['NetInterestExpense'] = y_income_statement["interestIncome"].sub(y_income_statement["interestExpense"], axis=0) 

            #set net interest expense to zero where it is greater or equal to zero
            y_income_statement['NetInterestExpense'][y_income_statement["NetInterestExpense"] >= 0] = 0

            #Compute interest expense margin (iem) of annual income statements
            y_income_statement['var'] = abs(y_income_statement["NetInterestExpense"])/y_income_statement["operatingIncome"]

            if nr_years >= 10:
                var5y = round((y_income_statement['var'][:5].mean()),1)
                var10y = round((y_income_statement['var'][:10].mean()),1)
                varNy = round((y_income_statement['var'][:nr_years].mean()),1)
            elif nr_years >= 5:
                var5y = round((y_income_statement['var'][:5].mean()),1)
                varNy = round((y_income_statement['var'][:nr_years].mean()),1)
            else:
                varNy = round((y_income_statement['var'][:nr_years].mean()),1)

            q_income_statement = q_income_statement[:4]

            #compute net interest expense over last four quarters
            q_income_statement["NetInterestExpense"] = q_income_statement["interestIncome"].sub(q_income_statement["interestExpense"])

            #set net interest expense to zero where it is greater or equal to zero
            q_income_statement['NetInterestExpense'][q_income_statement["NetInterestExpense"] >= 0] = 0

            #compute interest expense margin over trailing twelve months
            varTTM = round((abs(q_income_statement["NetInterestExpense"]).sum()/q_income_statement["operatingIncome"].sum()),2)

            # construct response data dictionary
            response = {'name' : 'Interest Expense Margin', 'formula' : 'Interest Expense/EBIT', 'nrYears' : nr_years, 'var5Year': var5y, 'var10Year' : var10y, 'varNYear' : varNy, 'varTTM' : varTTM , 'thld' : '< 0.15', 'descn' : """   - We are looking for companies with Interest Expense Margin < 15%
            - Note that there are also companies which earn money from interest
            - In general, the ratio is industry dependent. Nevertheless, a increase in this ratio, independent of industry, can indicate bad times"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])


class CashAndEquivToDebtAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            # allocate variables
            var10y = -1
            var5y = -1
            varNy = -1
            varTTM = -1

            #Load quarterly and yearly balance sheets
            url_q_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?period=quarter&limit=400&apikey={API_KEY}'
            url_y_balance_sheet = f'https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker}?limit=120&apikey={API_KEY}'

            #Get annual balance sheet
            response = urlopen(url_y_balance_sheet)
            y_balance_sheet = response.read().decode("utf-8")
            y_balance_sheet = pd.DataFrame(json.loads(y_balance_sheet))

            #Get quarterly balance sheet
            response = urlopen(url_q_balance_sheet)
            q_balance_sheet = response.read().decode("utf-8")
            q_balance_sheet = pd.DataFrame(json.loads(q_balance_sheet))

            # compute number of years of data that is available
            nr_years = y_balance_sheet.shape[0]

             #Compute net cash and short term investments to debt ratio of annual income statements
            y_balance_sheet['var'] = y_balance_sheet["cashAndShortTermInvestments"]/(y_balance_sheet["shortTermDebt"] + y_balance_sheet["longTermDebt"])

            # in case company has no debt, ratio will be infinite --> in that case we will replace it with threshold 1 (conservative approach)
            y_balance_sheet.replace([np.inf, -np.inf], 1, inplace=True)

            if nr_years >= 10:
                var5y = round((y_balance_sheet['var'][:5].mean()),1)
                var10y = round((y_balance_sheet['var'][:10].mean()),1)
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
            elif nr_years >= 5:
                var5y = round((y_balance_sheet['var'][:5].mean()),1)
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)
            else:
                varNy = round((y_balance_sheet['var'][:nr_years].mean()),1)

            #compute interest expense margin over trailing twelve months
            varTTM = round((q_balance_sheet["cashAndShortTermInvestments"][:4]/(q_balance_sheet["shortTermDebt"][:4] + q_balance_sheet["longTermDebt"][:4])).mean(),2)

            # construct response data dictionary
            response = {'name' : 'Cash + Equivalents to Debt', 'formula' : 'Cash + short-term investments/(short + long debt)', 'nrYears' : nr_years, 'var5Year': var5y, 'var10Year' : var10y, 'varNYear' : varNy, 'varTTM' : varTTM , 'thld' : '> 1', 'descn' : """Interesting for companies that had a current beatdown. Can be an indicator whether the company can survive troubling times"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class LongTermDebtToNetIncomeAPIView(APIView):
    def get(self, request):
        """
       Function computes the ratio of net income/long term debt. A company with durable competitve advantage should be able to pay of
        its long-term debt with 3 to 4 years of net income
        """
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, nimTTM, nimNy, nim5y, nim10y = compute_income_balance_ratio(ticker, API_KEY, "netIncome", "longTermDebt", handleInfs="debtToNetIncome")
            
            # construct response data dictionary
            response = {'name' : 'Long-term debt to net income', 'formula' : 'long-term debt/Net income', 'nrYears' : nr_years, 'var5Year': round(1/nim5y,2), 'var10Year' : round(1/nim10y,2), 'varNYear' : round(1/nimNy,2), 'varTTM' : round(1/nimTTM,2) , 'thld' : '< 4', 'descn' : """    Function computes the ratio of net income/long term debt. A company with durable competitve advantage should be able to pay of
        its long-term debt with 3 to 4 years of net income"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)

        else:
            print('EquityMv ticker not present in session!')
            return Response([])
        
class ShortToLongDebtAPIView(APIView):
    def get(self, request):
        ticker = get_request_header_para(request, 'ticker')

        if 'ticker' is not None:
            #extract API_KEY
            API_KEY = os.environ["FMP_API_KEY"]

            nr_years, curTTM, curNy, cur5y, cur10y = compute_balance_ratio(ticker, API_KEY, "shortTermDebt", "longTermDebt", multiplier=1)
            
            # construct response data dictionary
            response = {'name' : 'short to long-term debt', 'formula' : 'short-term debt/long-term debt', 'nrYears' : nr_years, 'var5Year': cur5y, 'var10Year' : cur10y, 'varNYear' : curNy, 'varTTM' : curTTM , 'thld' : '< 1', 'descn' : """ More short term debt than long term debt can indicate the following things:
            - They make money by lending the money they got from short term debt as long term debt ("rolling over the debt")
            - Can indicate an aggressive growth strategy which is often not sutainable in the long run"""}

            responseSerialized = KeyRatioSerializer(response).data

            return Response(responseSerialized)
        else:
            print('EquityMv ticker not present in session!')
            return Response([])