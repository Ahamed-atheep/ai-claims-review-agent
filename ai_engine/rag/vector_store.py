from ai_engine.config import config
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.utils.logger import logger

def get_vector_store():
    """
    Returns LangChain PineconeVectorStore instance.
    """
    embeddings = get_embeddings()

    # 1. Try langchain_pinecone
    try:
        from langchain_pinecone import PineconeVectorStore
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings,
            pinecone_api_key=config.PINECONE_API_KEY
        )
    except Exception as e:
        logger.debug(f"langchain_pinecone attempt: {e}")

    # 2. Try langchain_community PineconeVectorStore
    try:
        from langchain_community.vectorstores import PineconeVectorStore
        return PineconeVectorStore.from_existing_index(
            index_name=config.PINECONE_INDEX_NAME,
            embedding=embeddings
        )
    except Exception as e:
        logger.debug(f"langchain_community PineconeVectorStore attempt: {e}")

    # 3. Direct Pinecone SDK Wrapper with similarity_search method
    if config.PINECONE_API_KEY and config.PINECONE_API_KEY != "your_pinecone_api_key_here":
        try:
            import pinecone
            if hasattr(pinecone, "Pinecone"):
                pc = pinecone.Pinecone(api_key=config.PINECONE_API_KEY)
                index = pc.Index(config.PINECONE_INDEX_NAME)
                
                class NativePineconeVectorStore:
                    def __init__(self, idx, emb):
                        self.idx = idx
                        self.emb = emb
                    
                    def similarity_search(self, query: str, k: int = 5, filter: dict = None):
                        query_vector = self.emb.embed_query(query)
                        res = self.idx.query(
                            vector=query_vector,
                            top_k=k,
                            filter=filter or {},
                            include_metadata=True
                        )
                        matches = res.get("matches", []) if hasattr(res, "get") else getattr(res, "matches", [])
                        
                        try:
                            from langchain_core.documents import Document
                        except Exception:
                            from langchain.schema import Document

                        docs = []
                        for match in matches:
                            meta = match.get("metadata", {}) if hasattr(match, "get") else getattr(match, "metadata", {})
                            text = meta.get("text") or meta.get("content") or meta.get("page_content") or ""
                            docs.append(Document(page_content=text, metadata=meta))
                        return docs

                logger.info(f"Connected to Pinecone index '{config.PINECONE_INDEX_NAME}' via NativePineconeVectorStore")
                return NativePineconeVectorStore(index, embeddings)
        except Exception as e:
            logger.warning(f"Pinecone SDK direct connection attempt: {e}")

    return None
