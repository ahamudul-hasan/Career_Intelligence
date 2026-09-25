import os
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import Config

def get_llm(model: str = None, temperature: float = 0.2):
    """Factory to get the configured LangChain ChatGoogleGenerativeAI client."""
    selected_model = model or Config.GEMINI_MODEL or "gemini-2.5-flash"
    api_key = Config.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in environment or .env")
    
    return ChatGoogleGenerativeAI(
        model=selected_model,
        google_api_key=api_key,
        temperature=temperature
    )
