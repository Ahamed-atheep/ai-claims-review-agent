from langchain_pinecone import PineconeVectorStore
from ai_engine.config import config
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.utils.logger import logger

def get_vector_store() -> PineconeVectorStore:
    """
    Returns PineconeVectorStore instance using langchain-pinecone.
    """
    try:
        embeddings = get_embeddings()
        vector_store = PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=config.PINECONE_API_KEY
        )
        logger.info(f"Connected to Pinecone index '{config.PINECONE_INDEX_NAME}' via PineconeVectorStore")
        return vector_store
    except Exception as e:
        logger.error(f"Error connecting to PineconeVectorStore '{config.PINECONE_INDEX_NAME}': {e}")
        return None
