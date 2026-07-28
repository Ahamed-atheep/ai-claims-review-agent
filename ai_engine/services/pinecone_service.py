from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_pinecone_client():
    """Initializes and returns Pinecone client connection safely."""
    if not config.PINECONE_API_KEY or config.PINECONE_API_KEY == "your_pinecone_api_key_here":
        return None
    try:
        import pinecone
        if hasattr(pinecone, "Pinecone"):
            pc = pinecone.Pinecone(api_key=config.PINECONE_API_KEY)
            return pc
    except Exception as e:
        logger.warning(f"Pinecone client init error: {e}")
        return None

def get_pinecone_index():
    """Returns index connection for insurance-knowledge-base."""
    pc = get_pinecone_client()
    if pc:
        try:
            return pc.Index(config.PINECONE_INDEX_NAME)
        except Exception as e:
            logger.warning(f"Pinecone index connection error: {e}")
            return None
    return None
