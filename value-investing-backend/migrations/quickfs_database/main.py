##################################################################################################
"""YOU NEED TO RUN THE MAIN.PY FILE FROM THE FOLDER IT IS IN; OTHERWISE WE CANNOT IMPORT THE THINGS FROM MIGRATION_UTILS"""
##################################################################################################


from migration_utils import migrate_financial_statements, income_statement_fields, traded_companies_fields, balance_sheet_fields, cf_statement_fields, key_ratios_fields, get_connection, migrate_traded_companies, create_temp_staging_table, migrate_traded_companies_optimized, migrate_financial_statements_optimized
import psycopg2, os
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import pandas as pd
import re
import json
from sqlalchemy import create_engine
import datetime
import logging
from pathlib import Path
from dotenv import load_dotenv
import psutil
load_dotenv()

#Define which data you would like to migrate
MIGRATE_INCOME_STATEMENT_DATA = True
MIGRATE_BALANCE_SHEET_DATA = True
MIGRATE_CF_STATEMENT_DATA = True
MIGRATE_KEY_RATIOS_DATA = True

#Define which country data you would like to migrate: Possible values are: 'australia', 'canada', 'europe', 'unitedkingdom', 'usa'; if you want to migrate multiple countries then you can pack them in a list
MIGRATE_COUNTRIES_DATA = ['australia', 'canada', 'europe', 'unitedkingdom', 'usa']
# MIGRATE_COUNTRIES_DATA = ['usa']


 # Get the path to the directory where this script is located
base_dir = Path(__file__).parent  # the folder containing download_quickfs_data.py

    # Construct the path to the Data folder
log_file = base_dir / "logs/update_quickfs_database" 
# Define the log file path
#log_file = "/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database/logs/update_quickfs_database.job.stdout"

# Ensure the directory exists
os.makedirs(os.path.dirname(log_file), exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=log_file,  # Log file path
    filemode='a',  # Append mode
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
    level=logging.INFO  # Logging level
)


###################################################################################################################################################
#MIGRATION SCRIPT START
###################################################################################################################################################
#BASE_URL = "/Users/pa/Desktop/SideProjects/Valuation/value-investing-app/value-investing-backend/migrations/quickfs_database"


#create sql alchemy connection
engine = get_connection()

#create psycopg2 connection
# psy_connection = psycopg2.connect(host="localhost", database="value-investing-dev", user="postgres", password="v,1846PSVv,1846PSV")
psy_connection = psycopg2.connect(host=os.environ['DB_HOST'], database=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], port=os.environ['DB_PORT'])

os.environ['QUICKFS_DB_KEY']

print('test trigger')

stag_table_trad_comp = "stag_table_trad_comp"
stag_table_income_y = "stag_table_income_y"
stag_table_income_q = "stag_table_income_q"
stag_table_balance_y = "stag_table_balance_y"
stag_table_balance_q = "stag_table_balance_q"
stag_table_cf_y = "stag_table_cf_y"
stag_table_cf_q = "stag_table_cf_q"
stag_table_kr_y = "stag_table_kr_y"
stag_table_kr_q = "stag_table_kr_q"


#creaet staging table for trade companies
create_temp_staging_table(psy_connection, target_table="quickfs_dj_tradedcompanies", staging_table=stag_table_trad_comp)

#create staging table for each table that should get migrated
if MIGRATE_INCOME_STATEMENT_DATA:
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_incomestatementannual", staging_table=stag_table_income_y)
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_incomestatementquarter", staging_table=stag_table_income_q)
if MIGRATE_BALANCE_SHEET_DATA:
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_balancesheetannual", staging_table=stag_table_balance_y)
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_balancesheetquarter", staging_table=stag_table_balance_q)
if MIGRATE_CF_STATEMENT_DATA:
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_cashflowstatementannual", staging_table=stag_table_cf_y)
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_cashflowstatementquarter", staging_table=stag_table_cf_q)
if MIGRATE_KEY_RATIOS_DATA:
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_keyratiosannual", staging_table=stag_table_kr_y)
    create_temp_staging_table(psy_connection, target_table="quickfs_dj_keyratiosquarter", staging_table=stag_table_kr_q)


