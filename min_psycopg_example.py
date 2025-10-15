import psycopg2
from psycopg2.extras import RealDictCursor

def main():
    # Connect to your PostgreSQL database
    # Adjust these parameters to your setup
    conn = psycopg2.connect(
        host="value-investing-app-db.czq2skeymcmy.eu-north-1.rds.amazonaws.com",
        port=5432,
        dbname="postgres",
        user="postgres",
        password="v,1846PSVv,1846PSV"
    )

    # Use 'dict_row' so each row is returned as a dictionary-like object
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        qfs_symbol = 'YRD:US'
        # Run a simple SELECT query
        cur.execute("SELECT * FROM quickfs_dj_incomestatementannual where qfs_symbol_id = %s", (qfs_symbol,))

        # Iterate over results
        for row in cur:
            # Each row is a dict-like object
            print(f"qfs_symbol: {row['qfs_symbol_id']}, revenue: {row['revenue']},")
            break
    # Always close the connection
    conn.close()

if __name__ == "__main__":
    main()