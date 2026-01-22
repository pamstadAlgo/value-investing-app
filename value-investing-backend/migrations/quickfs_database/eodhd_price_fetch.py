import os
import csv
import requests
import psycopg2
from psycopg2.extras import execute_values
from typing import Dict, List, Set, Tuple, Optional
from helpers import EXCHANGE_MAPPING
from dotenv import load_dotenv

load_dotenv()

def batch_update_last_close_price(
    cur,
    updates: List[Tuple[str, float]],
    chunk_size: int = 3000
) -> None:
    """
    updates: [(qfs_symbol, close_price), ...]
    """
    update_query = """
        UPDATE quickfs_dj_tradedcompanies AS q
        SET last_close_price = v.price
        FROM (VALUES %s) AS v(qfs_symbol, price)
        WHERE q.qfs_symbol = v.qfs_symbol;
    """

    for i in range(0, len(updates), chunk_size):
        chunk = updates[i:i + chunk_size]
        execute_values(cur, update_query, chunk)

def eodhd_bulk_url(exchange_param: str, api_token: str) -> str:
    return f"https://eodhd.com/api/eod-bulk-last-day/{exchange_param}?api_token={api_token}"


def fetch_qfs_symbols_to_update(conn) -> List[Tuple[str, str]]:
    sql = """
        SELECT qfs_symbol, exchange
        FROM quickfs_dj_tradedcompanies
        WHERE qfs_symbol IS NOT NULL
          AND last_close_price IS NULL
    """
    with conn.cursor() as cur:
        cur.execute(sql)
        return cur.fetchall()   # already returns list of tuples


def stream_eodhd_bulk_csv_and_collect(
    exchange_param: str,
    api_token: str,
    needed_symbols: Set[str],
    timeout: int = 60
) -> Dict[str, float]:
    """
    Downloads the CSV once for an exchange (e.g. 'US') and returns:
      { 'AAPL.US': 135.83, ... } for only the symbols in needed_symbols.

    needed_symbols must be in the same format as EODHD rows: Code.Ex (e.g. AAPL.US).
    """
    url = eodhd_bulk_url(exchange_param, api_token)
    print(f"[EODHD] GET {url}")

    found: Dict[str, float] = {}

    with requests.get(url, stream=True, timeout=timeout) as resp:
        if resp.status_code != 200:
            body = resp.text[:400]
            raise RuntimeError(f"EODHD bulk HTTP {resp.status_code}: {body}")

        # Stream lines and feed to csv.DictReader
        lines = (line.decode("utf-8", errors="replace") for line in resp.iter_lines() if line)
        reader = csv.DictReader(lines)

        # Expect columns: Code,Ex,Date,Open,High,Low,Close,Adjusted_close,Volume
        for row in reader:
            code = (row.get("Code") or "").strip()
            ex = (row.get("Ex") or "").strip()
            close_str = (row.get("Close") or "").strip()

            if not code or not ex or not close_str:
                continue

            sym = f"{code}.{ex}"
            if sym not in needed_symbols:
                continue

            try:
                found[sym] = float(close_str)
            except ValueError:
                # keep going; just skip bad rows
                continue

    print(f"[EODHD] Exchange {exchange_param}: found {len(found)}/{len(needed_symbols)} needed symbols")
    return found


# --------- Your transform integration ---------
# You said you already have a transform function. We'll call it "transform_qfs_to_eodhd_candidates".

def transform_qfs_to_eodhd_candidates(qfs_symbol: str, exchange: str) -> Optional[List[str]]:
    """
    Replace this with your method call:
      self._transform_symbol(qfs_symbol)

    Must return a list like ["AAPL.US"] or ["VOD.LSE","VOD.LON"] etc.
    """
 #parse everything after : of qfs symbol
    if ":" in qfs_symbol:
        ticker, country_code = qfs_symbol.split(":")

        # #get exchange of symbol
        # exchange = self._exchange(qfs_symbol)

        #check if country_code$exchange exists in mapping dict
        try:
            eodhd_symbols = []

            for exchg in EXCHANGE_MAPPING[f'{country_code}${exchange}']:
                eodhd_symbols.append(f"{ticker}.{exchg}")
            # #TO-DO: SYMBOLS SHOULD BE A LIST OF CANDIDATES; FOR EXAMPLE FOR LONDON WE HAVE AMBIGIOUS/MULTIPLE EXCHANGES
            # eodhd_symbol = f"{ticker}.{EXCHANGE_MAPPING[f'{country_code}${exchange}']}"
            return eodhd_symbols
        except Exception as e:
            print(f'{qfs_symbol} not able to transform for EODHD')
            return None

    return None

def infer_exchange_param_from_eodhd_symbol(eodhd_symbol: str) -> str | None:
    """
    EODHD bulk endpoint expects param like 'US'.
    For 'AAPL.US' -> 'US'
    """
    if "." not in eodhd_symbol:
        print(f"Invalid EODHD symbol: {eodhd_symbol}")
        return None
    return eodhd_symbol.split(".")[-1]

