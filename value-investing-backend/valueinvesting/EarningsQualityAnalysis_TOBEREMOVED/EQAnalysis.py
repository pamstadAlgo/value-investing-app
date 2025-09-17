import sys
import os
import uuid
import django
import pandas as pd
import collections
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression
#create django setup; needed otherwise we cannot use django models outside of django apps
sys.path.append("..")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "valueinvesting.settings")
django.setup()

from quickfs_dj.models import KeyRatiosQuarter, IncomeStatementAnnual, TradedCompanies, IncomeStatementQuarter, CashFlowStatementAnnual, BalanceSheetQuarter, BalanceSheetAnnual, TradedCompanies


TICKER = 'CRNC'

def RequiredLiquidFundsForIndustry(ticker, nr_years_liq_ratio = 3):
    """
    Computes the liquid fund ratio = liquid funds/revenue for a certain industry. It returns the lower tail of the liquid funds ratio for the industry (first quartile, which is the 0.25 quantile)
    """
    #initalize list where we store (cash_and_equiv + st_investments)/revenue for different companies
    liq_ratios = []

    #get industry of company
    industry = TradedCompanies.objects.get(ticker=ticker).industry

    #search for companies in the same industry
    comp_from_same_industry = TradedCompanies.objects.filter(industry=industry)

    for comp in comp_from_same_industry:
        #compute liquid funds/revenue where liquid funds = cash_and_equivalents + short_term_investments
        ticker_symb = comp.ticker

        #check if company has more than 100 million in revenue; otherwise we will not consider it (doron nissim also does it like that)
        income = IncomeStatementAnnual.objects.filter(ticker_id = ticker_symb).values_list('period_end_date', 'revenue').order_by('-period_end_date')[:nr_years_liq_ratio][::-1]

        #get revenue of most recent year
        revenue = income[-1][1]

        #like nissim we will only consider companies with revenue greather than 100 millions
        if revenue > 100*10**6 and revenue > 0 and revenue is not None:
            #create list that stores liquidity ratios
            liq_ratio = []

            #get balance sheet info for that company
            balance = BalanceSheetAnnual.objects.filter(ticker_id = ticker_symb).values_list('cash_and_equiv', 'st_investments').order_by('-period_end_date')[:nr_years_liq_ratio][::-1]
        
            for idx, balance in enumerate(balance):
                #compute liquid funds and revenue
                liq_funds = float(balance[0] or 0) + float(balance[1] or 0)
                revenue = income[idx][1]

                try:
                    liq_ratio.append(liq_funds/revenue)
                except ZeroDivisionError:
                    print(f'zero revenue divsion for ticker {ticker_symb}, period: {income[idx][0]}')
            
            #compute average
            avg = sum(liq_ratio)/len(liq_ratio)

            #append to liquidity ratios
            liq_ratios.append(avg)
    
    #transform list of ratios to numpy array --> this way we can plot histogram
    liq_ratios_np = np.array(liq_ratios)

    #compute quantile of liq ratios
    quartile = np.quantile(liq_ratios_np, 0.25)

    return quartile

