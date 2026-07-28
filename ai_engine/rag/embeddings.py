from langchain_google_genai import GoogleGenerativeAIEmbeddings
from ai_engine.config import config
from ai_engine.utils.logger import logger

# Module-level singleton instance (loaded ONCE at startup)
_EMBEDDINGS_INSTANCE = None

def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """
    Returns cached singleton Google Generative AI Embeddings instance (Gemini model).
    
    Efficiency Optimization: Loaded ONCE at startup and reused across all 5 parallel agents.
    """
    global _EMBEDDINGS_INSTANCE
    if _EMBEDDINGS_INSTANCE is not None:
        return _EMBEDDINGS_INSTANCE

    model_name = config.EMBEDDING_MODEL or "models/text-embedding-004"
    logger.info(f"Initializing Google Gemini Embeddings (model='{model_name}') ONCE at startup...")
    
    try:
        _EMBEDDINGS_INSTANCE = GoogleGenerativeAIEmbeddings(
            model=model_name,
            google_api_key=config.GEMINI_API_KEY
        )
    except Exception as e:
        logger.error(f"Error initializing Gemini embeddings: {e}")
        _EMBEDDINGS_INSTANCE = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=config.GEMINI_API_KEY
        )

    return _EMBEDDINGS_INSTANCE
