from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from quickfs_dj.models import BalanceSheetAnnual, BalanceSheetQuarter, IncomeStatementAnnual, IncomeStatementQuarter, TradedCompanies, CashFlowStatementAnnual, KeyRatiosAnnual, TradedCompanies, KeyRatiosQuarter, LatestIncomeStatementAnnual, LatestBalanceSheetQuarter, LatestKeyRatiosAnnual, LatestKeyRatiosQuarter, LatestCashFlowStatementAnnual, Valuation, ScreenerData
from screener.models import CustomMetrics, FilterViews
from .serializers import StockScreenerFiltersSerializer, CustomMetricsSerializer, FilterViewsSerializer,CharFieldFilterOptions
from django.core.cache import cache
from django.db import connection
import yfinance as yf
from quickfs import QuickFS
from .helpers import transform_expression
import uuid
import os
#import yahoo_fin.stock_info as si
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re
from io import BytesIO
from scipy.optimize import fsolve,brentq,bisect
import pandas as pd
from rest_framework import status
# from module_name import some_fn
# from scipy.optimize import brentq
# from .module_name import extract_revenue, process_list, generate_data
#from .epv import compute_epv_cpp
# from .helpers import add
from django.db.models import Q




CACHE_TTL = 86400 #24 hours = 86400 seconds

#FINAL QUERY
# SELECT i.period_end_date, b.period_end_date, kr_y.period_end_date, i.ticker_id, b.ticker_id, i.revenue, b.cash_and_equiv
# FROM quickfs_incomestatementannual AS i
# INNER JOIN quickfs_balancesheetquarter AS b
# on i.ticker_id = b.ticker_id
# INNER JOIN quickfs_keyratiosannual AS kr_y
# on i.ticker_id = kr_y.ticker_id
# --where i.period_end_date >= to_date('01.01.2022', 'dd.mm.yyyy')
# --and b.period_end_date >= to_date('01.06.2023', 'dd.mm.yyyy')
# where i.revenue < 100000s
# and b.cash_and_equiv < 100000
# and kr_y.gross_margin > 0.2
# and (i.ticker_id, i.period_end_date) in (select ticker_id, max(period_end_date) from quickfs_incomestatementannual group by ticker_id)
# and (b.ticker_id, b.period_end_date) in (select ticker_id, max(period_end_date) from quickfs_balancesheetquarter group by ticker_id)
# and (kr_y.ticker_id, kr_y.period_end_date) in (select ticker_id, max(period_end_date) from quickfs_keyratiosannual group by ticker_id);







# algorithm we try to implement
# 1) for balance sheet quantities we will take most up-to-date quarterly numbers
# 2) for income statement (in a first implementation) we will take most up-to-date annual numbers
# 3) for cash flow statements we will take most up-to-date annual numbers
# 4) for key ratios (in a first implementation) we will take most up-to-date annual nummbers


# Implementation steps
# 1) implement endpoints that exposes all available fields for the different tables. response will have format: {incomeStatement: ["field1", "field2", "field3", "field4", "field5", etc.], balanceSheet: ["fieldb1", "fieldb2", etc.]}
# 2) it probably makes sense to define some mapping, but let's see


# select bs.period_end_date,bs.ticker_id, bs.cash_and_equiv, h.revenue from public.quickfs_balancesheetannual as bs inner join
# (select ticker_id, MAX(period_end_date) as MaxDateTime from public.quickfs_balancesheetannual group by ticker_id) bs_second
# on bs.ticker_id = bs_second.ticker_id
# and bs.period_end_date = bs_second.MaxDateTime
# --and bs.cash_and_equiv > 800000000000
# and bs.cash_and_equiv > 99000000000
# inner join
# --selection 
# (select ics.ticker_id, ics.revenue from public.quickfs_incomestatementannual as ics inner join
# (select ticker_id, MAX(period_end_date) as MaxDateTime from public.quickfs_incomestatementannual group by ticker_id) ics_second
#  on ics.ticker_id = ics_second.ticker_id
# and ics.period_end_date = ics_second.MaxDateTime
#  and ics.revenue > 10000000
# ) h
# on bs.ticker_id = h.ticker_id;

# Create your views here.


def cache_value(key, value = ''):
    """
    Function that caches the given value; if the value is already present it will just return the value
    """
    if cache.get(key) is None:
        cache.set(key, value)
        return value
    else:
        return cache.get(key)

# def create_joining_table_filter_query(table_name,base_table_alias, table_alias, filter_qtys):
#     """
#     This function will create the part of the query from line 10 to 16 or line 19 to 25
#     """
#     #create comma separated list of filter qtys in order to select them in sql query
#     selected_columns = ""

#     #store columns that will be filtered; these will later be used in line 1 of the complete query
#     filtered_columns = []


#     #create a filter string that contains all the AND conditions
#     filter_string = ""
#     for filter in filter_qtys:
#         #create selected columns string
#         selected_columns = selected_columns + f", table_alias.{filter['measure']}"

#         #append to filtered columns
#         filtered_columns.append(f"{table_alias}.{filter['measure']}")

#         #create filter condition
#         filter_condition = f"and table_alias.{filter['measure']} {filter['comparison']} {filter['qty']}"

#         #add filter condition to complete filter string
#         filter_string = filter_string + " " + filter_condition


#     #create final query
#     query = f"""
#             (select table_alias.ticker_id {selected_columns} from {table_name} as table_alias inner join
#             (select ticker_id, MAX(period_end_date) as MaxDateTime from {table_name} group by ticker_id) table_alias_second
#             on table_alias.ticker_id = table_alias.ticker_id
#             and table_alias.period_end_date = table_alias_second.MaxDateTime
#             {filter_string}
#             ) {table_alias}
#             on {base_table_alias}.ticker_id = {table_alias}.ticker_id
#             """
    
#     return query, filtered_columns

def create_first_line_of_query(base_table_alias, columns, count_rows=False):
    """
    this will create the first line of the query
    """
    #if counts rows is true we simply return select count(*)
    if count_rows:
        return "select count(*)"


    #we need to extract the primary key of the base table otherwise Django will throw an error
    if base_table_alias != 'comp':
        columns_list = f"select {base_table_alias}.id, {base_table_alias}.qfs_symbol_id, {base_table_alias}.period_end_date "
    else:
        columns_list = f"select {base_table_alias}.id, {base_table_alias}.ticker, {base_table_alias}.qfs_symbol as qfs_symbol_id "


    for column in columns:
        columns_list = columns_list + f",{column}"

    return columns_list

def create_filtered_columns(table_alias, filter_qtys):
    #store columns that will be filtered; these will later be used in line 1 of the complete query
    filtered_columns = []
    
    # #create filter conditions that will look like: and {table_alias}.some_filter_qty > 10000
    for filter in filter_qtys:
        #create filter condition of the format: and {table_alias}.some_filter_qty > 10000
        # filter_condition = f"and {table_alias}.{filter['measure']} {filter['comparison']} {filter['qty']}"

        #check if alias is defined for that measure
        if 'measure_alias' in filter:

            # check if table_alias is empty string (this is the case for derived quantities)
            if table_alias == "":
                #append to filtered columns
                # filtered_columns.append(f"{filter['measure']} as {filter['measure_alias']}")
                # filtered_columns.append(f"{filter['techName']} as {filter['measure_alias']}")
                filtered_columns.append(f"{filter['techName']} as \"{filter['measure_alias']}\"")

            else:
                #append to filtered columns
                # filtered_columns.append(f"{table_alias}.{filter['measure']} as {filter['measure_alias']}")
                # filtered_columns.append(f"{table_alias}.{filter['techName']} as {filter['measure_alias']}")
                filtered_columns.append(f"{table_alias}.{filter['techName']} as \"{filter['measure_alias']}\"")

        else:
              # check if table_alias is empty string (this is the case for derived quantities)
            if table_alias == "":
                # filtered_columns.append(f"{filter['measure']}")
                filtered_columns.append(f"{filter['techName']}")
            else:
                # filtered_columns.append(f"{table_alias}.{filter['measure']}")
                filtered_columns.append(f"{table_alias}.{filter['techName']}")




        #append to filtered columns
        # filtered_columns.append(f"{table_alias}.{filter['measure']}")

    return filtered_columns

def create_first_table_filter_query(table_name, table_alias):
    """
    This function will create the part of the query from line 2 to line 7 (see the following document for more details: https://docs.google.com/document/d/1kmnlVZLkyIG-QOl1kHjnjErNGSMKYis6_lwU0QrUNvQ/edit)
    """
    query = f"\n from {table_name} as {table_alias}"

    return query

    # return query, filtered_columns

def create_join_sql_statement(table_name, base_table_alias, table_alias):
    #check if table is quickfs_tradedcompanies; if it is quickfs then we need to join on ticker instead of ticker_id column
    # if table_alias != 'comp' and base_table_alias != 'comp':
    #     query = f"""\n inner join {table_name} as {table_alias}
    #         on {base_table_alias}.ticker_id = {table_alias}.ticker_id"""
    # elif base_table_alias == 'comp':
    #     query = f"""\n inner join {table_name} as {table_alias}
    #         on {base_table_alias}.ticker = {table_alias}.ticker_id"""
    # else:
    #     query = f"""\n inner join {table_name} as {table_alias}
    #         on {base_table_alias}.ticker_id = {table_alias}.ticker"""
        
    if table_alias != 'comp' and base_table_alias != 'comp':
        query = f"""\n inner join {table_name} as {table_alias}
            on {base_table_alias}.qfs_symbol_id = {table_alias}.qfs_symbol_id"""
    elif base_table_alias == 'comp':
        query = f"""\n inner join {table_name} as {table_alias}
            on {base_table_alias}.qfs_symbol = {table_alias}.qfs_symbol_id"""
    else:
        query = f"""\n inner join {table_name} as {table_alias}
            on {base_table_alias}.qfs_symbol_id = {table_alias}.qfs_symbol"""
    
    return query

    # return query, filtered_columns

