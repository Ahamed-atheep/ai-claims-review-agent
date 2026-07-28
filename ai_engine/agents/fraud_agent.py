from typing import Dict, Any
from ai_engine.agents.base_agent import BaseAgent
from ai_engine.models.agent_models import FraudAgentOutput
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class FraudAgent(BaseAgent):
    """Fraud Intelligence Agent (domain=fraud)."""

    def __init__(self):
        super().__init__(
            name="Fraud Intelligence Agent",
            domain="fraud",
            prompt_file="fraud.txt"
        )

    async def analyze(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"[{self.name}] Running domain='{self.domain}' retrieval and analysis...")
        
        query = f"{claim_data.get('claim_type', '')} {claim_data.get('extracted_text', '')}"
        context = retrieve_domain_context(domain=self.domain, query=query, top_k=3)
        if not context:
            context = "Standard fraud indicators catalog: Rule FRD-101 timeline discrepancy, FRD-102 duplicate billing."

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

        # Fallback / heuristic safety checks
        score = parsed.get("score", 0)
        flags = parsed.get("flags", [])

        # Check for pre-dated estimate heuristic in extracted text
        extracted = claim_data.get("extracted_text", "").lower()
        if "precedes" in extracted or "pre-dated" in extracted or "dated before" in extracted:
            if "Timeline discrepancy: Estimate date precedes accident date" not in flags:
                flags.append("Timeline discrepancy: Estimate date precedes accident date")
            score = max(score, 75)

        output = FraudAgentOutput(score=score, flags=flags)
        logger.info(f"[{self.name}] Result: score={output.score}, flags={output.flags}")
        return output.model_dump()
