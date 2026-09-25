"""Test script to verify Gemini LLM API connectivity via LangChain.
Reads GEMINI_API_KEY from environment or .env file.
"""
import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def extract_text(content):
    if isinstance(content, str):
        return content.strip()
    elif isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and "text" in item:
                parts.append(item["text"])
            elif hasattr(item, "text"):
                parts.append(getattr(item, "text"))
            else:
                parts.append(str(item))
        return " ".join(parts).strip()
    return str(content).strip()

def test_llm():
    print("[*] Testing Google Gemini API connectivity via LangChain...")
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("[!] GEMINI_API_KEY is not set in .env. Please set a valid key.")
        return False

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
    except ImportError as e:
        print(f"[!] LangChain Google GenAI packages not installed: {e}")
        print("    Install requirements first: pip install -r backend/requirements.txt")
        return False

    models_to_try = [
        os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "gemini-flash-latest",
        "gemini-3.8-flash"
    ]
    # Remove duplicates while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    prompt = "Explain what a Backend Engineer does in one short sentence."
    
    for model_name in models_to_try:
        print(f"[*] Trying model: {model_name}...")
        for attempt in range(1, 3):
            try:
                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=GEMINI_API_KEY,
                    temperature=0.2,
                )
                response = llm.invoke([HumanMessage(content=prompt)])
                clean_text = extract_text(response.content)
                print(f"[+] LLM Response received successfully from {model_name}:")
                print(f"    \"{clean_text}\"")
                return True
            except Exception as e:
                err_msg = str(e)
                if "503" in err_msg or "UNAVAILABLE" in err_msg:
                    print(f"[-] Model {model_name} temporary 503 spike (attempt {attempt}/2). Retrying in 2s...")
                    time.sleep(2)
                else:
                    print(f"[-] Error calling {model_name}: {err_msg}")
                    break

    print("[-] All attempted Gemini models failed.")
    return False

if __name__ == "__main__":
    success = test_llm()
    sys.exit(0 if success else 1)
