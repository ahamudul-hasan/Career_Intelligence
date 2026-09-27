"""Database Seeding Script.
Loads seed data from SQL files (career_roles.sql, skills_aliases.sql) into MySQL.
"""
import os
import sys
import re
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

def clean_sql_comments(sql: str) -> str:
    """Strip out SQL single-line and multi-line comments."""
    # Remove single line comments
    lines = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--") or stripped.startswith("#"):
            continue
        lines.append(line)
    return "\n".join(lines)

def seed_database():
    print("[*] Starting database seed process...")
    try:
        import pymysql
    except ImportError:
        print("[-] pymysql not found. Please install backend requirements.")
        sys.exit(1)

    host = os.getenv("MYSQL_HOST", "127.0.0.1")
    port = int(os.getenv("MYSQL_PORT", 3306))
    user = os.getenv("MYSQL_USER", "career_user")
    password = os.getenv("MYSQL_PASSWORD", "career_password")
    database = os.getenv("MYSQL_DATABASE", "career_intelligence")

    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

    seed_files = [
        BASE_DIR / "database" / "seeds" / "career_roles.sql",
        BASE_DIR / "database" / "seeds" / "skills_aliases.sql",
    ]

    try:
        with conn.cursor() as cursor:
            for file_path in seed_files:
                if not file_path.exists():
                    print(f"[-] Warning: Seed file not found: {file_path}")
                    continue

                print(f"[*] Executing seed file: {file_path.name}...")
                with open(file_path, "r", encoding="utf-8") as f:
                    raw_sql = f.read()

                cleaned_sql = clean_sql_comments(raw_sql)
                statements = [s.strip() for s in cleaned_sql.split(";") if s.strip()]

                for stmt in statements:
                    cursor.execute(stmt)

                print(f"[+] Successfully executed {file_path.name}")

            # Verify career_roles count
            cursor.execute("SELECT COUNT(*) AS total FROM career_roles;")
            career_count = cursor.fetchone()["total"]
            print(f"[+] Total career roles in database: {career_count}")

            # Verify skills count
            cursor.execute("SELECT COUNT(*) AS total FROM skills;")
            skills_count = cursor.fetchone()["total"]
            print(f"[+] Total canonical skills in database: {skills_count}")

        print("[+] Database seeding complete!")
        return True
    except Exception as e:
        print(f"[-] Error seeding database: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)
