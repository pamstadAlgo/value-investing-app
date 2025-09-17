##################################################################################################
"""YOU NEED TO RUN THE MAIN.PY FILE FROM THE FOLDER IT IS IN; OTHERWISE WE CANNOT IMPORT THE THINGS FROM MIGRATION_UTILS"""
##################################################################################################


from migration_utils import migrate_financial_statements, income_statement_fields, traded_companies_fields, balance_sheet_fields, cf_statement_fields, key_ratios_fields, get_connection, migrate_traded_companies
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
load_dotenv()

#Define which data you would like to migrate
MIGRATE_INCOME_STATEMENT_DATA = True
MIGRATE_BALANCE_SHEET_DATA = True
MIGRATE_CF_STATEMENT_DATA = True
MIGRATE_KEY_RATIOS_DATA = True

#Define which country data you would like to migrate: Possible values are: 'australia', 'canada', 'europe', 'unitedkingdom', 'usa'; if you want to migrate multiple countries then you can pack them in a list
MIGRATE_COUNTRIES_DATA = ['australia', 'canada', 'europe', 'unitedkingdom', 'usa']
# MIGRATE_COUNTRIES_DATA = ['europe']


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
#psy_connection = psycopg2.connect(host="localhost", database="value-investing-dev", user="postgres", password="v,1846PSVv,1846PSV")
psy_connection = psycopg2.connect(host=os.environ['DB_HOST'], database=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], port=os.environ['DB_PORT'])

os.environ['QUICKFS_DB_KEY']


#iterate through files in data folder
for country in MIGRATE_COUNTRIES_DATA:
    #for file in os.listdir(f'{BASE_URL}/Data/{country}'):
    for file in os.listdir(f'./Data/{country}'):

        #hidden files and folders starting with . will be ignored
        if not file.startswith('.'):
            #construct filename
            file_name = f"./Data/{country}/{file}"
        
            logging.info(f'migration file {file_name.split("/")[-1]} started!')

            #load data; na_values = [] has effect that only empty values are replaced by NaN; before it happended that ticker symbols NA were interpreted as NaN by pandas
            df = pd.read_csv(file_name,na_values=[], keep_default_na=False)

            #remove rows where ticker is nan
            df = df[df['qfs_symbol'].notna()]

            #migrate traded company symbols
            migrated_traded_companies = migrate_traded_companies(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=traded_companies_fields, file_name=file_name, target_table='quickfs_dj_tradedcompanies')

            #check whether data is quarterly or annual
            if "quart" in file:
                if MIGRATE_INCOME_STATEMENT_DATA:
                    migrated_quarter_income_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementquarter', file_name=file_name, set_has_new_financials=True)
                if MIGRATE_BALANCE_SHEET_DATA:
                    migrated_quarter_balance_sheet_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetquarter', file_name=file_name, set_has_new_financials=True)
                if MIGRATE_CF_STATEMENT_DATA:
                    migrated_quarter_cf_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementquarter', file_name=file_name)
                if MIGRATE_KEY_RATIOS_DATA:
                    migrated_key_ratios_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosquarter', file_name=file_name)
            else:
                if MIGRATE_INCOME_STATEMENT_DATA:
                    migrated_annual_income_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=income_statement_fields, target_table='quickfs_dj_incomestatementannual', file_name=file_name, set_has_new_financials=True)
                if MIGRATE_BALANCE_SHEET_DATA:
                    migrated_annual_balance_sheet_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=balance_sheet_fields, target_table='quickfs_dj_balancesheetannual', file_name=file_name, set_has_new_financials=True)
                if MIGRATE_CF_STATEMENT_DATA:
                    migrated_quarter_cf_statement_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=cf_statement_fields, target_table='quickfs_dj_cashflowstatementannual', file_name=file_name)
                if MIGRATE_KEY_RATIOS_DATA:
                    migrated_key_ratios_data = migrate_financial_statements(sqlalchemy_engine=engine, quickfs_df=df, psycopg2_connection=psy_connection, relevant_fields=key_ratios_fields, target_table='quickfs_dj_keyratiosannual', file_name=file_name)

###################################################################################################################################################
#MIGRATION SCRIPT END
###################################################################################################################################################