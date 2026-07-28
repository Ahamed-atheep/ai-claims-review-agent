from ai_engine.rag.vector_store import get_vector_store
from ai_engine.utils.logger import logger

# Fallback in-memory domain knowledge for local testing/dev
FALLBACK_DOMAIN_KNOWLEDGE = {
    "fraud": "Rule FRD-101: Repair estimate or medical invoice dated prior to reported accident date. Rule FRD-102: Duplicate billing and phantom parts. Rule FRD-103: Ghost repair shops.",
    "medical": "Body shop labor rate regional benchmark: $65-$95/hr standard. Over $125/hr flagged as inflated. CPT 99283 ER Visit $350-$750 benchmark, CPT 72125 CT Scan $400-$950.",
    "policy": "Apex Auto Collision Policy: Maximum collision limit $50,000 per incident. Standard deductible $500. Statutory 30-day reporting window. Exclusions: racing, DUI, pre-existing damage.",
    "evidence": "Evidence Requirements: Police report mandatory for claims over $3,000. Tow receipts timestamp must match accident date. Vehicle photos required showing VIN.",
    "historical": "Historical Fraud Database: Flagged high-risk vendors include Apex Collision Center and Quick Care Clinic. Repeat claimants filing >3 claims in 12 months referred to SIU."
}

def get_domain_retriever(domain: str, top_k: int = 3):
    """Returns a retriever configured with metadata domain filtering."""
    try:
        vector_store = get_vector_store()
        if not vector_store:
            return None
        return vector_store.as_retriever(
            search_kwargs={"k": top_k, "filter": {"domain": domain}}
        )
    except Exception as e:
        logger.warning(f"Unable to connect vector store retriever for domain='{domain}': {e}")
        return None

def retrieve_domain_context(domain: str, query: str, top_k: int = 3) -> str:
    """
    Step 5-7 of RAG Flow: Embeds query, retrieves domain-tagged vector chunks from Pinecone, 
    and returns context text to be combined with System Prompt for LLM inference.
    """
    try:
        vector_store = get_vector_store()
        if vector_store:
            docs = vector_store.similarity_search(query, k=top_k, filter={"domain": domain})
            if docs:
                logger.info(f"Retrieved {len(docs)} chunks from Pinecone for domain='{domain}'")
                return "\n---\n".join([d.page_content for d in docs])
    except Exception as e:
        logger.warning(f"Pinecone search error for domain='{domain}': {e}")

    # Fallback knowledge return matching RAG step 7
    logger.info(f"Using domain knowledge fallback for domain='{domain}'")
    return FALLBACK_DOMAIN_KNOWLEDGE.get(domain, "Standard policy rules and fraud benchmarks.")
