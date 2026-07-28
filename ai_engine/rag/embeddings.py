import os
from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_embeddings():
    """
    Returns Vector Embeddings instance.
    Supports langchain_huggingface, GoogleGenerativeAIEmbeddings, or langchain_community fallback.
    """
    # 1. Try Google Gemini Embeddings if API key is present
    if config.GEMINI_API_KEY and config.GEMINI_API_KEY != "AIzaSy_your_gemini_api_key_here":
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model=config.EMBEDDING_MODEL,
                google_api_key=config.GEMINI_API_KEY
            )
        except Exception as e:
            logger.debug(f"GoogleGenerativeAIEmbeddings init error: {e}")

    # 2. Try modern langchain_huggingface
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception:
        pass

    # 3. Fallback to langchain_community HuggingFaceEmbeddings
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception:
        pass

    # 4. Fallback FakeEmbeddings
    from langchain_community.embeddings import FakeEmbeddings
    return FakeEmbeddings(size=3072)
