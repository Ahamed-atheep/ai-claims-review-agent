from langchain_google_genai import GoogleGenerativeAIEmbeddings
from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_embeddings():
    """Returns Google Generative AI Embeddings instance (768 dimensions)."""
    try:
        return GoogleGenerativeAIEmbeddings(
            model=config.EMBEDDING_MODEL,
            google_api_key=config.GEMINI_API_KEY
        )
    except Exception as e:
        logger.error(f"Error initializing embeddings: {e}")
        # Fallback initializer
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=config.GEMINI_API_KEY
        )