def create_max_date_sql_statement(table_name, table_alias, min_date = '01.01.2022'):
    """
    
    para min_date:
        - type: string
        - descn: minimum date in order to filter companies that no longer exist; expected format is dd.mm.yyyy
    """
    #return f" and ({table_alias}.ticker_id, {table_alias}.period_end_date) in (select ticker_id, max(period_end_date) from {table_name} where period_end_date >= to_date('{min_date}', 'dd.mm.yyyy')  group by ticker_id)"
    return f" and ({table_alias}.qfs_symbol_id, {table_alias}.period_end_date) in (select qfs_symbol_id, max(period_end_date) from {table_name} where period_end_date >= to_date('{min_date}', 'dd.mm.yyyy')  group by qfs_symbol_id)"

def create_sql_filter_conditions(table_alias, filters, idx):
    final_filter_string = ""

    for inner_idx, filter in enumerate(filters):
        #in case it is is the first statement we will leave away the end
        if inner_idx == 0 and idx == 0:
            #check if table alias is empty
            if table_alias == "":
                final_filter_string += f" {filter['techName']} {filter['comparison']} {filter['qty']}"
            else:
                final_filter_string += f" {table_alias}.{filter['techName']} {filter['comparison']} {filter['qty']}"
        else:
            if table_alias == "":
                final_filter_string += f" and {filter['techName']} {filter['comparison']} {filter['qty']}"
            else:
                final_filter_string += f" and {table_alias}.{filter['techName']} {filter['comparison']} {filter['qty']}"

    return final_filter_string

# def get_table_name(type):
#     if type == 'kr_y':
#         return "quickfs_keyratiosannual"
#     elif type == 'kr_q':
#         return "quickfs_keyratiosquarter"
#     elif type == "income":
#         return "quickfs_incomestatementannual"
#     elif type == "balance":
#         return "quickfs_balancesheetquarter"
#     elif type == "cf":
#         return "quickfs_cashflowstatementannual"
#     elif type == "comp":
#         return "quickfs_tradedcompanies"


def get_django_model(type):
    # if type == 'kr_y':
    #     return KeyRatiosAnnual
    # elif type == 'kr_q':
    #     return KeyRatiosQuarter
    # elif type == "income":
    #     return IncomeStatementAnnual
    # elif type == "balance":
    #     return BalanceSheetQuarter
    # elif type == "cf":
    #     return CashFlowStatementAnnual
    # elif type == "comp":
    #     return TradedCompanies

    if type == 'kr_y':
        return LatestKeyRatiosAnnual
    elif type == 'kr_q':
        return LatestKeyRatiosQuarter
    elif type == "income":
        return LatestIncomeStatementAnnual
    elif type == "balance":
        return LatestBalanceSheetQuarter
    elif type == "cf":
        return LatestCashFlowStatementAnnual
    elif type == "comp":
        return TradedCompanies


def get_table_name_optimized(type):
    if type == 'kr_y':
        return "quickfs_dj_latestkeyratiosannual"
    elif type == 'kr_q':
        return "quickfs_dj_latestkeyratiosquarter"
    elif type == "income":
        return "quickfs_dj_latestincomestatementannual"
    elif type == "balance":
        return "quickfs_dj_latestbalancesheetquarter"
    elif type == "cf":
        return "quickfs_dj_latestcashflowstatementannual"
    elif type == "comp":
        return "quickfs_dj_tradedcompanies"

def get_table_name(type):
    if type == 'kr_y':
        return "quickfs_dj_keyratiosannual"
    elif type == 'kr_q':
        return "quickfs_dj_keyratiosquarter"
    elif type == "income":
        return "quickfs_dj_incomestatementannual"
    elif type == "balance":
        return "quickfs_dj_balancesheetquarter"
    elif type == "cf":
        return "quickfs_dj_cashflowstatementannual"
    elif type == "comp":
        return "quickfs_dj_tradedcompanies"
    

# def does_join_condition_exist(table_alias):
#     if table_alias == 'kr_q':
#         return len(key_ratios_q_filters) > 0
    
#this function is taken from the official django documentation: https://docs.djangoproject.com/en/3.2/topics/db/sql/#performing-raw-sql-queries
def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def create_filter_stocks_query_optimized(request, count_rows = False):
    #define base table alias
    base_table_alias = ""

    #define variable for filter statemetns
    filter_statements = ""

    #define variable to store inner join statements
    inner_joins = ""

    #define variable for max date statements
    max_date_statements = ""

    #store all columns that should get extracted in a list
    extracted_columns = []

    #prepare three lists to divide the different filter options
    income_statement_filters = []
    balance_sheet_filters = []
    cashflow_statement_filters = []
    key_ratios_q_filters = []
    key_ratios_y_filters = []
    traded_companies_filters = []
    derived_filters = [] #this includes filters of derived quantities like EV/EBIT. Note quantities like current_assets/current_liabilities are not considered derived as both measures

    def does_sql_already_exist(table_alias):
        """
        Function that checks whether a certain part of the query (for example inner join statement) is already present in the query or not. We define this as an inner function in order to have access to the different arrays key_ratios_q_filters, income_statement_filters, etc.
        """
        does_join_already_exist = False
        if table_alias == 'kr_q':
            does_join_already_exist =  len(key_ratios_q_filters) > 0
        elif table_alias == 'kr_y':
            does_join_already_exist =  len(key_ratios_y_filters) > 0
        elif table_alias == 'income':
            does_join_already_exist =  len(income_statement_filters) > 0
        elif table_alias == 'balance':
            does_join_already_exist =  len(balance_sheet_filters) > 0
        elif table_alias == 'cf':
            does_join_already_exist =  len(cashflow_statement_filters) > 0
        elif table_alias == 'comp':
            does_join_already_exist =  len(traded_companies_filters) > 0
        
        return does_join_already_exist

    #list that stores all filters
    allFilters = []

    for filter in request.data:
        if filter['table'] == 'kr_q': #kr_q stands for keyratios quarterly
            key_ratios_q_filters.append(filter)
        elif filter['table'] == 'kr_y': #kr_y stands for keyratios yearly
            key_ratios_y_filters.append(filter)
        elif filter['table'] == 'income': 
            income_statement_filters.append(filter)
        elif filter['table'] == 'balance':
            balance_sheet_filters.append(filter)
        elif filter['table'] == 'cf':
            cashflow_statement_filters.append(filter)
        elif filter['table'] == 'comp':
            traded_companies_filters.append(filter)
        elif type(filter['table']) == list:
            derived_filters.append(filter)

    #check for which tables filter exists
    if len(income_statement_filters) > 0:
        allFilters.append(income_statement_filters)

    if len(balance_sheet_filters) > 0:
        allFilters.append(balance_sheet_filters)

    if len(key_ratios_q_filters) > 0:
        allFilters.append(key_ratios_q_filters)

    if len(key_ratios_y_filters) > 0:
        allFilters.append(key_ratios_y_filters)

    if len(cashflow_statement_filters) > 0:
        allFilters.append(cashflow_statement_filters)

    if len(traded_companies_filters) > 0:
        allFilters.append(traded_companies_filters)

    if len(derived_filters) > 0:
        allFilters.append(derived_filters)

    for idx, filter in enumerate(allFilters):
        #extract type of filter statement (if filter statement for income statement, balance sheet, cashflow statement, keyratios or dervied quantity)
        measure_type = filter[0]['table']

        print(f'filter: {filter}, measure_type: {measure_type}')
        #check if type of filter condition is a list (if that is the case we are dealing with a derived quantitv, for example EV/EBIT)
        if type(measure_type) == list:
            # pass
            """
            what does change if we have a derived quantity like EV/EBIT?:
                - the 'type' property will be a list of the tables that are involed, like ['kr_q', 'income']
                - in case we have a derived quantity we need to make sure that join command and max_date sql statement for that table will be present (probably best to write a function if other types are present)
                - we also need to handle case where idx == 0
            """
            print('filter: inside list type ', filter)
            print('base_table_alias ', base_table_alias)

            for inner_idx, qty_type in enumerate(measure_type):
                #get the table name
                table_name = get_table_name_optimized(qty_type)

                #in case idx and inner_idx are zero we need to create line 2 part of query
                if idx == 0 and inner_idx == 0:
                    base_table_alias = qty_type

                    #create first part of sql query (line 2)
                    query_first_part = create_first_table_filter_query(table_name=table_name, table_alias=qty_type)

                    # check if other measure exists that uses the same table; in that case we do not need to add any join condition as this will be added later               
                    does_join_already_exist = does_sql_already_exist(qty_type)

                    if does_join_already_exist == False:
                        if measure_type != 'comp':
                            print(f'we create max_date query for {qty_type}')
                            #create max_date query for that table
                            max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=qty_type)

                            #add max date query to final max date statement
                            max_date_statements += max_date_query
                else:

                    # check if other measure exists that uses the same table; in that case we do not need to add any join condition as this will be added later                      
                    does_join_already_exist = does_sql_already_exist(qty_type)

                    print(f'we create join sql. table_name: {table_name}, base_table_alias: {base_table_alias}, table_alias: {qty_type}')
                    if does_join_already_exist == False:
                        query = create_join_sql_statement(table_name=table_name, base_table_alias=base_table_alias, table_alias=qty_type)

                        if measure_type != 'comp':
                            #create max_date query for that table
                            max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=qty_type)
                                
                            #add max date query to final max date statement
                            max_date_statements += max_date_query


                        #add inner join query to final inner join statement
                        inner_joins += query

            filtered_columns = create_filtered_columns(table_alias="", filter_qtys=filter)

            filter_condition = create_sql_filter_conditions(table_alias="", filters=filter, idx=idx)
        else:
        #get the table name
            table_name = get_table_name_optimized(measure_type)

            #in first iteration we will create line 2 of query (from some_table); otherwise we will create the join condition
            if idx == 0:
                base_table_alias = measure_type

                #create first part of sql query (line 2)
                query_first_part = create_first_table_filter_query(table_name=table_name, table_alias=measure_type)
                filtered_columns = create_filtered_columns(measure_type, filter)

            else:
                    # this will create join condition (line 3 & 4); inner join table_name as table_alias on base_table_alias.ticker_id = table_alias.ticker_id
                query = create_join_sql_statement(table_name=table_name, base_table_alias=base_table_alias, table_alias=measure_type)
                filtered_columns = create_filtered_columns(measure_type, filter)


                #add inner join query to final inner join statement
                inner_joins += query

            #create filter conditions for this table; these are of the form: table_alias.measure < 1000
            filter_condition = create_sql_filter_conditions(table_alias=measure_type, filters=filter, idx=idx)

            print('this is measure_type: ', measure_type)

            #quickfs_tradedcompanies does not have period end date, therefore we will skip function for that table
            if measure_type != 'comp':
                #create max_date query for that table
                max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=measure_type)
            
                #add max date query to final max date statement
                max_date_statements += max_date_query

        #add to final filter conditions
        filter_statements += filter_condition

        #add filtered columns to list of columns that will be extracted
        extracted_columns = extracted_columns + filtered_columns

    #create first line of query; as this endpoint is used for counting the number of stocks that are filtered, count_rows should always be set to True
    first_line = create_first_line_of_query(base_table_alias=base_table_alias, columns=extracted_columns, count_rows=count_rows)

    #construct the final query
    # final_query = f"{first_line} {query_first_part} {inner_joins} where {filter_statements} {max_date_statements};"
    final_query = f"{first_line} {query_first_part} {inner_joins} where {filter_statements};"

    return final_query


