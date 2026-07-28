from ai_engine.config import config
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.utils.logger import logger

def get_vector_store():
    """
    Returns VectorStore instance with dynamic multi-package fallback:
    1. langchain_pinecone.PineconeVectorStore
    2. langchain_community.vectorstores.PineconeVectorStore / Pinecone
    3. Direct Pinecone SDK Index
    """
    embeddings = get_embeddings()

    # 1. Try langchain_pinecone
    try:
        from langchain_pinecone import PineconeVectorStore
        logger.info(f"Connected to Pinecone index '{config.PINECONE_INDEX_NAME}' via langchain-pinecone")
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=config.PINECONE_API_KEY
        )
    except Exception as e:
        logger.debug(f"langchain_pinecone import skipped: {e}")

    # 2. Try langchain_community PineconeVectorStore
    try:
        from langchain_community.vectorstores import PineconeVectorStore
        logger.info(f"Connected to Pinecone index '{config.PINECONE_INDEX_NAME}' via langchain_community")
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings
        )
    except Exception as e:
        logger.debug(f"langchain_community PineconeVectorStore skipped: {e}")

    # 3. Try Direct Pinecone SDK 3.0+
    if config.PINECONE_API_KEY and config.PINECONE_API_KEY != "your_pinecone_api_key_here":
        try:
            import pinecone
            if hasattr(pinecone, "Pinecone"):
                pc = pinecone.Pinecone(api_key=config.PINECONE_API_KEY)
                index = pc.Index(config.PINECONE_INDEX_NAME)
                logger.info(f"Connected directly to Pinecone Index '{config.PINECONE_INDEX_NAME}'")
                return index
        except Exception as e:
            logger.warning(f"Pinecone SDK direct connection attempt: {e}")

    return None
