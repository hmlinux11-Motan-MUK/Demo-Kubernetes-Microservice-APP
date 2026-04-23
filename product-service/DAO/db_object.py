import os
import psycopg2


class PostgresDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            database=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT")
        )
        self.cursor = self.conn.cursor()

    def create_database(self):
        self.cursor.execute("""
            create table if not exists category_table(
                id serial,
                category text,
                parent_id int
            )
        """)
        self.cursor.execute("""
            create table if not exists productinfo(
                product_ID text,
                product_title text,
                product_image text,
                product_name text,
                product_price text,
                product_availability text,
                product_description text,
                catid int
            )
        """)
        self.conn.commit()

    def close_database(self):
        self.conn.commit()
        self.conn.close()

    def operation(self, operation, params=None, res=None):
        if params is not None:
            self.cursor.execute(operation, params)
            self.conn.commit()
        else:
            self.cursor.execute(operation)

        if res == 1:
            return self.cursor.fetchall()