def PlotNetOperatingAssetsIntensity(ticker, nr_years=6, nr_years_liq_ratio = 3):
    """
    
    para nr_years_liq_ratio:
        - type: integer
        - descn: In order to get the required liquid funds, we will compute the ratio (cash_and_equiv + st_investments)/revenue for the industry. The lower quartile of the (cash_and_equiv + st_investments)/revenue distribution will determine the required funds. To fight volatility, we will compute for each company the average (cash_and_equiv + st_investments)/revenue for the past nr_years_liq_ratio years
    """
    #get liquid funds of requested ticker (liquid funds = cash_and_equiv + st_investments)
    balance_ticker = BalanceSheetAnnual.objects.filter(ticker_id = ticker).values_list('cash_and_equiv', 'st_investments', 'period_end_date', 'total_assets', 'equity_and_other_investments', 'total_liabilities', 'st_debt', 'lt_debt').order_by('-period_end_date')[:nr_years][::-1]
    # liquid_funds = float(balance_ticker[-1][0] or 0) + float(balance_ticker[-1][1] or 0)

    #get revenue of our company
    income_ticker = IncomeStatementAnnual.objects.filter(ticker_id = ticker).values_list('period_end_date', 'revenue').order_by('-period_end_date')[:nr_years][::-1]
    revenue_ticker = income_ticker[-1][1]

    #initalize list where we store (cash_and_equiv + st_investments)/revenue for different companies
    liq_ratios = []

    #get industry of company
    industry = TradedCompanies.objects.get(ticker=ticker).industry

    #search for companies in the same industry
    comp_from_same_industry = TradedCompanies.objects.filter(industry=industry)

    for comp in comp_from_same_industry:
        #compute liquid funds/revenue where liquid funds = cash_and_equivalents + short_term_investments
        ticker_symb = comp.ticker

        #check if company has more than 100 million in revenue; otherwise we will not consider it (doron nissim also does it like that)
        income = IncomeStatementAnnual.objects.filter(ticker_id = ticker_symb).values_list('period_end_date', 'revenue').order_by('-period_end_date')[:nr_years_liq_ratio][::-1]

        #get revenue of most recent year
        revenue = income[-1][1]

        if revenue > 100*10**6 and revenue > 0 and revenue is not None:
            #create list that stores liquidity ratios
            liq_ratio = []

            #get balance sheet info for that company
            balance = BalanceSheetAnnual.objects.filter(ticker_id = ticker_symb).values_list('cash_and_equiv', 'st_investments').order_by('-period_end_date')[:nr_years_liq_ratio][::-1]
        
            for idx, balance in enumerate(balance):
                #compute liquid funds and revenue
                liq_funds = float(balance[0] or 0) + float(balance[1] or 0)
                revenue = income[idx][1]

                try:
                    ratio = liq_funds/revenue
                    liq_ratio.append(liq_funds/revenue)
                except ZeroDivisionError:
                    print(f'zero revenue divsion for ticker {ticker_symb}, period: {income[idx][0]}')
            
            #compute average
            avg = sum(liq_ratio)/len(liq_ratio)

            #append to liquidity ratios
            liq_ratios.append(avg)

    #transform list of ratios to numpy array --> this way we can plot histogram
    liq_ratios_np = np.array(liq_ratios)

    #compute quantile of liq ratios
    quartile = np.quantile(liq_ratios_np, 0.25)

    #assign list for net operating assets
    net_operating_assets = []
    net_operating_assets_intensity = []
    dates = []

    #compute net operating assets = operating assets - operating liabilities 
    for idx, row in enumerate(balance_ticker):
        #compute liquid funds
        liq_funds = float(row[0] or 0) + float(row[1] or 0)

        #get revenue of this year
        revenue = income_ticker[idx][1]

        #append date values
        dates.append(income_ticker[idx][0])

        required_liquid_funds = min(liq_funds, quartile*revenue_ticker)

        #compute excess liquid funds which is not part of operating assets
        excess_liquid_funds = liq_funds - required_liquid_funds

        #compute operating assets = total assets - equity and other investments - excess liquid funds
        operating_assets = row[3] - row[4] - excess_liquid_funds

        #compute operating liabilities
        operating_liabilities = row[5] - row[6] - row[7] 

        #append values to list
        net_operating_assets.append(operating_assets - operating_liabilities)
        net_operating_assets_intensity.append((operating_assets - operating_liabilities)/revenue)

        # x_lin_regression.append(idx)

        # dates_fcf.append(row[0])
        # y_fcf.append(row[1] - row[2])

        # dates_cash_conversion_ratio.append(row[0])
        # y_cash_conversion_ratio.append((row[1] - row[2])/income_statement[idx][1])

        # dates_ni.append(income_statement[idx][0])
        # y_ni.append(income_statement[idx][1])

    plt.plot(dates, net_operating_assets_intensity, label="NOA/Revenue")
    # plt.plot(dates_ni, y_ni, label="NI")

    # plt.plot(dates_cfo[-nr_years:], y_cfo[-nr_years:], label="CFO/Revenue")
    # plt.plot(dates_cfo[-nr_years:], y_pred_ni[-nr_years:], label="linear regression")
    plt.title(f'Net operating assets intensity, {ticker}')
    # plt.plot(dates_cfo[-nr_years:], deflated_accruals[-nr_years:], label="deflated accruals")
    leg = plt.legend(loc='best')
    plt.show()


    # required_liquid_funds = min(liq_funds, quartile*revenue_ticker)

    # #compute excess liquid funds which is not part of operating assets
    # excess_liquid_funds = liq_funds - required_liquid_funds

    # #compute operating assets = total assets - equity and other investments - excess liquid funds
    # operating_assets = balance_ticker[-1][3] - balance_ticker[-1][4] - excess_liquid_funds

    # #compute operating liabilities
    # operating_liabilities = balance_ticker[-1][5] - balance_ticker[-1][6] - balance_ticker[-1][7] 
 