def create_filter_stocks_query(request, count_rows = False):
    #define base table alias
    base_table_alias = ""

    #define variable for filter statemetns
    filter_statements = ""

    #define variable to store inner join statements
    inner_joins = ""

    #define variable for max date statements
    max_date_statements = ""

    #store all columns that should get extracted in a list
    extracted_columns = []

    #prepare three lists to divide the different filter options
    income_statement_filters = []
    balance_sheet_filters = []
    cashflow_statement_filters = []
    key_ratios_q_filters = []
    key_ratios_y_filters = []
    traded_companies_filters = []
    derived_filters = [] #this includes filters of derived quantities like EV/EBIT. Note quantities like current_assets/current_liabilities are not considered derived as both measures

    def does_sql_already_exist(table_alias):
        """
        Function that checks whether a certain part of the query (for example inner join statement) is already present in the query or not. We define this as an inner function in order to have access to the different arrays key_ratios_q_filters, income_statement_filters, etc.
        """
        does_join_already_exist = False
        if table_alias == 'kr_q':
            does_join_already_exist =  len(key_ratios_q_filters) > 0
        elif table_alias == 'kr_y':
            does_join_already_exist =  len(key_ratios_y_filters) > 0
        elif table_alias == 'income':
            does_join_already_exist =  len(income_statement_filters) > 0
        elif table_alias == 'balance':
            does_join_already_exist =  len(balance_sheet_filters) > 0
        elif table_alias == 'cf':
            does_join_already_exist =  len(cashflow_statement_filters) > 0
        elif table_alias == 'comp':
            does_join_already_exist =  len(traded_companies_filters) > 0
        
        return does_join_already_exist

    #list that stores all filters
    allFilters = []

    for filter in request.data:
        if filter['table'] == 'kr_q': #kr_q stands for keyratios quarterly
            key_ratios_q_filters.append(filter)
        elif filter['table'] == 'kr_y': #kr_y stands for keyratios yearly
            key_ratios_y_filters.append(filter)
        elif filter['table'] == 'income': 
            income_statement_filters.append(filter)
        elif filter['table'] == 'balance':
            balance_sheet_filters.append(filter)
        elif filter['table'] == 'cf':
            cashflow_statement_filters.append(filter)
        elif filter['table'] == 'comp':
            traded_companies_filters.append(filter)
        elif type(filter['table']) == list:
            derived_filters.append(filter)

    #check for which tables filter exists
    if len(income_statement_filters) > 0:
        allFilters.append(income_statement_filters)

    if len(balance_sheet_filters) > 0:
        allFilters.append(balance_sheet_filters)

    if len(key_ratios_q_filters) > 0:
        allFilters.append(key_ratios_q_filters)

    if len(key_ratios_y_filters) > 0:
        allFilters.append(key_ratios_y_filters)

    if len(cashflow_statement_filters) > 0:
        allFilters.append(cashflow_statement_filters)

    if len(traded_companies_filters) > 0:
        allFilters.append(traded_companies_filters)

    if len(derived_filters) > 0:
        allFilters.append(derived_filters)

    for idx, filter in enumerate(allFilters):
        #extract type of filter statement (if filter statement for income statement, balance sheet, cashflow statement, keyratios or dervied quantity)
        measure_type = filter[0]['table']

        #check if type of filter condition is a list (if that is the case we are dealing with a derived quantitv, for example EV/EBIT)
        if type(measure_type) == list:
            # pass
            """
            what does change if we have a derived quantity like EV/EBIT?:
                - the 'type' property will be a list of the tables that are involed, like ['kr_q', 'income']
                - in case we have a derived quantity we need to make sure that join command and max_date sql statement for that table will be present (probably best to write a function if other types are present)
                - we also need to handle case where idx == 0
            """
            for inner_idx, qty_type in enumerate(measure_type):
                #get the table name
                table_name = get_table_name(qty_type)

                #in case idx and inner_idx are zero we need to create line 2 part of query
                if idx == 0 and inner_idx == 0:
                    base_table_alias = qty_type

                    #create first part of sql query (line 2)
                    query_first_part = create_first_table_filter_query(table_name=table_name, table_alias=qty_type)

                    # check if other measure exists that uses the same table; in that case we do not need to add any join condition as this will be added later               
                    does_join_already_exist = does_sql_already_exist(qty_type)

                    if does_join_already_exist == False:
                        if measure_type != 'comp':
                            print(f'we create max_date query for {qty_type}')
                            #create max_date query for that table
                            max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=qty_type)

                            #add max date query to final max date statement
                            max_date_statements += max_date_query
                else:
                    # check if other measure exists that uses the same table; in that case we do not need to add any join condition as this will be added later                      
                    does_join_already_exist = does_sql_already_exist(qty_type)

                    if does_join_already_exist == False:
                        query = create_join_sql_statement(table_name=table_name, base_table_alias=base_table_alias, table_alias=qty_type)

                        if measure_type != 'comp':
                            #create max_date query for that table
                            max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=qty_type)
                                
                            #add max date query to final max date statement
                            max_date_statements += max_date_query


                        #add inner join query to final inner join statement
                        inner_joins += query

            filtered_columns = create_filtered_columns(table_alias="", filter_qtys=filter)

            filter_condition = create_sql_filter_conditions(table_alias="", filters=filter, idx=idx)
        else:
        #get the table name
            table_name = get_table_name(measure_type)

            #in first iteration we will create line 2 of query (from some_table); otherwise we will create the join condition
            if idx == 0:
                base_table_alias = measure_type

                #create first part of sql query (line 2)
                query_first_part = create_first_table_filter_query(table_name=table_name, table_alias=measure_type)
                filtered_columns = create_filtered_columns(measure_type, filter)

            else:
                    # this will create join condition (line 3 & 4); inner join table_name as table_alias on base_table_alias.ticker_id = table_alias.ticker_id
                query = create_join_sql_statement(table_name=table_name, base_table_alias=base_table_alias, table_alias=measure_type)
                filtered_columns = create_filtered_columns(measure_type, filter)


                #add inner join query to final inner join statement
                inner_joins += query

            #create filter conditions for this table; these are of the form: table_alias.measure < 1000
            filter_condition = create_sql_filter_conditions(table_alias=measure_type, filters=filter, idx=idx)

            #quickfs_tradedcompanies does not have period end date, therefore we will skip function for that table
            if measure_type != 'comp':
                #create max_date query for that table
                max_date_query = create_max_date_sql_statement(table_name=table_name,table_alias=measure_type)

            
            #add max date query to final max date statement
            max_date_statements += max_date_query

        #add to final filter conditions
        filter_statements += filter_condition

        #add filtered columns to list of columns that will be extracted
        extracted_columns = extracted_columns + filtered_columns

    #create first line of query; as this endpoint is used for counting the number of stocks that are filtered, count_rows should always be set to True
    first_line = create_first_line_of_query(base_table_alias=base_table_alias, columns=extracted_columns, count_rows=count_rows)

    #construct the final query
    final_query = f"{first_line} {query_first_part} {inner_joins} where {filter_statements} {max_date_statements};"

    return final_query

class StocksFilterNumberOfStocksAPIView(APIView):
    """
    API endpoint that returns the current number of stocks which fulfil the current search criteria.
    The request is expecte in the following format:
    [
    {"techName" : "market_cap", "comparison" : ">", "qty" : 100000000, "table" : "kr_q"},
    {"techName" : "market_cap", "comparison" : ">", "qty" : 0, "table" : "kr_q"},
    {"techName" : "operating_income", "comparison" : ">", "qty" : 0, "table" : "income"},
    {"techName" : "enterprise_value", "comparison" : "<", "qty" : 0, "table" : "kr_q"},
    {"techName" : "industry", "comparison" : "not in", "qty" : "('Biotechnology', 'Asset Management','Insurance')", "table" : "comp"}
    ]

    property 'techName': corresponds to column name in corresponding table
    property 'comparison': defines operator that will be used for filtering (>, <, not in, =, etc.)
    property 'qty': numerical or string value that will be used for filtering (depends on the value type of the column, that is defined in measure)
    property 'type': defines the table in the which the column is defined. The following shortcuts are used for the different tables:
        - kr_q corresponds to keyratios quartely
        - kr_y corresponds to keyratios yearly
        - income corresponds to the income statement
        - balance corresponds to the quarterly/must up-to-date balance sheet data
        - cf corresponds to cash flow statement
        - comp corresponds to the traded companies table (this will mainly be used to filter out certain industries)
    """
    def post(self, request):
        final_query = create_filter_stocks_query(request, count_rows=True)

        with connection.cursor() as cursor:
            cursor.execute(final_query)
            # get a single line from the result
            row = cursor.fetchone()
            # get the value in the first column of the result (the only column)
            count_value = row[0]

        return Response({'nrOfStock' : count_value})


