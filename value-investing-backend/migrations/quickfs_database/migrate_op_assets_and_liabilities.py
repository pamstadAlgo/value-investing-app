import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
load_dotenv()



def update_operating_entries(
    dbname: str,
    user: str,
    password: str,
    table: str,
    host: str = "localhost",
    port: int = 5432,
   
):
    """
    Compute operating_assets, operating_liabilities, and net_operating_assets
    for all rows in the BalanceSheetAnnual table using a single SQL UPDATE.
    """
    conn = psycopg2.connect(
        dbname=dbname, user=user, password=password, host=host, port=port
    )
    try:
        with conn:
            with conn.cursor() as cur:
                query = sql.SQL("""
                    UPDATE {table}
                    SET operating_assets = COALESCE(total_assets,0)
                                           - COALESCE(cash_and_equiv,0)
                                           - COALESCE(st_investments,0)
                                           - COALESCE(equity_and_other_investments,0),
                        operating_liabilities = COALESCE(total_liabilities,0)
                                               - COALESCE(st_debt,0)
                                               - COALESCE(current_capital_leases,0)
                                               - COALESCE(lt_debt,0)
                                               - COALESCE(noncurrent_capital_leases,0)
                                               - COALESCE(pension_liabilities,0),
                        net_operating_assets = (COALESCE(total_assets,0)
                                               - COALESCE(cash_and_equiv,0)
                                               - COALESCE(st_investments,0)
                                               - COALESCE(equity_and_other_investments,0))
                                              - (COALESCE(total_liabilities,0)
                                               - COALESCE(st_debt,0)
                                               - COALESCE(current_capital_leases,0)
                                               - COALESCE(lt_debt,0)
                                               - COALESCE(noncurrent_capital_leases,0)
                                               - COALESCE(pension_liabilities,0))
                """).format(table=sql.Identifier(table))
                cur.execute(query)
        print(f"Updated all rows successfully for {table} in a single SQL statement.")
    finally:
        conn.close()

update_operating_entries(dbname=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], host=os.environ['DB_HOST'], port=int(os.environ['DB_PORT']), table="quickfs_dj_balancesheetannual")
update_operating_entries(dbname=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], host=os.environ['DB_HOST'], port=int(os.environ['DB_PORT']), table="quickfs_dj_balancesheetquarter")