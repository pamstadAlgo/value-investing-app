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


def fetch_missing_symbols(conn):
    # If your column is qfs_symbol_id instead of qfs_symbol, change it here and in UPDATE below.
    sql = """
        SELECT qfs_symbol
        FROM quickfs_dj_tradedcompanies
        WHERE last_close_price IS NULL
          AND qfs_symbol IS NOT NULL
    """

    #fetch all tickers that have close price null
    with conn.cursor() as cur:
        cur.execute(sql)
        return [r[0] for r in cur.fetchall()]


def fetch_price_for_symbol(symbol: str, api_key: str) -> float | None:
    url = f"https://public-api.quickfs.net/v1/data/{symbol}/price?api_key={os.environ['QUICKFS_API_KEY']}"
    try:
        resp = requests.get(url, timeout=20)
        if resp.status_code != 200:
            print(f"[WARN] Fetch close price {symbol}: HTTP {resp.status_code} - {resp.text[:200]}")
            return None

        payload = resp.json()
        price = payload.get("data", None)
        if price is None:
            print(f"[WARN] Fetch close price {symbol}: missing 'data' field")
            return None

        return float(price)

    except (requests.RequestException, ValueError) as e:
        print(f"[WARN] Fetch close price {symbol}: request/json error: {e}")
        return None
    except Exception as e:
        print(f"[WARN] Fetch close price {symbol}: unexpected error: {e}")
        return None


def backfill_missing_close_prices(
    dbname: str,
    user: str,
    password: str,
    host: str,
    port: int,
    api_key: str,
    fetch_chunk_size: int = 500,   # how many tickers to fetch before moving to next fetch chunk
    db_chunk_size: int = 3000,     # how many rows per execute_values UPDATE
):
    update_query = """
        UPDATE quickfs_dj_tradedcompanies AS q
        SET last_close_price = v.price
        FROM (VALUES %s) AS v(qfs_symbol, price)
        WHERE q.qfs_symbol = v.qfs_symbol;
    """

    conn = None
    try:
        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )
        print(f"Connected to database: {conn.get_dsn_parameters()['dbname']}")

        missing_symbols = fetch_missing_symbols(conn)
        total_missing = len(missing_symbols)
        print(f"Tickers with NULL last_close_price: {total_missing}")

        if total_missing == 0:
            return

        # We will accumulate (symbol, price) pairs and flush updates in db_chunk_size batches.
        updates_buffer = []
        fetched = 0
        ok = 0
        failed = 0

        with conn:
            with conn.cursor() as cur:
                for i in range(0, total_missing, fetch_chunk_size):
                    fetch_chunk = missing_symbols[i:i + fetch_chunk_size]

                    for symbol in fetch_chunk:
                        fetched += 1
                        price = fetch_price_for_symbol(symbol, api_key)

                        if price is None:
                            failed += 1
                            continue

                        ok += 1
                        updates_buffer.append((symbol, price))

                        # Flush DB updates in batches
                        if len(updates_buffer) >= db_chunk_size:
                            execute_values(cur, update_query, updates_buffer)
                            updates_buffer.clear()

                    print(
                        f"Processed {min(i+fetch_chunk_size, total_missing)}/{total_missing} "
                        f"(ok={ok}, failed={failed})"
                    )

                # Final flush
                if updates_buffer:
                    execute_values(cur, update_query, updates_buffer)
                    updates_buffer.clear()

        print("Backfill update committed successfully.")

    except Exception as e:
        print(f"[ERROR] Backfill failed: {e}")
    finally:
        if conn:
            conn.close()


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
        # print(f"qfs symbol: {qfs_symbol_v2}")
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


#arguments are url, dbname, user, password, host, port
print("#######################################")
print("Start migrating close prices")
print("#######################################\n\n\n")

for country in countries:
    url = f"https://public-api.quickfs.net/v1/market-data/last-close/{country}?api_key={os.environ['QUICKFS_API_KEY']}"

    #this makes use of the bulk endpoint --> does not contain all symbols
   # migrate_close_prices(url,os.environ['POSTGRES_DB'],os.environ['POSTGRES_USER'],os.environ['POSTGRES_PASSWORD'],os.environ['DB_HOST'],int(os.environ['DB_PORT']))
    

    


#fetches the missing symbols
backfill_missing_close_prices(
    dbname=os.environ["POSTGRES_DB"],
    user=os.environ["POSTGRES_USER"],
    password=os.environ["POSTGRES_PASSWORD"],
    host=os.environ["DB_HOST"],
    port=int(os.environ["DB_PORT"]),
    api_key=os.environ["QUICKFS_API_KEY"],
    fetch_chunk_size=500,
    db_chunk_size=3000,
)

print("#######################################")
print("End migrating close prices")
print("#######################################\n\n\n")