def PlotUnusualExpenseItems(ticker, nr_years = 6):
    income_statement = IncomeStatementAnnual.objects.filter(ticker_id = ticker).values_list( 'period_end_date', 'revenue', 'other_nonoperating_income' ).order_by('-period_end_date')[:nr_years][::-1]

    if len(income_statement) < nr_years:
        nr_years = len(income_statement)

    #store numbers for Unusual Expense Items (UEI)
    dates_uei = []
    y_uei = []

    for idx, row in enumerate(income_statement):
        dates_uei.append(row[0])
        y_uei.append(row[2]/row[1])

    # plt.plot(dates_cash_conversion_ratio, y_cash_conversion_ratio, label="FCF/NI")
    plt.plot(dates_uei, y_uei, label="UEI/Revenue")

    # plt.plot(dates_cfo[-nr_years:], y_cfo[-nr_years:], label="CFO/Revenue")
    # plt.plot(dates_cfo[-nr_years:], y_pred_ni[-nr_years:], label="linear regression")
    plt.title(f'Unsual Expense Items, {ticker}')
    # plt.plot(dates_cfo[-nr_years:], deflated_accruals[-nr_years:], label="deflated accruals")
    leg = plt.legend(loc='best')
    plt.show()

def PlotCashConversionRatio(ticker, nr_years = 6):
    #get operating cash flow and capex
    cf_statement = CashFlowStatementAnnual.objects.filter(ticker_id = ticker).values_list('period_end_date', 'cf_cfo', 'cfi_ppe_purchases').order_by('-period_end_date')[:nr_years][::-1]
    income_statement = IncomeStatementAnnual.objects.filter(ticker_id = ticker).values_list( 'period_end_date', 'net_income' ).order_by('-period_end_date')[:nr_years][::-1]

    if len(cf_statement) < nr_years:
        nr_years = len(cf_statement)
    
    #restrict to number of years requested
    # cf_statement = cf_statement[-nr_years:]
    # income_statement = income_statement[-nr_years:]
    #array that stores x values for linear regression (date time object cannot be used for linear regression)
    x_lin_regression = []

    dates_fcf = []
    y_fcf = []

    dates_ni = []
    y_ni = []

    dates_cash_conversion_ratio= []
    y_cash_conversion_ratio = []

    for idx, row in enumerate(cf_statement):
        x_lin_regression.append(idx)

        dates_fcf.append(row[0])
        y_fcf.append(row[1] - row[2])

        dates_cash_conversion_ratio.append(row[0])
        y_cash_conversion_ratio.append((row[1] - row[2])/income_statement[idx][1])

        dates_ni.append(income_statement[idx][0])
        y_ni.append(income_statement[idx][1])


    X = np.array(x_lin_regression).reshape(-1,1)
    
    lin_reg_cash_conversion = LinearRegression().fit(X, y_cash_conversion_ratio)

    if lin_reg_cash_conversion.coef_ > 0:
        status = "Increasing Cash Conversion Ratio"
    else:
        status = "Red flag, decreasing cash conversion ratio"

    # plt.plot(dates_cash_conversion_ratio, y_cash_conversion_ratio, label="FCF/NI")
    plt.plot(dates_fcf, y_fcf, label="FCF")
    plt.plot(dates_ni, y_ni, label="NI")

    # plt.plot(dates_cfo[-nr_years:], y_cfo[-nr_years:], label="CFO/Revenue")
    # plt.plot(dates_cfo[-nr_years:], y_pred_ni[-nr_years:], label="linear regression")
    plt.title(ticker)
    # plt.plot(dates_cfo[-nr_years:], deflated_accruals[-nr_years:], label="deflated accruals")
    leg = plt.legend(loc='best')

    print(f'average {nr_years} years cash conversion ratio {ticker}: ' ,sum(y_cash_conversion_ratio)/len(y_cash_conversion_ratio))
    print(f'cash conversion ratioo {ticker} current year: ' , y_cash_conversion_ratio[-1])
    print(f'earnings state: ' , status)

    plt.show()
    plt.close()
    
    plt.plot(dates_cash_conversion_ratio, y_cash_conversion_ratio, label="FCF/NI")
    plt.title(ticker)
    # plt.plot(dates_cfo[-nr_years:], deflated_accruals[-nr_years:], label="deflated accruals")
    leg = plt.legend(loc='best')
    plt.show()

