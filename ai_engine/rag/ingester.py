import os
import sys
import glob

# Ensure parent root directory is in sys.path so 'ai_engine' imports resolve seamlessly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai_engine.config import config
from ai_engine.utils.logger import logger

DOMAIN_MAP = {
    "auto_insurance_policy_master.txt": "policy",
    "auto_policy_apex.txt": "policy",
    "insurance_fraud_indicators_master.txt": "fraud",
    "fraud_rules_catalog.txt": "fraud",
    "medical_and_auto_repair_benchmarks.txt": "medical",
    "medical_benchmarks.txt": "medical",
    "evidence_rules_master.txt": "evidence",
    "historical_fraud_patterns_master.txt": "historical"
}

class KnowledgeIngester:
    """
    KnowledgeIngester class for scanning, chunking, domain-tagging,
    and ingesting documents into Pinecone vector index.
    """
    def __init__(self, knowledge_dir: str = None):
        if knowledge_dir is None:
            knowledge_dir = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")
        self.knowledge_dir = knowledge_dir

    def load_documents(self):
        documents = []
        files = glob.glob(os.path.join(self.knowledge_dir, "*.txt"))
        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                filename = os.path.basename(file_path)
                domain = DOMAIN_MAP.get(filename, "general")
                documents.append({"filename": filename, "domain": domain, "text": content})
        return documents

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 80):
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    def ingest(self):
        raw_docs = self.load_documents()
        all_chunks = []
        for doc in raw_docs:
            chunks = self.chunk_text(doc["text"])
            for idx, chunk in enumerate(chunks):
                all_chunks.append({
                    "id": f"{doc['filename']}_{idx}",
                    "source": doc["filename"],
                    "domain": doc["domain"],
                    "text": chunk
                })
        
        logger.info(f"[Ingester] Prepared {len(all_chunks)} domain-tagged chunks across {len(raw_docs)} files.")

        if config.PINECONE_API_KEY and config.GEMINI_API_KEY and config.PINECONE_API_KEY != "your_pinecone_api_key_here":
            try:
                import google.generativeai as genai
                from pinecone import Pinecone, ServerlessSpec
                
                genai.configure(api_key=config.GEMINI_API_KEY)
                pc = Pinecone(api_key=config.PINECONE_API_KEY)

                if config.PINECONE_INDEX_NAME not in [idx.name for idx in pc.list_indexes()]:
                    logger.info(f"Creating Pinecone index '{config.PINECONE_INDEX_NAME}'...")
                    pc.create_index(
                        name=config.PINECONE_INDEX_NAME,
                        dimension=config.VECTOR_DIMENSION or 3072,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                index = pc.Index(config.PINECONE_INDEX_NAME)

                vectors = []
                for item in all_chunks:
                    emb = genai.embed_content(
                        model=config.EMBEDDING_MODEL or "models/text-embedding-004",
                        content=item["text"],
                        task_type="retrieval_document"
                    )["embedding"]
                    vectors.append({
                        "id": item["id"],
                        "values": emb,
                        "metadata": {
                            "source": item["source"],
                            "domain": item["domain"],
                            "text": item["text"]
                        }
                    })
                index.upsert(vectors=vectors)
                logger.info(f"[Ingester] Ingested {len(vectors)} chunks into Pinecone index '{config.PINECONE_INDEX_NAME}'.")
            except Exception as e:
                logger.warning(f"[Ingester Warning] Pinecone ingestion fallback: {e}")
        else:
            logger.info(f"[Ingester] Prepared {len(all_chunks)} chunks for Knowledge Base.")

        return all_chunks

if __name__ == "__main__":
    ingester = KnowledgeIngester()
    ingester.ingest()
