"""Test script to verify Job Data API (Adzuna) connectivity.
Reads ADZUNA_APP_ID and ADZUNA_APP_KEY from environment or .env file.
"""
import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

def test_adzuna():
    print("[*] Testing Adzuna Job API connectivity...")
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY or ADZUNA_APP_ID == "your_adzuna_app_id_here":
        print("[!] ADZUNA_APP_ID or ADZUNA_APP_KEY is not configured in .env.")
        print("    You can sign up for free API access at https://developer.adzuna.com/")
        print("    Add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env file.")
        return False

    url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": "Software Engineer",
        "results_per_page": 3,
        "content-type": "application/json"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            print(f"[+] Success! Adzuna returned {len(results)} jobs (total found: {data.get('count', 'N/A')})")
            for i, job in enumerate(results, 1):
                company = job.get("company", {}).get("display_name", "Unknown")
                location = job.get("location", {}).get("display_name", "Unknown")
                print(f"    {i}. {job.get('title')} at {company} ({location})")
            return True
        else:
            print(f"[-] API request failed with status code {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[-] Error querying Adzuna API: {e}")
        return False

if __name__ == "__main__":
    success = test_adzuna()
    sys.exit(0 if success else 1)
