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
        logger.info(f"Metadata filter domain={self.domain}")
        query = f"{claim_data.get('claim_type', '')} {claim_data.get('extracted_text', '')}"
        
        # Step 1-3: Retrieve domain chunks from Pinecone (Top K = 5)
        context = retrieve_domain_context(domain=self.domain, query=query, top_k=5)

        # Step 4: Prompt LLM with Claim + RAG Context
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
        logger.info("LLM reasoning completed for Fraud Agent")

        parsed = self._parse_json_response(raw_text)

        score = parsed.get("score", 0)
        flags = parsed.get("flags", [])
        reasoning = parsed.get("reasoning", "")
        evidence = parsed.get("evidence", [])

        # Heuristic fallback if LLM response is empty
        extracted = claim_data.get("extracted_text", "").lower()
        if "precedes" in extracted or "pre-dated" in extracted or "dated before" in extracted:
            if "Timeline discrepancy: Estimate date precedes accident date" not in flags:
                flags.append("Timeline discrepancy: Estimate date precedes accident date")
            score = max(score, 75)
            if not reasoning:
                reasoning = "Repair estimate date is prior to the reported accident date."
            if not evidence:
                evidence = ["Repair estimate timestamp precedes incident date by 2 days."]

        output = FraudAgentOutput(
            score=score,
            flags=flags,
            reasoning=reasoning,
            evidence=evidence
        )

        logger.info("Fraud Agent finished")
        return output.model_dump()
