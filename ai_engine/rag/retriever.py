import os
import glob
from ai_engine.config import GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME, EMBEDDING_MODEL

class KnowledgeRetriever:
    def __init__(self):
        self.knowledge_dir = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")

    def retrieve(self, query: str, top_k: int = 4) -> str:
        if PINECONE_API_KEY and GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                from pinecone import Pinecone
                
                genai.configure(api_key=GEMINI_API_KEY)
                pc = Pinecone(api_key=PINECONE_API_KEY)
                index = pc.Index(PINECONE_INDEX_NAME)

                emb = genai.embed_content(
                    model=EMBEDDING_MODEL,
                    content=query,
                    task_type="retrieval_query"
                )["embedding"]

                res = index.query(vector=emb, top_k=top_k, include_metadata=True)
                contexts = [match["metadata"]["text"] for match in res["matches"] if "text" in match.get("metadata", {})]
                if contexts:
                    return "\n---\n".join(contexts)
            except Exception as e:
                print(f"[Retriever Warning] Vector DB query error, using local fallback: {e}")

        matches = []
        files = glob.glob(os.path.join(self.knowledge_dir, "*.txt"))
        query_words = set(query.lower().split())

        for file_path in files:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                for line in lines:
                    if line.strip() and any(word in line.lower() for word in query_words if len(word) > 3):
                        matches.append(line.strip())

        if matches:
            return "\n".join(matches[:top_k * 3])
        
        return "Standard policy limit applies ($50,000 max). Claims with date inconsistencies or inflated bills trigger mandatory fraud investigation."

if __name__ == "__main__":
    retriever = KnowledgeRetriever()
    result = retriever.retrieve("Auto collision repair estimate timestamp discrepancy")
    print("--- Retrieved Context ---")
    print(result)