class StocksFilterQueryOptimizedAPIView(APIView):
    def initialize_request(self, request, *args, **kwargs):
        request = super().initialize_request(request, *args, **kwargs)
        # Modify the request data
        if request.method == 'POST':
            #check if data is an array
            if isinstance(request.data, list):
                #iterate through item and check if it is a custom metric
                for filter in request.data:
                    print('this is filter: ', filter)
                    #check if isCustomMetric is a key in the dictionary
                    if 'isCustomMetric' in filter:
                        if filter['isCustomMetric']:
                            # print('this is table property: ', filter['table'])
                            # if isinstance(filter['table'],list):
                            #     tables = filter['table']
                            # else:
                            #     tables=[]

                            #we need to transform the metric, to replace denominators with NULLIF(denominator, 0) to avoid zero division
                            newTechName = transform_expression(filter['techName'])
                            filter['techName'] = newTechName
                            filter['measure_alias'] = filter['readableName']

                            print('this is newTechName ', newTechName)

            # request.data._mutable = True  # Make data mutable
            # request.data['new_key'] = 'new_value'  # Add or modify data
            # request.data._mutable = False  # Make it immutable again (optional)
        return request


    def post(self, request):
        """
        Handles GET request to retrieve Gross Profit Margin = Gross Profit/Revenue
        Gross profit margin = Gross Proft/Total Revenue (page 33)
            - A durable competitive advantage can give freedom to price products freely
        and therefore leading to high gross profit margin.
            - Companies with durable competitive advantage have Gross Profit Margin > 40%
            - We are looking for consistency in high GPM, therefore consider last 10 years
            - It is important to note that a high GPM is not fail-safe as high operating expenses can eat up high GPM
        """
        #extract filters from request data
        filters = request.data

        #define table name
        table_name = "quickfs_dj_screenerdata"

        #default fields: these are fields that will be returned anyway like company name, industry, exchange, etc.
        default_fields = ["qfs_symbol_id", "name", "industry", "exchange"]

        #create a list for the selected fields and the where clause
        selected_fields = [] + default_fields
        where_conditions = []

        print('these are filters: ',filters)

        for item in filters:
            field = item['techName']
            readableName = item['readableName']

            #check that the readable name is valid (symbols like / - + are not valid)
            alias = re.sub(r'[^0-9a-zA-Z_]', '_', readableName)

            selected_fields.append(f"{field} as {alias}")
            comparison_operator = item['comparison'] #this is <, >, != etc.
            qty = item['qty']

            #add the where condition
            where_conditions.append(f"{field} {comparison_operator} {qty}")

        #combine all where clauses and create select fields
        where_clause = " AND ".join(where_conditions)
        select_clause = ", ".join(selected_fields)

        #create final query
        final_query = f"SELECT {select_clause} FROM {table_name} WHERE {where_clause}"

        print("final_query: ", final_query)

        with connection.cursor() as cursor:
            cursor.execute(final_query)
            #transform query result to dictionary
            query_result = dictfetchall(cursor)

        return Response({'queryResult' : query_result})


class StocksFilterQueryAPIView(APIView):
    def post(self, request):
        """
        Handles GET request to retrieve Gross Profit Margin = Gross Profit/Revenue
        Gross profit margin = Gross Proft/Total Revenue (page 33)
            - A durable competitive advantage can give freedom to price products freely
        and therefore leading to high gross profit margin.
            - Companies with durable competitive advantage have Gross Profit Margin > 40%
            - We are looking for consistency in high GPM, therefore consider last 10 years
            - It is important to note that a high GPM is not fail-safe as high operating expenses can eat up high GPM
        """
        final_query = create_filter_stocks_query(request, count_rows=False)

        print("final_query: ", final_query)

        with connection.cursor() as cursor:
            cursor.execute(final_query)
            #transform query result to dictionary
            query_result = dictfetchall(cursor)

        return Response({'queryResult' : query_result})


def get_ticker_price(ticker, qfs_symbol):
    current_price = 0
    price_currency = 'N/A'
    #extract implied shares from yahoo finance (Implied Shares Outstanding of common equity, assuming the conversion of all convertible subsidiary equity into common.)
    try:
        #create yahoo finance object
        company = yf.Ticker(ticker)

        #extract current price
        current_price = company.info["currentPrice"]

        #extract currency of yahoo finance price
        price_currency = company.info["currency"]
    except:
        #get traded company
        traded_company = TradedCompanies.objects.get(qfs_symbol=qfs_symbol)

        #if price data is not availabe on yahoo finance we will extract it from quickfs
        #intialize Client
        QUICKS_API_KEY = '0a78898493bf2325e59e01fb603023f9884d80c9' #os.environ["QUICKFS_API_KEY"]
        client = QuickFS(api_key=QUICKS_API_KEY)

        #get quickfs symbol (this is different from the ticker symbol. For example AAPL will be AAPL:US)
        quickfs_ticker = traded_company.qfs_symbol
        price_currency = traded_company.currency

        #extract price
        current_price = client.get_data_range(symbol = quickfs_ticker, metric="price")

    return current_price, price_currency


def get_nr_of_outstanding_shares(ticker, qfs_symbol):
    #get number of shares that are outstanding; we will get this from the most recent quarterly income statement
    income_statement_q = IncomeStatementQuarter.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[0]
    nr_shares_qfs = income_statement_q.shares_diluted
    nr_shares = nr_shares_qfs

    #extract number of shares
    company = yf.Ticker(ticker)

    print('this is company yahoo finance: ', company)

    try:
        #extract number of implied shares
        nr_shares_yf = company.info["impliedSharesOutstanding"]

        print("after nr of shares yf")

        #we take the larger of the two (example is TSAT: number of implied shares is much higher than number of outstanding shares. Why? There are 13m tradable shares outstanding. Due to the merger with Loral and legacy Telesat, the controlling shareholders received units which are effectively shares in Telesat but they are not tradable until they are converted. So to calculate the economic market cap, you'd use the 50m shares. )
        if nr_shares_yf > nr_shares:
            nr_shares = nr_shares_yf
    except Exception as e:
        print('exception e: ', e)

    return nr_shares