def write_unresolved_qfs_to_csv(
    unresolved: List[Tuple[str, str, str]],
    filepath: str = "output/unresolved_qfs_symbols.csv"
) -> None:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["qfs_symbol", "exchange", "reason"])
        w.writerows(unresolved)

    print(f"Wrote {len(unresolved)} unresolved symbols to {filepath}")


# --------- Orchestration ---------

def update_close_prices_via_eodhd_bulk(
    dbname: str,
    user: str,
    password: str,
    host: str,
    port: int,
    eodhd_api_token: str,
    db_update_chunk_size: int = 3000,
) -> None:
    """
    - loads qfs_symbol list from DB
    - transforms to EODHD candidates
    - fetches bulk CSV per exchange param once
    - updates DB in batches
    """

    conn = None
    try:
        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )
        print(f"Connected to database: {conn.get_dsn_parameters()['dbname']}")

        qfs_symbols = fetch_qfs_symbols_to_update(conn)
        print(f"DB symbols to update: {len(qfs_symbols)}")

        # Build reverse index: eodhd_symbol -> [qfs_symbol, ...]
        eodhd_to_qfs: Dict[str, List[str]] = {}
        #this will store {'US' : ('APPL.US', 'META.US', etc.), 'LSE': ('BGO.LES', 'FSTA.LSE', etc.)}
        exchange_to_needed: Dict[str, Set[str]] = {}

        # Track unresolved with reasons
        unresolved: Dict[Tuple[str, str], str] = {}  # (qfs_symbol, exchange) -> reason


        transform_failed = 0
        for qfs, exchg in qfs_symbols:
            try:
                candidates = transform_qfs_to_eodhd_candidates(qfs, exchg)
            except Exception as e:
                print(f"[WARN] transform error for {qfs}: {e}")
                candidates = None

            if not candidates:
                transform_failed += 1
                continue

            # Note: if you have multiple candidates, we map them all.
            for eod in candidates:
                eodhd_to_qfs.setdefault(eod, []).append(qfs)
                exch_param = infer_exchange_param_from_eodhd_symbol(eod)
                # if exch_param is not None:
                #     exchange_to_needed.setdefault(exch_param, set()).add(eod)

                if exch_param is None:
                    unresolved.setdefault((qfs, exchg), "invalid_eodhd_symbol")
                    continue

                exchange_to_needed.setdefault(exch_param, set()).add(eod)

        print(f"Unique EODHD symbols needed: {len(eodhd_to_qfs)}")
        print(f"Bulk exchanges to fetch: {sorted(exchange_to_needed.keys())}")
        print(f"Already unresolved (transform/parse): {len(unresolved)}")


        # Fetch per exchange, collect all prices
        eodhd_prices: Dict[str, float] = {}
        for exch_param, needed in exchange_to_needed.items():
            # One HTTP call per exchange_param
            found = stream_eodhd_bulk_csv_and_collect(
                exchange_param=exch_param,
                api_token=eodhd_api_token,
                needed_symbols=needed,
            )
            eodhd_prices.update(found)

        # Build DB updates: for each EODHD symbol found, update all mapped QFS symbols
        updates: List[Tuple[str, float]] = []
        resolved_qfs: Set[str] = set()

        for eod_sym, price in eodhd_prices.items():
            for qfs in eodhd_to_qfs.get(eod_sym, []):
                updates.append((qfs, price))
                resolved_qfs.add(qfs)

        # Mark "not_found_in_bulk" for transformed-but-missing
        # (only if not already marked unresolved earlier)
        for qfs, exchg in qfs_symbols:
            if (qfs, exchg) in unresolved:
                continue

            # if it had candidates at all, it will appear in resolved_qfs OR be missing in bulk
            # We can detect by checking if qfs appears anywhere in eodhd_to_qfs values.
            had_candidates = any(qfs in lst for lst in eodhd_to_qfs.values())
            if had_candidates and qfs not in resolved_qfs:
                unresolved[(qfs, exchg)] = "not_found_in_bulk"

        print(f"Prepared DB updates: {len(updates)} rows")
        print(f"Still unresolved after bulk: {len(unresolved)} qfs symbols")

        # Write unresolved to file
        unresolved_rows = [(qfs, exchg, reason) for (qfs, exchg), reason in unresolved.items()]
        write_unresolved_qfs_to_csv(unresolved_rows, filepath="output/unresolved_qfs_symbols.csv")

        # Batch update DB
        with conn:
            with conn.cursor() as cur:
                batch_update_last_close_price(cur, updates, chunk_size=db_update_chunk_size)

        print("Bulk close price update committed successfully.")

    finally:
        if conn:
            conn.close()