#iterate through files in data folder
for country in MIGRATE_COUNTRIES_DATA:
    print('\n\n\n')
    print('###########################################################')
    print(f'Migration started for {country}')
    print('###########################################################')

    #for file in os.listdir(f'{BASE_URL}/Data/{country}'):
    for file in os.listdir(f'./Data/{country}'):
        print(f'country: {country}, file {file}')

        #hidden files and folders starting with . will be ignored
        if not file.startswith('.'):
            #construct filename
            file_name = f"./Data/{country}/{file}"
        
            logging.info(f'migration file {file_name.split("/")[-1]} started!')

            #determine optimal chunk size
            # Read a small sample to estimate memory per row
            # sample = pd.read_csv(file_name, nrows=10000)
            # bytes_per_row = sample.memory_usage(deep=True).sum() / len(sample)
            # # Get available memory
            # avail_mem = psutil.virtual_memory().available
            # print('avilable memory: ', avail_mem)
            # del sample

            # Estimate optimal chunk size (use ~5% of available memory)
            # optimal_chunksize = int((avail_mem * 0.5) / bytes_per_row)

            # print(f"Estimated optimal chunksize: {optimal_chunksize:,} rows")

            #load data; na_values = [] has effect that only empty values are replaced by NaN; before it happended that ticker symbols NA were interpreted as NaN by pandas
            # df = pd.read_csv(file_name,na_values=[], keep_default_na=False)
            for chunk in pd.read_csv(file_name,na_values=[], chunksize=50000, keep_default_na=False):

                #remove rows where ticker is nan
                chunk = chunk[chunk['qfs_symbol'].notna()]

                #migrate traded company symbols
                # migrated_traded_companies = migrate_traded_companies(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=traded_companies_fields, file_name=file_name, target_table='quickfs_dj_tradedcompanies')
                migrate_traded_companies_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=traded_companies_fields, file_name=file_name, target_table='quickfs_dj_tradedcompanies', staging_table=stag_table_trad_comp)

                #check whether data is quarterly or annual
                if "quart" in file:
                    if MIGRATE_INCOME_STATEMENT_DATA:
                        # migrated_quarter_income_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementquarter', file_name=file_name, set_has_new_financials=True)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementquarter', staging_table=stag_table_income_q, file_name=file_name, set_has_new_financials=True)

                    if MIGRATE_BALANCE_SHEET_DATA:
                        # migrated_quarter_balance_sheet_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetquarter', file_name=file_name, set_has_new_financials=True)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetquarter', staging_table=stag_table_balance_q, file_name=file_name, set_has_new_financials=True)
                    if MIGRATE_CF_STATEMENT_DATA:
                        # migrated_quarter_cf_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementquarter', file_name=file_name)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementquarter', staging_table=stag_table_cf_q, file_name=file_name)
                    if MIGRATE_KEY_RATIOS_DATA:
                        # migrated_key_ratios_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosquarter', file_name=file_name)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosquarter', staging_table=stag_table_kr_q, file_name=file_name)
                else:
                    if MIGRATE_INCOME_STATEMENT_DATA:
                        # migrated_annual_income_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementannual', file_name=file_name, set_has_new_financials=True)
                       migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementannual', staging_table=stag_table_income_y, file_name=file_name, set_has_new_financials=True)
                    if MIGRATE_BALANCE_SHEET_DATA:
                        # migrated_annual_balance_sheet_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetannual', file_name=file_name, set_has_new_financials=True)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetannual', staging_table=stag_table_balance_y, file_name=file_name, set_has_new_financials=True)
                    if MIGRATE_CF_STATEMENT_DATA:
                        # migrated_quarter_cf_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementannual', file_name=file_name)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementannual', staging_table=stag_table_cf_y, file_name=file_name)
                    if MIGRATE_KEY_RATIOS_DATA:
                        # migrated_key_ratios_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosannual', file_name=file_name)
                        migrate_financial_statements_optimized(sqlalchemy_engine=engine, quickfs_df=chunk, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosannual', staging_table=stag_table_kr_y, file_name=file_name)

    print('###########################################################')
    print(f'Migration end for {country}')
    print('###########################################################')

###################################################################################################################################################
#MIGRATION SCRIPT END
###################################################################################################################################################