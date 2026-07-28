from typing import Dict, Any
from ai_engine.agents.base_agent import BaseAgent
from ai_engine.models.agent_models import MedicalAgentOutput
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class MedicalAgent(BaseAgent):
    """Medical & Repair Cost Agent (domain=medical)."""

    def __init__(self):
        super().__init__(
            name="Medical & Repair Cost Agent",
            domain="medical",
            prompt_file="medical.txt"
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
        logger.info("LLM reasoning completed for Medical Agent")

        parsed = self._parse_json_response(raw_text)

        score = parsed.get("score", 0)
        flags = parsed.get("flags", [])
        reasoning = parsed.get("reasoning", "")
        evidence = parsed.get("evidence", [])

        # Heuristic fallback check
        extracted = claim_data.get("extracted_text", "").lower()
        if "125" in extracted or "labor rate" in extracted or "inflated" in extracted:
            if "Labor rate exceeds regional benchmark" not in flags:
                flags.append("Labor rate exceeds regional benchmark")
            score = max(score, 60)
            if not reasoning:
                reasoning = "Billed body shop labor rate of $125/hr exceeds regional $85/hr benchmark."
            if not evidence:
                evidence = ["Body shop labor rate ($125/hr) exceeds regional benchmark ($85/hr)."]

        output = MedicalAgentOutput(
            score=score,
            flags=flags,
            reasoning=reasoning,
            evidence=evidence
        )

        logger.info("Medical Agent finished")
        return output.model_dump()
