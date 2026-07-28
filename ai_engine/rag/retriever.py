from ai_engine.rag.vector_store import get_vector_store
from ai_engine.rag.embeddings import get_embeddings
from ai_engine.config import config
from ai_engine.utils.logger import logger

# Fallback in-memory domain knowledge for local testing if Pinecone credentials not configured
FALLBACK_DOMAIN_KNOWLEDGE = {
    "fraud": "Rule FRD-101: Repair estimate or medical invoice dated prior to reported accident date. Rule FRD-102: Duplicate billing and phantom parts. Rule FRD-103: Ghost repair shops.",
    "medical": "Body shop labor rate regional benchmark: $65-$95/hr standard. Over $125/hr flagged as inflated. CPT 99283 ER Visit $350-$750 benchmark, CPT 72125 CT Scan $400-$950.",
    "policy": "Apex Auto Collision Policy: Maximum collision limit $50,000 per incident. Standard deductible $500. Statutory 30-day reporting window. Exclusions: racing, DUI, pre-existing damage.",
    "evidence": "Evidence Requirements: Police report mandatory for claims over $3,000. Tow receipts timestamp must match accident date. Vehicle photos required showing VIN.",
    "historical": "Historical Fraud Database: Flagged high-risk vendors include Apex Collision Center and Quick Care Clinic. Repeat claimants filing >3 claims in 12 months referred to SIU."
}

def retrieve_domain_context(domain: str, query: str, top_k: int = 3) -> str:
    """
    RAG Retrieval Pipeline (Steps 5 to 7 in Architecture Flow):
    1. Embeds claim query text.
    2. Queries Pinecone vector index filtered by metadata domain (`domain=domain`).
    3. Retrieves exact vector chunks and formats context for LLM inference.
    """
    try:
        store = get_vector_store()
        
        # Scenario A: LangChain VectorStore object
        if store and hasattr(store, "similarity_search"):
            docs = store.similarity_search(query, k=top_k, filter={"domain": domain})
            if docs:
                logger.info(f"Retrieved {len(docs)} real chunks from Pinecone for domain='{domain}'")
                return "\n---\n".join([d.page_content for d in docs])

        # Scenario B: Native Pinecone Index object
        elif store and hasattr(store, "query"):
            embeddings = get_embeddings()
            query_vector = embeddings.embed_query(query)
            
            res = store.query(
                vector=query_vector,
                top_k=top_k,
                filter={"domain": domain},
                include_metadata=True
            )
            matches = res.get("matches", []) if hasattr(res, "get") else getattr(res, "matches", [])
            chunks = []
            for match in matches:
                meta = match.get("metadata", {}) if hasattr(match, "get") else getattr(match, "metadata", {})
                text = meta.get("text") or meta.get("content") or meta.get("page_content")
                if text:
                    chunks.append(text)
            
            if chunks:
                logger.info(f"Retrieved {len(chunks)} real vector chunks from Pinecone for domain='{domain}'")
                return "\n---\n".join(chunks)

    except Exception as e:
        logger.warning(f"Pinecone vector search attempt for domain='{domain}': {e}")

    # Heuristic domain knowledge fallback if Pinecone index is empty / unconfigured
    logger.info(f"Using domain knowledge context for domain='{domain}'")
    return FALLBACK_DOMAIN_KNOWLEDGE.get(domain, "Standard policy rules and fraud benchmarks.")
