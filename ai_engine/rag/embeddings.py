import os
from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_embeddings():
    """
    Returns Vector Embeddings instance using langchain_huggingface or GoogleGenerativeAIEmbeddings.
    Removes all deprecation warnings.
    """
    # 1. Try Google Gemini Embeddings if API key is valid
    if config.GEMINI_API_KEY and config.GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model=config.EMBEDDING_MODEL,
                google_api_key=config.GEMINI_API_KEY
            )
        except Exception as e:
            logger.debug(f"GoogleGenerativeAIEmbeddings init error: {e}")

    # 2. Try modern langchain_huggingface (No deprecation warnings)
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    except Exception as e:
        logger.debug(f"langchain_huggingface import attempt: {e}")

    # 3. Fallback to langchain_community HuggingFaceEmbeddings if needed
    from langchain_community.embeddings import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
