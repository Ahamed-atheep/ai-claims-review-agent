import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any
from ai_engine.services.llm_service import get_llm
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class BaseAgent(ABC):
    """Abstract Base Class for all specialized AI Agents."""

    def __init__(self, name: str, domain: str, prompt_file: str):
        self.name = name
        self.domain = domain
        self.prompt_file = prompt_file
        self.llm = get_llm(temperature=0.2)
        self.prompt_template = self._load_prompt()

    def _load_prompt(self) -> str:
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", self.prompt_file)
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        logger.warning(f"Prompt file {self.prompt_file} not found. Using default fallback prompt.")
        return "Analyze the claim for {domain} anomalies using retrieved context: {context}\nClaim: {extracted_text}"

    @abstractmethod
    async def analyze(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Asynchronously analyzes claim data and returns domain findings dict."""
        pass

    def _parse_json_response(self, text_output: str) -> Dict[str, Any]:
        """Utility to safely extract and parse JSON from LLM text response."""
        try:
            # Strip potential markdown code blocks
            clean_text = text_output.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"[{self.name}] Failed to parse JSON response: {e}. Output was: {text_output}")
            return {}
