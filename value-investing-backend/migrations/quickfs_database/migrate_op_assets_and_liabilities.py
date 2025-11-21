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
    batch_size: int = 10000,  # adjust for performance
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
                # query = sql.SQL("""
                #     UPDATE {table}
                #     SET operating_assets = COALESCE(total_assets,0)
                #                            - COALESCE(cash_and_equiv,0)
                #                            - COALESCE(st_investments,0)
                #                            - COALESCE(equity_and_other_investments,0),
                #         operating_liabilities = COALESCE(total_liabilities,0)
                #                                - COALESCE(st_debt,0)
                #                                - COALESCE(current_capital_leases,0)
                #                                - COALESCE(lt_debt,0)
                #                                - COALESCE(noncurrent_capital_leases,0)
                #                                - COALESCE(pension_liabilities,0),
                #         net_operating_assets = (COALESCE(total_assets,0)
                #                                - COALESCE(cash_and_equiv,0)
                #                                - COALESCE(st_investments,0)
                #                                - COALESCE(equity_and_other_investments,0))
                #                               - (COALESCE(total_liabilities,0)
                #                                - COALESCE(st_debt,0)
                #                                - COALESCE(current_capital_leases,0)
                #                                - COALESCE(lt_debt,0)
                #                                - COALESCE(noncurrent_capital_leases,0)
                #                                - COALESCE(pension_liabilities,0))
                # """).format(table=sql.Identifier(table))
                # cur.execute(query)
                pk = sql.Identifier("id")

                while True:
                    query = sql.SQL("""
                        WITH to_update AS (
                            SELECT id,
                                   COALESCE(total_assets,0)
                                     - COALESCE(cash_and_equiv,0)
                                     - COALESCE(st_investments,0)
                                     - COALESCE(equity_and_other_investments,0) AS new_operating_assets,
                                   COALESCE(total_liabilities,0)
                                     - COALESCE(st_debt,0)
                                     - COALESCE(current_capital_leases,0)
                                     - COALESCE(lt_debt,0)
                                     - COALESCE(noncurrent_capital_leases,0)
                                     - COALESCE(pension_liabilities,0) AS new_operating_liabilities
                            FROM {table}
                            WHERE (
                                    operating_assets IS DISTINCT FROM 
                                        (COALESCE(total_assets,0)
                                       - COALESCE(cash_and_equiv,0)
                                       - COALESCE(st_investments,0)
                                       - COALESCE(equity_and_other_investments,0))
                                 OR operating_liabilities IS DISTINCT FROM 
                                        (COALESCE(total_liabilities,0)
                                       - COALESCE(st_debt,0)
                                       - COALESCE(current_capital_leases,0)
                                       - COALESCE(lt_debt,0)
                                       - COALESCE(noncurrent_capital_leases,0)
                                       - COALESCE(pension_liabilities,0))
                                 OR net_operating_assets IS DISTINCT FROM 
                                        ((COALESCE(total_assets,0)
                                       - COALESCE(cash_and_equiv,0)
                                       - COALESCE(st_investments,0)
                                       - COALESCE(equity_and_other_investments,0))
                                       - (COALESCE(total_liabilities,0)
                                       - COALESCE(st_debt,0)
                                       - COALESCE(current_capital_leases,0)
                                       - COALESCE(lt_debt,0)
                                       - COALESCE(noncurrent_capital_leases,0)
                                       - COALESCE(pension_liabilities,0)))
                                  )
                            ORDER BY id
                            LIMIT {batch_size}
                        )
                        UPDATE {table} t
                        SET operating_assets     = u.new_operating_assets,
                            operating_liabilities = u.new_operating_liabilities,
                            net_operating_assets  = (u.new_operating_assets - u.new_operating_liabilities)
                        FROM to_update u
                        WHERE t.id = u.id;
                    """).format(
                        table=sql.Identifier(table),
                        batch_size=sql.Literal(batch_size),
                    )

                    cur.execute(query)
                    rows_updated = cur.rowcount
                    conn.commit()

                    if rows_updated == 0:
                        break

                    # print(f"Updated {rows_updated} rows in {table}...")
        print(f"Updated all rows successfully for {table} in a single SQL statement.")
    finally:
        conn.close()

update_operating_entries(dbname=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], host=os.environ['DB_HOST'], port=int(os.environ['DB_PORT']), table="quickfs_dj_balancesheetannual")
update_operating_entries(dbname=os.environ['POSTGRES_DB'], user=os.environ['POSTGRES_USER'], password=os.environ['POSTGRES_PASSWORD'], host=os.environ['DB_HOST'], port=int(os.environ['DB_PORT']), table="quickfs_dj_balancesheetquarter")