def PlotEarningsQuality(ticker, normalizing_variable = 'revenue', nr_years = 6):
    #get net income
    income_statement = IncomeStatementAnnual.objects.filter(ticker_id = ticker).values_list( 'period_end_date', 'net_income' , normalizing_variable).order_by('period_end_date')
    cf_statement = CashFlowStatementAnnual.objects.filter(ticker_id = ticker).values_list('period_end_date', 'cf_cfo').order_by('period_end_date')
    
    #array that stores x values for linear regression (date time object cannot be used for linear regression)
    x_lin_regression = []

    #stores data of net income
    dates_ni=[]
    y_ni=[]

    #store data of cash flow from operations (cfo)
    dates_cfo=[]
    y_cfo = []

    #store data for deflated accruals which is defined as: deflated_accruals = (net income/revenue - cfo/revenue)
    deflated_accruals = []

    for idx, row in enumerate(income_statement):
        x_lin_regression.append(idx)

        dates_ni.append(row[0])
        y_ni.append(row[1]/row[2])

        dates_cfo.append(cf_statement[idx][0])
        y_cfo.append(cf_statement[idx][1]/row[2])

        deflated_accruals.append(row[1]/row[2] - cf_statement[idx][1]/row[2])
        # y1.append(cf_statement[idx][1])

    if len(y_cfo) < nr_years:
        nr_years = len(y_cfo)

    x_lin_regression = x_lin_regression[-nr_years:]
    y_ni_lr = y_ni[-nr_years:]
    y_cfo_lr = y_cfo[-nr_years:]

    X = np.array(x_lin_regression).reshape(-1,1)
    
    lin_reg_ni = LinearRegression().fit(X, y_ni_lr)
    lin_reg_cfo = LinearRegression().fit(X, y_cfo_lr)

    # print('regression coefficients ni: ', lin_reg_ni.coef_)
    # print('regression coefficients cfo: ', lin_reg_cfo.coef_)

    # based on the linear regression cofficient (which is slope) we can provide additional information
    if lin_reg_ni.coef_ < 0 and lin_reg_cfo.coef_ < 0:
        state = "Earnings decreasing"
    elif lin_reg_ni.coef_ > 0 and lin_reg_cfo.coef_ > 0:
        if  lin_reg_ni.coef_ > lin_reg_cfo.coef_:
            state = "Earnings increasing, Net income grows faster than CFO (possible red flag)"
        else:
            state = "Earnings increasing, CFO grows faster than Net income"
    elif lin_reg_ni.coef_ > 0 and lin_reg_cfo.coef_ < 0:
        state ="RED FLAG: Net income is increaseing, CFO decreasing"
    elif lin_reg_ni.coef_ < 0 and lin_reg_cfo.coef_ > 0:
        state = "Interesting: CFO is increasing, Net income decreasing"

    y_pred_ni = lin_reg_ni.predict(X)

    plt.plot(dates_ni[-nr_years:], y_ni[-nr_years:], label="NI/Revenue")
    plt.plot(dates_cfo[-nr_years:], y_cfo[-nr_years:], label="CFO/Revenue")
    # plt.plot(dates_cfo[-nr_years:], y_pred_ni[-nr_years:], label="linear regression")
    plt.title(ticker)
    # plt.plot(dates_cfo[-nr_years:], deflated_accruals[-nr_years:], label="deflated accruals")
    leg = plt.legend(loc='best')

    print(f'average {nr_years} years deflated accruals {ticker}: ' ,sum(deflated_accruals)/len(deflated_accruals))
    print(f'deflated accruals {ticker} current year: ' , deflated_accruals[-1])
    print(f'earnings state: ' , state)

    plt.show()

    # print('this is net income: ',net_income)


PlotEarningsQuality(TICKER)
PlotCashConversionRatio(TICKER)
PlotUnusualExpenseItems(TICKER,nr_years=10)
PlotNetOperatingAssetsIntensity(TICKER, nr_years=10)
print(RequiredLiquidFundsForIndustry(TICKER))

