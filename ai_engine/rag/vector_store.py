from langchain_community.vectorstores import Pinecone as LangChainPinecone
from ai_engine.config import config
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.utils.logger import logger

def get_vector_store():
    """Returns LangChain Pinecone vector store wrapper for insurance-knowledge-base."""
    try:
        embeddings = get_embeddings()
        vector_store = LangChainPinecone.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings
        )
        return vector_store
    except Exception as e:
        logger.error(f"Error loading Pinecone vector store '{config.PINECONE_INDEX_NAME}': {e}")
        return None
