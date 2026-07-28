from typing import List
from langchain.docstore.document import Document
from ai_engine.rag.vector_store import get_vector_store
from ai_engine.utils.logger import logger

def retrieve_domain_documents(domain: str, query: str, top_k: int = 5) -> List[Document]:
    """
    RAG Retriever Function:
    - Uses PineconeVectorStore.
    - Applies metadata filter: {'domain': domain}.
    - Performs similarity search with Top K = 5.
    - Returns LangChain Documents.
    """
    logger.info(f"Metadata filter domain={domain}")
    try:
        vector_store = get_vector_store()
        if vector_store:
            docs = vector_store.similarity_search(
                query,
                k=top_k,
                filter={"domain": domain}
            )
            if docs:
                logger.info(f"Retrieved {len(docs)} chunks from Pinecone for domain={domain}")
                return docs
            else:
                logger.info(f"Retrieved 0 chunks from Pinecone for domain={domain}")
                return []
    except Exception as e:
        logger.error(f"Pinecone similarity search error for domain={domain}: {e}")
        return []

    return []

def retrieve_domain_context(domain: str, query: str, top_k: int = 5) -> str:
    """Helper returning formatted string context from retrieved domain documents."""
    docs = retrieve_domain_documents(domain=domain, query=query, top_k=top_k)
    if docs:
        return "\n---\n".join([doc.page_content for doc in docs])
    return "No matching domain documents found in Pinecone."