def compute_epv(qfs_symbol, op_margin_nr_years = 5, avg_revenue_nr_years = 3, avg_da_nr_years = 5, trends_years = 7):
    """
    para op_margin_nr_years:
        - type: integer
        - descn: number of years that are used to compute the average operating margin
    
    para avg_revenue_nr_years:
        - type: integer
        - descn: number of years that are used to compute the average revenue; if set to 1, revenue of the most recent year will be taken

    para avg_da_nr_years:
        - type: integer
        - descn: number of years that are taken to compute the average D&A expenses and capital expenditures. Capital Expenditures includes PP&E and acquisitions

    para trends_years:
        - type: integer
        - descn: number of years that are taken to display trend graphs for revenue, operating margin, operating expenses and gross profit margin


    Function that computes the Earnings Power Value (EPV) of a company based on the procedure described by Bruce Greenwald. This involves the following steps:
        1. Compute the average operating margin based on the data of the past 5 years (if 5 years is not available takes as much data as possible)
        2. Compute sustainable EBIT, by multiplying the average operating margin by the average Revenue of the past 3 years
        3. Make Adjustments: Add D&A subtract maintenance capex add or remove any costs related to growth or extraordinary items (in this implementation we assume that D&A is a good measure for maintenance capex, therefore we do not make any adjustments)
        4. operating margin*average_revenue *(1-tax_rate) = sustainable NOPAT (Net Operating Profit after taxes)
        5. EPV Operating business = NOPAT/WACC
        6. EPV equity = EPV Operating Business + Cash - Debt
        7. EPV Equity per share = EPV Equity/nr_shares_outstanding
    """
    operating_margins = []
    operating_margins_trend = []
    operating_profits_ttm = []
    operating_margins_ttm = []
    revenues = []
    revenues_trend = []
    revenues_ttm = []
    gross_margin_trend = []
    total_opex= []
    da = [] #stores Depreciation & Amortization Expenses
    capex = [] #stores capital expenditures = PP&E + Acquisitions
    da_over_capex = [] #stores ratio of D&A/capex; if it is close to 1 it means that D&A is a good measure for maintenance capex; the further it is away from 1 (either smaller or larger) the less reliable is D&A as an estimate for maintenance capex
    tax_rate = 0.3
    wacc = 0.11
    

    #retrieve revenue data of the past 5 years
    income_statements = IncomeStatementAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date') #minus sign makes sure that ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01, ...

    #retrieve also quarterly income statement to compute TTM
    income_statements_q = IncomeStatementQuarter.objects.filter(qfs_symbol_id=qfs_symbol).order_by('-period_end_date')[:4]
    
    for income_q in income_statements_q:
        revenues_ttm.append(income_q.revenue)

        try:
            if income_q.operating_income is not None:
                operating_profits_ttm.append(income_q.operating_income)
        except TypeError:
            operating_profits_ttm.append(0)

        try:
            operating_margins_ttm.append(income_q.operating_income/income_q.revenue)
        except ZeroDivisionError:
            operating_margins_ttm.append(0)
        except TypeError:
            #operating_profits_ttm.append(0)
            operating_margins_ttm.append(0)
    
    for idx, income_statement in enumerate(income_statements):
        print('revenue.period_end_date: ', income_statement.period_end_date)
        if idx < trends_years:
            revenues_trend.append({'x': income_statement.period_end_date, 'y': income_statement.revenue})
            if income_statement.total_opex is None:
                total_opex.append({'x': income_statement.period_end_date, 'y': 0})
            else:
                total_opex.append({'x': income_statement.period_end_date, 'y': income_statement.total_opex})

            #gross profit margin
            try:
                gross_margin_trend.append({'x': income_statement.period_end_date, 'y':  income_statement.gross_profit/income_statement.revenue})
            except ZeroDivisionError:
                gross_margin_trend.append({'x': income_statement.period_end_date, 'y':0})
            except:
                gross_margin_trend.append({'x': income_statement.period_end_date, 'y':0})


            #compute operating margin
            try:
                operating_margins_trend.append({'x': income_statement.period_end_date, 'y':income_statement.operating_income/income_statement.revenue})
            except ZeroDivisionError:
                operating_margins_trend.append({'x': income_statement.period_end_date, 'y':0})
            except:
                operating_margins_trend.append({'x': income_statement.period_end_date, 'y':0})


        #check if idx is smaller than nr of years that should be used to compute the averge revenue
        if idx < avg_revenue_nr_years:
            revenues.append(income_statement.revenue)

        # check if idx is smaller that nr of years that should be used for average operating margin
        if idx < op_margin_nr_years:
            try:
                operating_margins.append(income_statement.operating_income/income_statement.revenue)
            except ZeroDivisionError:
                operating_margins.append(0)
            except TypeError:
                operating_margins.append(0)


    #retrieve cash flow statement data to extract D&A expenses and capital expenditures
    cfs_annual = CashFlowStatementAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')

    for idx, cfs in enumerate(cfs_annual):
        if idx < avg_da_nr_years:
            #append D&A value
            da.append(cfs.cfo_da)

            #take absolute value if cfi_ppe_purchases is negative (if negative it is an expense); if cfi_ppe_purchases it means the sold PP&E, then we set it to zero
            ppe = abs(cfs.cfi_ppe_purchases) if cfs.cfi_ppe_purchases < 0 else 0
            acquisitions = abs(cfs.cfi_acquisitions) if cfs.cfi_acquisitions < 0 else 0

            #append capex value
            capex.append(ppe + acquisitions)

            #compute D&A/capex ratio
            try:
                da_over_capex.append(cfs.cfo_da/(ppe+acquisitions))
            except ZeroDivisionError:
                da_over_capex.append(1)

    #step 1: compute the average operating margin
    avg_operating_margin = sum(operating_margins)/len(operating_margins)


    try:
        avg_operating_margin_ttm = sum(operating_profits_ttm)/sum(revenues_ttm) #sum(operating_margins_ttm)/len(operating_margins_ttm)
    except ZeroDivisionError:
        avg_operating_margin_ttm = 0
    
    #step 2: compute average revenue and multiply by average operating margin to obtain sustainable EBIT
    avg_revenue = sum(revenues)/len(revenues)
    # avg_revenue_ttm = sum(revenues_ttm)/len(revenues_ttm)

    sustainable_ebit = avg_operating_margin*avg_revenue
    sustainable_ebit_ttm = avg_operating_margin_ttm*sum(revenues_ttm)

    #step 3
    #TODO: currently we do not make any adjustments; we assume that D&A costs are a good approximation of the maintenance capex; in that case adjusted income is the same as sustainable ebit
    adjusted_income = sustainable_ebit
    adjusted_income_ttm = sustainable_ebit_ttm

    #compute NOPAT (Net Operating Profit After Taxes)
    nopat = adjusted_income*(1-tax_rate)
    nopat_ttm = adjusted_income_ttm*(1-tax_rate)

    #compute EPV operating business = nopat/wacc
    epv_op_busi = nopat/wacc
    evp_op_busi_ttm = nopat_ttm/wacc

    #compute EPV of Equity by adding cash and subtracting debt; we will take cash and debt values from the most recent quarterly balance sheet
    balance_sheet = BalanceSheetQuarter.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[0]
    cash = balance_sheet.cash_and_equiv
    debt = balance_sheet.st_debt + balance_sheet.lt_debt

    #compute epv of equity
    epv_equity = epv_op_busi + cash - debt
    epv_equity_ttm = evp_op_busi_ttm + cash - debt

    #extract currency of company
    traded_company = TradedCompanies.objects.get(qfs_symbol=qfs_symbol)
    company_name = traded_company.name
    currency = traded_company.currency

    #get number of shares that are outstanding; we will get this from the most recent quarterly income statement
    nr_shares = get_nr_of_outstanding_shares(traded_company.ticker, qfs_symbol)

    #extract current share price for ticker symbol
    current_price, price_currency = get_ticker_price(traded_company.ticker, qfs_symbol)

    #compute epv equity per share
    try:
        epv_equity_per_share = epv_equity/nr_shares
        epv_equity_per_share_ttm = epv_equity_ttm/nr_shares
    except ZeroDivisionError:
        print('nr_shares is zero')
        epv_equity_per_share = None
        epv_equity_per_share_ttm = None

    #create response dictionary
    response = {'qfs_symbol' : qfs_symbol, 'name' : company_name, 'epv_per_share' : epv_equity_per_share, 'epv_per_share_ttm' :  epv_equity_per_share_ttm, 'epv_currency' : currency, 'current_price' : current_price, 'price_currency' : price_currency, 'avg_op_margin' : avg_operating_margin, 'avg_op_margin_ttm' : avg_operating_margin_ttm,  'avg_revenue' : avg_revenue, 'revenue_ttm' : sum(revenues_ttm), 'op_margins' : operating_margins, 'revenues' : revenues, 'da_over_capex' : da_over_capex, 'da' : da, 'capex' : capex, 'revenue_trend' : list(reversed(revenues_trend)) , 'gross_margin_trend' : list(reversed(gross_margin_trend)) , 'operating_margin_trend' : list(reversed(operating_margins_trend)) , 'total_opex_trend' : list(reversed(total_opex)), 'wacc' : wacc, 'tax_rate' : tax_rate, 'nr_of_shares' : nr_shares, 'epv_equity' : epv_equity, 'epv_equity_ttm' : epv_equity_ttm}

    return response



    # print('revenue: ', revenue)

class ComputeEPVAPIView(APIView):
    def post(self, request):
        """
        This endpoint will compute the EPV for the provided list of ticker symbols
        expected request format:
        request = {
                    tickers : ['AAPL', 'META']
                }
        """
        #tickers is of type list
        qfs_symbols = request.data['qfs_symbols']
        years_op_margin = request.data.get('years_op_margin', 5) #defines how many years into the past are taken to compute operating margin
        avg_revenue_nr_years = request.data.get('years_avg_revenue', 3) #defines how many years into the past are taken to compute operating margin

        #response list
        response = []

        for qfs_symbol in qfs_symbols:
            #check if value is in cache
            valuation = cache.get(f'{qfs_symbol}_EPV_{years_op_margin}_{avg_revenue_nr_years}')
            # valuation = None
            if valuation is None:
                #compute epv for ticker
                valuation = compute_epv(qfs_symbol, op_margin_nr_years=years_op_margin,  avg_revenue_nr_years = avg_revenue_nr_years)

                #store valuation in cache
                cache.set(f'{qfs_symbol}_EPV_{years_op_margin}_{avg_revenue_nr_years}', valuation, timeout=CACHE_TTL)
            response.append(valuation)

        return Response(response)


def get_eps_forecasts(ticker):
    """gets eps forecasts from yahoo finance (if available for given company)"""
    #yahoo finance url
    url = f"https://finance.yahoo.com/quote/{ticker}/analysis/"

    #user-agent header to avoid being blocked by web scrapers
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    #get current and next year
    current_year = datetime.now().year
    next_year = current_year + 1

    # print(f'current year and next year:{current_year} {next_year}')

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Find the Earnings Estimate section
        earnings_section = soup.find("section", {"data-testid": "earningsEstimate"})
        
        if earnings_section:
            #find header to extract current and next year
            headers = earnings_section.find_all("tr")

            for header in headers:
                header_cells = header.find_all("th")
                # print('these are header_cells: ', header_cells)

                if header_cells:
                    current_year_re = re.search(r"\((\d{4})\)", header_cells[-2].text.strip())
                    next_year_re = re.search(r"\((\d{4})\)", header_cells[-1].text.strip())

                    if current_year_re:
                        current_year = int(current_year_re.group(1))
                    
                    if next_year_re:
                        next_year = int(next_year_re.group(1))

            #create data structure fr eps forecast
            eps_forecast = { current_year : {'low' : 0, 'avg' : 0, 'high' : 0}, next_year : {'low' : 0, 'avg' : 0, 'high' : 0} }


            # Find the table rows
            rows = earnings_section.find_all("tr")
            
            # Extract EPS forecast for Next Year
            for row in rows:
                cells = row.find_all("td")

                #search for average estimate
                if cells and "avg" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                    next_year_eps = cells[-1].text.strip()  # Last cell is Next Year (2026)
                    
                    eps_forecast[current_year]['avg'] = float(cells[-2].text.strip())
                    eps_forecast[next_year]['avg'] = float(cells[-1].text.strip())

                    print(f"EPS forecast for Next Year (2026): {next_year_eps}")
                    #break
                elif cells and "low" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                    eps_forecast[current_year]['low'] = float(cells[-2].text.strip())
                    eps_forecast[next_year]['low'] = float(cells[-1].text.strip())
                elif cells and "high" in cells[0].text.strip().lower() and "esti" in cells[0].text.strip().lower():
                    eps_forecast[current_year]['high'] = float(cells[-2].text.strip())
                    eps_forecast[next_year]['high'] = float(cells[-1].text.strip())
        else:
            eps_forecast = { current_year : {'low' : 0, 'avg' : 0, 'high' : 0}, next_year : {'low' : 0, 'avg' : 0, 'high' : 0} }
            print("Earnings Estimate section not found.")
    else:
        print(f"Failed to retrieve EPS page. Status code: {response.status_code}")
        eps_forecast = { current_year : {'low' : 0, 'avg' : 0, 'high' : 0}, next_year : {'low' : 0, 'avg' : 0, 'high' : 0} }

    return eps_forecast, current_year, next_year


def initial_guess_implied_growth(wacc, residual_earnings_2):
    """Function taht returns initial guess for g that is likely to converge to the correct root"""
    g_initial = 0

    #if second residual earnings terms is negative, initial guess must be greater than wacc, otherwise we do not find root of interest
    if residual_earnings_2 < 0:
        g_initial = wacc + 0.02
    else:
        g_initial = wacc - 0.02

    return g_initial

def convert_residual_earnings_growth_to_eps_growth(residual_earnings_t, eps_t, bps_t, g, year, wacc = 0.1, nr_years = 5):
    """Converts a growth rate of residual earnings (g) into a growth rate in eps"""
    #store residual earnings
    re = [residual_earnings_t]
    eps = [eps_t]
    eps_forecast = [{'x' : year, 'y' : eps_t}]
    eps_growth_rate = []
    bps = [bps_t]

    print("initial book value: ", bps_t)
    
    
    for i in range(0,5):
        re.append(re[i]*(1+g))
        eps_t_p_1 = bps[i]*wacc + re[i+1]
        eps_forecast.append({'x' : year + i +1, 'y' : eps_t_p_1})
        eps.append(eps_t_p_1)
        bps.append(bps[i] + eps_t_p_1)


    #compute eps growth rate based on eps numbers
    for j in range(0, len(eps)-1):
        eps_growth_rate.append({'x' : year + j +1, 'y' : (eps[j+1]-eps[j])/eps[j]})


    return eps_forecast, eps_growth_rate


