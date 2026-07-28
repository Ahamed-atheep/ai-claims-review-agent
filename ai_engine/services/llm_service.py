import os
from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_llm(temperature: float = 0.2):
    """
    Initializes and returns LLM instance (Groq or Google Gemini) with fallback support.
    """
    # 1. Try Groq
    if config.GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            logger.info("Initializing ChatGroq (llama-3.3-70b-versatile)...")
            return ChatGroq(
                groq_api_key=config.GROQ_API_KEY,
                model_name="llama-3.3-70b-versatile",
                temperature=temperature,
                streaming=False
            )
        except Exception as e:
            logger.warning(f"Failed to import/initialize ChatGroq: {e}")

    # 2. Try Google Gemini
    if config.GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Initializing ChatGoogleGenerativeAI (gemini-1.5-flash)...")
            return ChatGoogleGenerativeAI(
                google_api_key=config.GEMINI_API_KEY,
                model="gemini-1.5-flash",
                temperature=temperature,
                streaming=False
            )
        except Exception as e:
            logger.warning(f"Failed to import/initialize ChatGoogleGenerativeAI: {e}")

    # 3. Dynamic import fallback
    try:
        from langchain_community.chat_models import ChatGroq
        return ChatGroq(model_name="llama-3.3-70b-versatile", temperature=temperature)
    except Exception:
        pass

    # Basic Fallback object matching invoke interface if offline
    class FallbackLLM:
        async def ainvoke(self, prompt: str):
            class Resp:
                content = "{}"
            return Resp()

    return FallbackLLM()
