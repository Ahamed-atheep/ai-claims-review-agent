import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Central configuration for AI Engine."""
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    
    # Pinecone Vector DB (Configured for 3072 dimensions)
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "insurance-knowledge-base")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
    VECTOR_DIMENSION: int = int(os.getenv("VECTOR_DIMENSION", "3072"))
    
    # Models
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "llama-3.3-70b-versatile")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")
    
    # Server Config
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

config = Config()