def compute_implicit_growth_forecast(qfs_symbol, nr_years_eps = 3, wacc = 0.1):
    """
    This computes the implicit growth in the current market price (account for value chapter 3 Stephan Penman)
    
    para ticker:
        - type: string
        - descn: ticker for which the implied growth should get computed
    
    para nr_years_eps:
        - type: integer
        - descn: if no eps forecast exists on yahoo finance, we will construct a forecast based on historical average. nr_years_eps determines how many years we use to compute the average
    
    para wacc:
        - type: string
        - descn: weighted average cost of capital
    """
    traded_company = TradedCompanies.objects.get(qfs_symbol=qfs_symbol)

    #get market price and eps forecasts from yahoo finance
    market_price, _ = get_ticker_price(traded_company.ticker, qfs_symbol)
    eps_forecast, current_year, next_year = get_eps_forecasts(traded_company.ticker)

    #assign memory to variables
    eps = []
    eps_ttm = []
    eps_valuation = [] #eps forecast for the next three years
    eps_valuation_ttm = [] #eps forecast for the next three years based on eps_ttm

    #get earnings per shares
    income_statement_annual = IncomeStatementAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')   #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...
    income_statements_q = IncomeStatementQuarter.objects.filter(qfs_symbol_id=qfs_symbol).order_by('-period_end_date')[:4]

    #get quarterly and annual balance sheets
    balance_sheets = BalanceSheetAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[0]  #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...
    balance_sheet_q_minus_4 = BalanceSheetQuarter.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[3]  #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...

    #define function that we will use to compute implicit growth (penman page 68)
    def equation(g, market_price, b0, residual_earnings_1, residual_earnings_2, wacc):
        """Function to solve for implicit market growth contained in market price"""
        return b0 + residual_earnings_1/(1+wacc) + residual_earnings_2/ ((1+wacc) * (wacc - g)) - market_price

    #collect historical eps data
    for idx, income_statement in enumerate(income_statement_annual):
        if idx < nr_years_eps:
            eps.append(income_statement.eps_diluted)

    #collect eps data of ttm
    for income_q in income_statements_q:
        eps_ttm.append(income_q.eps_diluted)


    #check if eps forecast is not available on yahoo finance
    if eps_forecast[current_year]['avg'] == 0 or eps_forecast[next_year]['avg'] == 0:
        #average eps
        avg_eps = sum(eps)/len(eps)

        #we assume constant eps
        eps_valuation.extend([avg_eps, avg_eps])
    elif eps_forecast[current_year]['avg'] != 0 and eps_forecast[next_year]['avg'] != 0:
        eps_valuation.extend([eps_forecast[current_year]['avg'], eps_forecast[next_year]['avg']])

    #for ttm valuation we assume that eps ttm stays constant
    eps_valuation_ttm.extend([sum(eps_ttm), sum(eps_ttm)])

    #get number of shares for ticker
    nr_shares = get_nr_of_outstanding_shares(traded_company.ticker, qfs_symbol)

    #store book values per share
    bps = []
    bps_ttm = []
    bps.append(balance_sheets.total_equity/nr_shares)
    bps_ttm.append(balance_sheet_q_minus_4.total_equity/nr_shares)
    residual_earnings = []
    residual_earnings_ttm = []

    for t in range(0, len(eps_valuation)):
        #compute return on equity and residual earnings
        roce_t = eps_valuation[t]/bps[t]
        roce_t_ttm = eps_valuation_ttm[t]/bps_ttm[t]
        residual_earnings.append((roce_t - wacc)*bps[t])
        residual_earnings_ttm.append((roce_t_ttm - wacc)*bps_ttm[t]) 

        #compute next book value: b_1 = b_0 + eps
        bps.append(bps[t] + eps_valuation[t])
        bps_ttm.append(bps_ttm[t] + eps_valuation_ttm[t])

   
    #if book value is bigger than current market price --> g = 0 (no growth); in that case don't have to compute it
    if market_price is not None and bps_ttm[0] is not None:
        if bps_ttm[0] < market_price:
            #good initial guess is important as we are solving the equation iteratively; depending on sign of second residual_earnings_term we need to choose initial guess; otherwise it does not converge
            g_initial_guess = initial_guess_implied_growth(wacc, residual_earnings_ttm[1])       
            g_solution_ttm = fsolve(equation, g_initial_guess, args=(market_price, bps_ttm[0], residual_earnings_ttm[0], residual_earnings_ttm[1], wacc))
        else:
            g_solution_ttm = [0]
    else:
        g_solution_ttm = [0]

    if market_price is not None and bps[0] is not None:
        if bps[0] < market_price:
            #good initial guess is important as we are solving the equation iteratively; depending on sign of second residual_earnings_term we need to choose initial guess; otherwise it does not converge
            g_initial_guess = initial_guess_implied_growth(wacc, residual_earnings[1])
            g_solution = fsolve(equation, g_initial_guess, args=(market_price, bps[0], residual_earnings[0], residual_earnings[1], wacc))
        else:
            g_solution = [0]
    else:
        g_solution = [0]

    #check if next year is a valid value; because in yahoo finance if there does not exist an eps forecast the default year is 1970
    curr_year =  datetime.now().year
    if next_year != (curr_year + 1) and next_year != curr_year:
        next_year = curr_year + 1


    #growth rate g that we compute is a growth rate in residual earnings. We can transform that into an eps growth rate which is easier to grasp
    eps_forecast_ttm, eps_forecast_growth_rate_ttm = convert_residual_earnings_growth_to_eps_growth(residual_earnings_t=residual_earnings_ttm[1], eps_t=eps_valuation_ttm[1], bps_t=bps_ttm[2], year=next_year, g=g_solution_ttm[0], wacc = wacc)
    eps_forecast, eps_forecast_growth_rate = convert_residual_earnings_growth_to_eps_growth(residual_earnings_t=residual_earnings[1], eps_t=eps_valuation[1], bps_t=bps[2], year=next_year, g=g_solution[0], wacc = wacc)

    return {'implied_residual_earnings_growth_ttm' : g_solution_ttm[0], 'bps_q_minus_4' : bps_ttm[0], 'implied_residual_earnings_growth' : g_solution[0], 'bps_0' : bps[0], 'implied_eps_forecast': eps_forecast, 'implied_eps_growth_rate': eps_forecast_growth_rate, 'implied_eps_forecast_ttm': eps_forecast_ttm, 'implied_eps_growth_rate_ttm': eps_forecast_growth_rate_ttm}

def equity_value_residual_earnings(qfs_symbol, nr_years_eps = 3, wacc = 0.1, trends_years=5):
    """
    
    para trends_years:
        - type: integer
        - descn: number of years that are taken to display trend graphs for eps, book_value

    para nr_years_eps:
        - type: integer
        - descn: determines the number of year of historical eps numbers is used to compute an average eps. in case nore eps forecast exists for a company on yahoo finance, an averagee eps of the past nr_years_eps is computed

    para wacc:
        - type: float (smaller than 1)
        - descn: weighted average cost of capital
    
    para trends_years:
        - type: integer
        - for variables like eps and book value a time series of values is returned. the trends_years variable determines how far into the past we go
    
    """
    #get traded company object
    traded_company = TradedCompanies.objects.get(qfs_symbol=qfs_symbol)
    company_name = traded_company.name
    currency = traded_company.currency
    
    #get eps forecast from yahoo finance (if available)
    eps_forecast, current_year, next_year = get_eps_forecasts(traded_company.ticker)

    #allocate memory to values
    eps = []
    eps_trend = []
    eps_ttm = []
    eps_valuation = [] #eps forecast for the next three years
    eps_valuation_ttm = [] #eps forecast for the next three years based on eps_ttm
    book_value = [] #book value is shareholder equity
    book_value_trend = []
    roce_trend = []
    net_income = []
    net_income_ttm = []

    #with the eps forecast you can compute ROCE_t = EPS_t/BookValue_t-1
    #given ROCE_t, r, and BookValue_t-1 you can compute the first tem
    #get book value
    balance_sheets = BalanceSheetAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')  #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...
    balance_sheet_q = BalanceSheetQuarter.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[:4]  #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...

    #book value most recent
    book_value_ttm = balance_sheet_q[0].total_equity
    book_value_q_minus_4 = balance_sheet_q[3].total_equity

    #get earnings per shares
    income_statement_annual = IncomeStatementAnnual.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')   #ordering is descending, so for example: 2022.12.01, 2021.12.01, 2020.12.01,  ...
    income_statements_q = IncomeStatementQuarter.objects.filter(qfs_symbol_id=qfs_symbol).order_by('-period_end_date')[:4]

    for idx, income_statement in enumerate(income_statement_annual):
        if idx < trends_years:
            eps_trend.append({'x' : income_statement.period_end_date, 'y' : income_statement.eps_diluted })
            net_income.append({'x' : income_statement.period_end_date, 'y' : income_statement.net_income })

        if idx < nr_years_eps:
            eps.append(income_statement.eps_diluted)

    for income_q in income_statements_q:
        eps_ttm.append(income_q.eps_diluted)
        net_income_ttm.append(income_q.net_income)

    #insert eps_ttm in eps_trend
    eps_trend.insert(0, {'x' : 'TTM', 'y' : sum(eps_ttm) })


    #extract book values
    for idx, balance_sheet in enumerate(balance_sheets):
        if idx < trends_years:
            book_value.append(balance_sheet.total_equity)
            book_value_trend.append({'x' : balance_sheet.period_end_date, 'y' : balance_sheet.total_equity })


    #insert most up to date book value
    book_value_trend.insert(0, {'x' :  balance_sheet_q[0].period_end_date, 'y' : book_value_ttm})


    #compute roce trend; roce is defined as: ROCE_t = EPS_t/BookValue_t-1; note that net_income and book_value are ordered in descing order, so 01.12.2024, 01.12.2023, 01.12.2022, ...
    for idx in range(0, len(book_value_trend)-1):
        try:
            roce_trend.append({ 'x' :  net_income[idx]['x'], 'y' : net_income[idx]['y']/book_value_trend[idx+1]['y']})
        except ZeroDivisionError:
            roce_trend.append({ 'x' :  net_income[idx]['x'], 'y' : 0})

    #insert the most recent roce number
    try:
        roce_trend.insert(0,{'x' : 'TTM' , 'y' : sum(net_income_ttm)/book_value_ttm})
    except ZeroDivisionError:
        roce_trend.insert(0,{'x' : 'TTM' , 'y' : 0})
      

    #check if eps forecast is not available on yahoo finance; if not we will compute average eps of past year and use it as a forecast
    if eps_forecast[current_year]['avg'] == 0 or eps_forecast[next_year]['avg'] == 0:
        #average eps
        avg_eps = sum(eps)/len(eps)

        #we assume constant eps
        eps_valuation.extend([avg_eps, avg_eps])
    elif eps_forecast[current_year]['avg'] != 0 and eps_forecast[next_year]['avg'] != 0:
        eps_valuation.extend([eps_forecast[current_year]['avg'], eps_forecast[next_year]['avg']])

    #for ttm valuation we assume that eps ttm stays constant
    eps_valuation_ttm.extend([sum(eps_ttm), sum(eps_ttm)])

    #get number of shares
    income_statement_q = IncomeStatementQuarter.objects.filter(qfs_symbol_id = qfs_symbol).order_by('-period_end_date')[0]
    nr_shares = income_statement_q.shares_diluted

    #prepare data for valuation
    bps = []
    bps_ttm = []
    bps.append(book_value[0]/nr_shares)
    bps_ttm.append(book_value_q_minus_4/nr_shares)

    #tracks terms for equity valuation; initial term is book value
    equity_value = [bps[0]]
    equity_value_ttm = [bps_ttm[0]]

    for t in range(0, len(eps_valuation)):
        #get book value
        b_0 = bps[t]

        #compute return on equity and residual earnings
        roce_t = eps_valuation[t]/bps[t]
        roce_t_ttm = eps_valuation_ttm[t]/bps_ttm[t]
        residual_earnings = (roce_t - wacc)*bps[t]
        residual_earnings_ttm = (roce_t_ttm - wacc)*bps_ttm[t]

        #check if terminal value must be computed
        if t == (len(eps_valuation)-1):
            term = residual_earnings/((1+wacc)**(t)*wacc) 
            term_ttm = residual_earnings_ttm/((1+wacc)**(t)*wacc) 
        else:
            #compute valuation term
            term = residual_earnings/(1+wacc)**(t+1)
            term_ttm = residual_earnings_ttm/(1+wacc)**(t+1)

        #compute part of equity value
        equity_value.append(term)
        equity_value_ttm.append(term_ttm)
        #compute next book value: b_1 = b_0 + eps
        bps.append(bps[t] + eps_valuation[t])
        bps_ttm.append(bps_ttm[t] + eps_valuation_ttm[t])

    #extract current share price for ticker symbol
    current_price, price_currency = get_ticker_price(traded_company.ticker, qfs_symbol)

    #sum all equity values
    return {'qfs_symbol' : qfs_symbol, 'name' : company_name, 'currency' : currency, 'equity_value_per_share' : sum(equity_value), 'equity_value_series' : equity_value, 'equity_value_per_share_ttm' : sum(equity_value_ttm), 'equity_value_series_ttm' : equity_value_ttm, 'current_price' : current_price, 'roce' : list(reversed(roce_trend)), 'eps_forecast' : eps_valuation, 'eps_forecast_ttm' : eps_valuation_ttm,   'eps' : list(reversed(eps_trend)), 'book_value' : list(reversed(book_value_trend)) ,  'price_currency' : price_currency }

