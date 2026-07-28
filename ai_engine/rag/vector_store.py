from pinecone import Pinecone
from ai_engine.config import config
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.utils.logger import logger

def get_vector_store():
    """
    Returns Pinecone VectorStore instance supporting langchain_pinecone,
    PineconeVectorStore, or native Pinecone Index queries.
    """
    embeddings = get_embeddings()

    # 1. Try modern langchain_pinecone
    try:
        from langchain_pinecone import PineconeVectorStore
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=config.PINECONE_API_KEY
        )
    except Exception as e:
        logger.debug(f"langchain_pinecone import attempt: {e}")

    # 2. Try PineconeVectorStore from langchain_community
    try:
        from langchain_community.vectorstores import PineconeVectorStore
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings
        )
    except Exception as e:
        logger.debug(f"langchain_community PineconeVectorStore attempt: {e}")

    # 3. Direct Pinecone Client wrapper
    if config.PINECONE_API_KEY and config.PINECONE_API_KEY != "pcsk_your_pinecone_api_key_here":
        try:
            pc = Pinecone(api_key=config.PINECONE_API_KEY)
            index = pc.Index(config.PINECONE_INDEX_NAME)
            logger.info(f"Connected directly to Pinecone Index '{config.PINECONE_INDEX_NAME}' via Pinecone SDK 3.0+")
            return index
        except Exception as e:
            logger.error(f"Pinecone SDK connection error: {e}")

    return None
