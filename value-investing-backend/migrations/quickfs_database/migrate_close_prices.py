#from epv import migrate_close_prices
import os
from dotenv import load_dotenv
load_dotenv()
import requests
import psycopg2
from psycopg2.extras import execute_values
countries = ["EUROPE", "AU", "US", "US/OTC"]

def fetch_close_price_data(url: str):
    print(f"url: {url}")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"HTTP request failed with status: {response.status_code}")
        print(f"Error body: {response.text}")
        return []
    
    return response.json().get("data", [])

def migrate_close_prices(
    url: str,
    dbname: str,
    user: str,
    password: str,
    host: str = "localhost",
    port: int = 5432,
    chunk_size: int = 3000
):
    market_data = fetch_close_price_data(url)
    
    # Extract symbols and prices
    qfs_symbols = []
    prices = []
    
    for item in market_data:
        qfs_symbol_v2 = item["qfs_symbol_v2"]
        print(f"qfs symbol: {qfs_symbol_v2}")
        qfs_symbols.append(qfs_symbol_v2)
        prices.append(item["price"])
    
    update_query = """
    UPDATE quickfs_dj_tradedcompanies AS q
    SET last_close_price = v.price
    FROM (
        VALUES %s
    ) AS v(qfs_symbol, price)
    WHERE q.qfs_symbol = v.qfs_symbol;
    """
    
    try:
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        print(f"Connected to database: {conn.get_dsn_parameters()['dbname']}")
        
        with conn:
            with conn.cursor() as cur:
                # Insert in chunks
                total_tickers = len(qfs_symbols)
                for i in range(0, total_tickers, chunk_size):
                    chunk = list(zip(
                        qfs_symbols[i:i+chunk_size],
                        prices[i:i+chunk_size]
                    ))
                    # execute_values is much faster than looping individual inserts
                    execute_values(cur, update_query, chunk)
                    
        print("Update committed successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

for country in countries:
    url = f"https://public-api.quickfs.net/v1/market-data/last-close/{country}?api_key={os.environ['QUICKFS_API_KEY']}"

    print('url we pass: ', url)

    #arguments are url, dbname, user, password, host, port
    migrate_close_prices(url,os.environ['POSTGRES_DB'],os.environ['POSTGRES_USER'],os.environ['POSTGRES_PASSWORD'],os.environ['DB_HOST'],int(os.environ['DB_PORT']))