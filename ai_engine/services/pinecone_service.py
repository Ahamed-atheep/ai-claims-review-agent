from pinecone import Pinecone
from ai_engine.config import config
from ai_engine.utils.logger import logger

def get_pinecone_client():
    """Initializes and returns Pinecone client connection."""
    if not config.PINECONE_API_KEY:
        logger.warning("PINECONE_API_KEY is not set in config.")
        return None
    try:
        pc = Pinecone(api_key=config.PINECONE_API_KEY)
        return pc
    except Exception as e:
        logger.error(f"Failed to initialize Pinecone client: {e}")
        return None

def get_pinecone_index():
    """Returns index connection for insurance-knowledge-base."""
    pc = get_pinecone_client()
    if pc:
        try:
            index = pc.Index(config.PINECONE_INDEX_NAME)
            return index
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone index {config.PINECONE_INDEX_NAME}: {e}")
            return None
    return None
