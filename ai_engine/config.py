import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "claims-rag-index")
EMBEDDING_MODEL = "models/text-embedding-004"
LLM_MODEL = "gemini-1.5-flash"
