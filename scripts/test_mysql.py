"""Test script to verify MySQL connectivity.
Reads connection parameters from environment or .env file.
"""
import os
import sys
from dotenv import load_dotenv

# Load .env from root or current directory
load_dotenv()

DB_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("MYSQL_PORT", 3306))
DB_USER = os.getenv("MYSQL_USER", "career_user")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "career_password")
DB_NAME = os.getenv("MYSQL_DATABASE", "career_intelligence")

def test_connection():
    print(f"[*] Testing MySQL connection to {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}...")
    try:
        import pymysql
    except ImportError:
        print("[!] pymysql not installed. Install requirements first: pip install -r backend/requirements.txt")
        sys.exit(1)

    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT VERSION() AS version, DATABASE() AS db;")
            result = cursor.fetchone()
            print(f"[+] Success! Connected to MySQL {result['version']}, current database: {result['db']}")
            
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            print(f"[+] Tables present in {DB_NAME}: {len(tables)} tables")
        conn.close()
        return True
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
