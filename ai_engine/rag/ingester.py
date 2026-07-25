import os
import glob
from ai_engine.config import GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME, EMBEDDING_MODEL

class KnowledgeIngester:
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
                documents.append({"filename": filename, "text": content})
        return documents

    def chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 100):
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
                    "text": chunk
                })
        
        if PINECONE_API_KEY and GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                from pinecone import Pinecone, ServerlessSpec
                
                genai.configure(api_key=GEMINI_API_KEY)
                pc = Pinecone(api_key=PINECONE_API_KEY)

                if PINECONE_INDEX_NAME not in pc.list_indexes().names():
                    pc.create_index(
                        name=PINECONE_INDEX_NAME,
                        dimension=768,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                index = pc.Index(PINECONE_INDEX_NAME)

                vectors = []
                for item in all_chunks:
                    emb = genai.embed_content(
                        model=EMBEDDING_MODEL,
                        content=item["text"],
                        task_type="retrieval_document"
                    )["embedding"]
                    vectors.append({
                        "id": item["id"],
                        "values": emb,
                        "metadata": {"source": item["source"], "text": item["text"]}
                    })
                index.upsert(vectors=vectors)
                print(f"[Ingester] Ingested {len(vectors)} chunks into Pinecone index '{PINECONE_INDEX_NAME}'.")
            except Exception as e:
                print(f"[Ingester Warning] Pinecone ingestion fallback: {e}")
        else:
            print(f"[Ingester] Prepared {len(all_chunks)} chunks for Local Knowledge Store.")

        return all_chunks

if __name__ == "__main__":
    ingester = KnowledgeIngester()
    ingester.ingest()