class ComputeEquityValuePenmanAPIView(APIView):
    def post(self, request):

        #tickers is of type list
        qfs_symbols = request.data['qfs_symbols']
        years_eps = request.data.get('years_eps', 3) #define number of years that are used to compute average EPS
        response = []


        for qfs_symbol in qfs_symbols:
            #check if valuation is in cache
            valuation = cache.get(f'{qfs_symbol}_EquityValPenman_{years_eps}')
            growth = cache.get(f'{qfs_symbol}_GrowthPenman_{years_eps}')

            # valuation = None

            #if values not in cache we need to compute it and store in cache
            if valuation is None or growth is None:
                #values company based on stephan penman's equity valuation method; zero growth (g=0) is assumed
                valuation = equity_value_residual_earnings(qfs_symbol, nr_years_eps=years_eps)

                #computes the growth that is implied in the current market price.
                growth = compute_implicit_growth_forecast(qfs_symbol)

                #store valuation and growth in cache
                cache.set(f'{qfs_symbol}_EquityValPenman_{years_eps}', valuation, timeout=CACHE_TTL)
                cache.set(f'{qfs_symbol}_GrowthPenman_{years_eps}', growth, timeout=CACHE_TTL)

            #merge the two dictionaries
            merged_dicts = valuation | growth

            #append merged dicts to response
            response.append(merged_dicts)

        return Response(response)


def get_model_fields(model, filter_value, fields_to_exclude=[], is_custom_metric=False):
    """
    Function that returns fields of a model as a list of strings. Filter defines which model fields we want. Possible values are:
    - Key Ratios (Q)
    - Key Ratios (Y)
    - Cashflow Statement (Y)
    - Balance Sheet (Y)
    - Balance Sheet (Q)
    - Income Statement (Y)
    - valuation
    """

    print('model.column_metadata: ', model.column_metadata)

    return [{'techName' : field.name, 'readableName' : field.verbose_name if field.verbose_name != field.name else "", "fieldType": field.get_internal_type(), 'isCustomMetric' : is_custom_metric, 'table' : model.column_metadata[field.name] if field.name in model.column_metadata else ""} for field in model._meta.get_fields() if field.name not in fields_to_exclude and field.is_relation is False and model.column_metadata[field.name] == filter_value]

def get_custom_metrics(model):
     # Query all CustomMetrics objects
    metrics = model.objects.all()
    
    # Create a list of dictionaries using list comprehension
    return [
        {
            'techName': metric.tech_name,
            'readableName': metric.readable_name,
            # 'table': metric.table if len(metric.table.split(',')) <=1 else metric.table.split(','),
            'isCustomMetric' : True
        }
        for metric in metrics
    ]

