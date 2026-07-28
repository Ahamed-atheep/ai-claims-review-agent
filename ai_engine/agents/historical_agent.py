from typing import Dict, Any
from ai_engine.agents.base_agent import BaseAgent
from ai_engine.models.agent_models import HistoricalAgentOutput
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class HistoricalAgent(BaseAgent):
    """Historical Intelligence Agent (domain=historical)."""

    def __init__(self):
        super().__init__(
            name="Historical Intelligence Agent",
            domain="historical",
            prompt_file="historical.txt"
        )

    async def analyze(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Running domain='{self.domain}' retrieval and analysis...")
        
        query = f"{claim_data.get('claim_type', '')} {claim_data.get('extracted_text', '')}"
        context = retrieve_domain_context(domain=self.domain, query=query, top_k=3)
        if not context:
            context = "Historical Fraud Database: Repeat claimant patterns, flagged garages and clinics."

        prompt_str = self.prompt_template.format(
            context=context,
            claim_id=claim_data.get("claim_id", ""),
            policy_number=claim_data.get("policy_number", ""),
            claimant_name=claim_data.get("claimant_name", ""),
            claim_amount=claim_data.get("claim_amount", 0.0),
            claim_type=claim_data.get("claim_type", ""),
            extracted_text=claim_data.get("extracted_text", "")
        )

        response = await self.llm.ainvoke(prompt_str)
        raw_text = response.content if hasattr(response, "content") else str(response)
        parsed = self._parse_json_response(raw_text)

        similarity_score = parsed.get("similarity_score", 45)
        matched_patterns = parsed.get("matched_patterns", [])

        output = HistoricalAgentOutput(
            similarity_score=similarity_score,
            matched_patterns=matched_patterns
        )
        logger.info(f"[{self.name}] Result: similarity_score={output.similarity_score}")
        return output.model_dump()
