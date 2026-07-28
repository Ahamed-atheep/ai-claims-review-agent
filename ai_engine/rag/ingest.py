import os
import sys

# Ensure parent root directory is in sys.path so 'ai_engine' module imports resolve seamlessly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from langchain_core.documents import Document
except Exception:
    from langchain.schema import Document

from ai_engine.rag.vector_store import get_vector_store
from ai_engine.utils.logger import logger

KNOWLEDGE_FILES_MAP: Dict[str, str] = {
    "auto_insurance_policy_master.txt": "policy",
    "insurance_fraud_indicators_master.txt": "fraud",
    "medical_and_auto_repair_benchmarks.txt": "medical",
}

DEFAULT_KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")

def load_and_tag_documents(knowledge_dir: str = DEFAULT_KNOWLEDGE_DIR) -> List[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=100
    )
    documents: List[Document] = []

    if not os.path.exists(knowledge_dir):
        logger.error(f"Knowledge directory not found: {knowledge_dir}")
        return documents

    for filename, domain in KNOWLEDGE_FILES_MAP.items():
        file_path = os.path.join(knowledge_dir, filename)
        if os.path.exists(file_path):
            logger.info(f"Loading and tagging '{filename}' with domain='{domain}'...")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            raw_doc = Document(
                page_content=content,
                metadata={"source": filename, "domain": domain}
            )
            chunks = text_splitter.split_documents([raw_doc])
            for chunk in chunks:
                chunk.metadata["domain"] = domain
            documents.extend(chunks)
            logger.info(f"Generated {len(chunks)} chunks for domain='{domain}'")

    synthetic_entries = [
        Document(
            page_content="EVIDENCE RULES: Police reports are mandatory for claims over $3,000. Tow receipts must match accident timestamp. Photo evidence of vehicle damage must show VIN number.",
            metadata={"source": "evidence_rules.txt", "domain": "evidence"}
        ),
        Document(
            page_content="HISTORICAL FRAUD PATTERNS: High repeat fraud identified at Apex Collision Center and Quick Care Clinic. Repeat claimants filing >3 claims in 12 months trigger automatic SIU referral.",
            metadata={"source": "historical_patterns.txt", "domain": "historical"}
        )
    ]
    for syn_doc in synthetic_entries:
        chunks = text_splitter.split_documents([syn_doc])
        documents.extend(chunks)

    return documents

def ingest_to_pinecone():
    docs = load_and_tag_documents()
    if not docs:
        logger.warning("No documents loaded for ingestion.")
        return False

    vector_store = get_vector_store()
    if not vector_store:
        logger.error("Failed to connect to Pinecone vector store.")
        return False

    logger.info(f"Upserting {len(docs)} domain-tagged chunks into Pinecone...")
    if hasattr(vector_store, "add_documents"):
        vector_store.add_documents(docs)
    logger.info("Successfully completed ingestion to Pinecone!")
    return True

if __name__ == "__main__":
    ingest_to_pinecone()