class StockFilterAvailableQuantitiesAPIView(APIView):
    def get(self, request):
        """
        endpoint that returns all available fields that can be used as a filter for the stock screener
        {incomeStatement: ["field1", "field2", "field3", "field4", "field5", etc.], balanceSheet: ["fieldb1", "fieldb2", etc.], ...}
        """
        FIELDS_TO_EXCLUDE = ["id", "ticker", "period_end_date"]

        valuation_fields = get_model_fields(ScreenerData, filter_value="valuation", fields_to_exclude=FIELDS_TO_EXCLUDE)
        company_fields = get_model_fields(ScreenerData, filter_value="Company Info", fields_to_exclude=FIELDS_TO_EXCLUDE)
        income_y_fields = get_model_fields(ScreenerData, filter_value="Income Statement (Y)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        balance_y_fields = get_model_fields(ScreenerData, filter_value="Balance Sheet (Y)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        balance_q_fields = get_model_fields(ScreenerData, filter_value="Balance Sheet (Q)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        cf_y_fields = get_model_fields(ScreenerData, filter_value="Cashflow Statement (Y)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        kr_y_fields = get_model_fields(ScreenerData, filter_value="Key Ratios (Y)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        kr_q_fields = get_model_fields(ScreenerData, filter_value="Key Ratios (Q)", fields_to_exclude=FIELDS_TO_EXCLUDE)
        customFields = get_custom_metrics(CustomMetrics)
        
        
        #print('these are valuation fields: ', screener_filter_fields)
        # balanceSheetFields = get_model_fields(BalanceSheetAnnual, fields_to_exclude=FIELDS_TO_EXCLUDE)
        # incomeStatementFields = get_model_fields(IncomeStatementAnnual, fields_to_exclude=FIELDS_TO_EXCLUDE)
        # cashFlowStatementFields = get_model_fields(CashFlowStatementAnnual, fields_to_exclude=FIELDS_TO_EXCLUDE)
        # keyRatioFields = get_model_fields(KeyRatiosAnnual, fields_to_exclude=FIELDS_TO_EXCLUDE)
        # companyFields = get_model_fields(TradedCompanies, fields_to_exclude=["id", "ticker", "qfs_symbol", "company_type", "name"])
        # customFields = get_custom_metrics(CustomMetrics)

        responseList = []

        responseBalanceSheet = {"tableName" : "Balance Sheet (Y)", "tableColumns" : balance_y_fields}
        responseCompanyFields = {"tableName" : "Company Info", "tableColumns" : company_fields}
        responseBalanceSheetQ = {"tableName" : "Balance Sheet (Q)", "tableColumns" : balance_q_fields}
        responseIncomeY = {"tableName" : "Income Statement (Y)", "tableColumns" : income_y_fields}
        responseCfY = {"tableName" : "Cashflow Statement (Y)", "tableColumns" : cf_y_fields}
        responseKrY = {"tableName" : "Key Ratios (Y)", "tableColumns" : kr_y_fields}
        responseKrQ = {"tableName" : "Key Ratios (Q)", "tableColumns" : kr_q_fields}
        responseValuation = {"tableName" : "Valuation", "tableColumns" : valuation_fields}
        responseCustomMetrics = {"tableName": "CustomMetrics", "tableColumns" : customFields}
        
        # responseIncomeStatement = {"tableName" : "IncomeStatement", "tableColumns" : incomeStatementFields}
        # responseCashFlowStatement = {"tableName" : "CashFlowStatement", "tableColumns" : cashFlowStatementFields}
        # responseKeyRatios = {"tableName" : "KeyRatios", "tableColumns" : keyRatioFields}
        # responseCompanyFields = {"tableName" : "CompanyInfo", "tableColumns": companyFields}
        # responseCustomMetrics = {"tableName": "CustomMetrics", "tableColumns" : customFields}
       
        responseList.extend([responseIncomeY, responseCompanyFields, responseBalanceSheet, responseBalanceSheetQ, responseValuation, responseKrY, responseKrQ,responseCfY,responseCustomMetrics])

        responseSerialized = StockScreenerFiltersSerializer(responseList, many=True).data

        # return Response({'test' : 10})
        return Response(responseSerialized)
    

class CustomMetricsAPIView(APIView):
    def get(self, request):
        """
        endpoint that returns all available fields that can be used as a filter for the stock screener
        {incomeStatement: ["field1", "field2", "field3", "field4", "field5", etc.], balanceSheet: ["fieldb1", "fieldb2", etc.], ...}
        """

        # CustomMetrics

       
        return Response("ok")
    
    def post(self, request):
        serializer = CustomMetricsSerializer(data=request.data)

        #check if object is valid
        serializer.is_valid(raise_exception=True)

        #save the changes to the database
        serializer.save(user_id=request.user.id)

        #send the newly created db entry as a response along with the message
        return Response(serializer.data)
    
    def put(self, request):
        (employeeProfile, created) = CustomMetrics.objects.get_or_create(user_id = request.user.id)


class FilterViewsAPIView(APIView): 
    def get(self, request):
        user_filter_views = FilterViews.objects.filter(user=request.user)
        # Serialize the queryset
        serializer = FilterViewsSerializer(user_filter_views, many=True)
        # Return the serialized data
        return Response(serializer.data)


    # def post(self, request):
    def put(self, request):
        #extract id from request; if id is present it means that FilterView already exists, if not new object will be created
        if 'id' in request.data:
            print('id present in request data: ', request.data.get('id'))

            try:
                filter_view = FilterViews.objects.get(id=request.data.get("id"), user_id=request.user.id)
                # Update the existing object with the request data
                serializer = FilterViewsSerializer(filter_view, data=request.data, partial=True)
                
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            except FilterViews.DoesNotExist:
                # If the object does not exist, return a 404 error
                return Response({"detail": "Not found."})
        
        else:
            serializer = FilterViewsSerializer(data=request.data)

            #check if object is valid
            serializer.is_valid(raise_exception=True)

            #save the changes to the database
            serializer.save(user_id=request.user.id)

            #send the newly created db entry as a response along with the message
            return Response(serializer.data)
    

    def delete(self, request):
        """
        Deletes a saved view filter
        """
        try:
            # Step 1: Get the object by its primary key
            obj = FilterViews.objects.get(pk=request.data.get("id"))
            
            # Step 2: Delete the object
            obj.delete()

            #get all remaining objects and return
            user_filter_views = FilterViews.objects.filter(user=request.user)
            # Serialize the queryset
            serializer = FilterViewsSerializer(user_filter_views, many=True)
            # Return the serialized data
            return Response(serializer.data)
        # except FilterViews.DoesNotExist:
            # print(f"Object with pk={pk} does not exist.")


        except Exception as e:
            print(f"An error occurred: {e}")
        # def put(self, request):
    #     (employeeProfile, created) = CustomMetrics.objects.get_or_create(user_id = request.user.id)


def get_char_fields(model, fields_to_exclude=[]):
    charFields =  [field.name  for field in model._meta.get_fields() if field.is_relation is False and field.get_internal_type() in ("CharField") and field.name not in fields_to_exclude]
    return {'model' : model, 'fields' : charFields}

class CharFieldFilterOptionsAPIView(APIView): 
    def get(self, request):
        #extract all char fields and their corresponding table
        charFieldsAllTables = []
        data = {}
        charFieldsAllTables.append(get_char_fields(TradedCompanies, fields_to_exclude=["ticker", "qfs_symbol", "company_type", "name"]))
        # charFields.append(get_char_fields(TradedCompanies, fields_to_exclude=["ticker", "qfs_symbol", "company_type"]))

        for charFields in charFieldsAllTables:
            model = charFields['model']
            for field in charFields['fields']:
                distinct_values = TradedCompanies.objects.exclude(**{field: None}).values_list(field, flat=True).distinct()

                data[field] = distinct_values


        serializable_data = {'field_options': data}

        # Serialize the data
        serializer = CharFieldFilterOptions(serializable_data)
        return Response(serializer.data)





class AddColumn(APIView): 
    def post(self, request):
        # Extract data from the request
        qfs_symbols = request.data.get('qfs_symbols', [])
        field = request.data.get('field')
        #table = request.data.get('table')

        #model = get_django_model(table)
        model = ScreenerData

        # Query the database for the specified ids and field
        queryset = model.objects.filter(qfs_symbol__in=qfs_symbols)

        data = list(queryset.values('qfs_symbol', field))

        return Response(data)


class TickerSymbols(APIView): 
    def get(self, request):
        traded_companies = TradedCompanies.objects.values('id', 'qfs_symbol', 'name')
        # return Response({list(traded_companies)})
        return Response({'data' : list(traded_companies)})
    

class MicroCapClubProfiles(APIView): 
    def get(self, request):
        url = os.environ["MCC_GSHEET_URL"]
        print('this is url: ' , url)

        #define fields that will be added to response
        # Define the valuation fields and default values
        valuation_fields = [
            {'epv_per_share' : 'EPV'},
            {'epv_per_share_ttm' : 'EPV (TTM)'},
            {'penman_per_share' : 'Penman'},
            {'penman_g' : 'g'},
            {'penman_per_share_ttm' : 'Penman (TTM)' },
            {'penman_g_ttm' : 'g (TTM)'}
        ]

        #if the symbol is not found in my database, zero values will be added
        default_valuation_data = {list(item.values())[0]: 0.0 for item in valuation_fields}

        #download google sheet
        response = requests.get(url)

        if response.status_code == 200:
            #transform excel to pandas data frame
            df_dict = pd.read_excel(BytesIO(response.content), sheet_name=None)  # `sheet_name=None` loads all sheets

            # extract name of sheets; currently we only are interested in third sheet (Performance, sorted by date published)
            performance_sheet = list(df_dict.keys())[2]

            #extract the performance sheet as a dataframe
            df = df_dict[performance_sheet]  # Extract the first sheet as a DataFrame

            #extract the following columns
            columns = ['Company', 'Symbol', 'Sector', 'Member', 'DWP', 'PWP', 'Price Today/ \n*Takeout Price']
            df = df[columns]

            #rename column
            df = df.rename(columns={"Price Today/ \n*Takeout Price": "Price Today"})

            #remove all rows which have a NaN value in the Symbol column
            df = df.dropna(subset=["Symbol"]) 
            df = df.dropna(subset=["DWP"]) 

            #replace inf and na values because these are not json compliant
            df = df.replace([float("inf"), float("-inf")], None)  # Replace infinities
            df = df.where(pd.notna(df), None)  # Replace NaN with None
            df = df.astype(object).where(pd.notna(df), None)
            #transform rows of df to dictionary
            response_dict = df.to_dict(orient='records')

            #add valuation columns to reponse dict
            for item in response_dict:
                #get the microcap club (mcc) symbol
                mcc_symbol = item.get('Symbol')
                matched_company = None

                if ':' in mcc_symbol:
                    exchange, ticker = mcc_symbol.split(':', 1)
                    qfs1 = f"{ticker}:{exchange}"
                    qfs2 = f"{exchange}:{ticker}"  # just in case
                else:
                    ticker = mcc_symbol
                    qfs1 = qfs2 = None

                candidates = TradedCompanies.objects.filter(
                    Q(ticker=ticker) |
                    Q(qfs_symbol=mcc_symbol) |
                    Q(qfs_symbol=qfs1) |
                    Q(qfs_symbol=qfs2)
                )

                # Prioritize exact qfs_symbol match
                if qfs1:
                    exact_match = candidates.filter(qfs_symbol=qfs1).first()
                    if exact_match:
                        matched_company = exact_match
                    else:
                        matched_company = candidates.first()  # fallback to first candidate
                else:
                    matched_company = candidates.first()

                if matched_company:
                    valuation = Valuation.objects.filter(
                        qfs_symbol=matched_company
                    ).order_by('-valuation_date').first()

                    if valuation:
                        item.update({
                            list(item.values())[0]: getattr(valuation, list(item.keys())[0]) or 0.0 for item in valuation_fields
                        })
                    else:
                        item.update(default_valuation_data)
                else:
                    item.update(default_valuation_data)

                # #check if symbol is in format EXCHANGE:TICKER or just TICKER
                # if ':' in mcc_symbol:
                #     exchange, ticker = mcc_symbol.split(':',1)
                #     qfs_candidate = f"{ticker}:{exchange}"
                #     search_filter = Q(ticker=ticker) | Q(qfs_symbol=mcc_symbol) | Q(qfs_symbol=qfs_candidate)
                # else:
                #     ticker = mcc_symbol
                #     search_filter = Q(ticker=ticker) | Q(qfs_symbol=ticker)     

                # #try to find symbol in database
                # try:
                #     print('before q , this is earch filter: ', search_filter)
                #     traded_company = TradedCompanies.objects.get(search_filter)
                #     valuation = Valuation.objects.filter(qfs_symbol=traded_company).order_by('-valuation_date').first()

                #     if valuation:
                #         item.update({
                #             field: getattr(valuation, field) or 0.0 for field in valuation_fields
                #         })
                #     else:
                #         item.update(default_valuation_data)


                # except TradedCompanies.DoesNotExist:
                #     item.update(default_valuation_data)


            return Response(response_dict)
        else:
            return Response(
                {"error": "Failed to download the file"},
                status=status.HTTP_400_BAD_REQUEST,
            )



class PyBindExample(APIView): 
    def get(self, request):
        # result = some_fn(5,7)
        # result = extract_revenue()
        # test_list = [0.5, 1.5, 2.5, 3.5]
        # result_list = process_list(test_list)
        # #tickers = ["YRD", "AMCX", "QSG", "META", "XKLJHFSJLKH", "META"]

        tickers = list(TradedCompanies.objects.values_list('ticker', flat=True)[:5000])

        #tickers = [tickers[1315]]
        print('these are tickers: ', tickers)

        #epvs = compute_epv_cpp(tickers, 4,4,0.1,0.3)

        # for key, value_list in epvs.items():
        #     for idx, value in enumerate(value_list):
        #         if value == float('-inf') or value == float('inf'):
        #             print(f"-inf found in {key} at index {idx}; ticker: {tickers[idx]}")



        # exampleData = generate_data()
        # print('example Data: ', exampleData)
        # print('python type: ', type(exampleData))

        # # return Response({list(traded_companies)})
        # return Response({'data' : epvs})
    