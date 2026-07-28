from typing import Dict, Any
from ai_engine.agents.base_agent import BaseAgent
from ai_engine.models.agent_models import EvidenceAgentOutput
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class EvidenceAgent(BaseAgent):
    """Evidence Verification Agent (domain=evidence)."""

    def __init__(self):
        super().__init__(
            name="Evidence Verification Agent",
            domain="evidence",
            prompt_file="evidence.txt"
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
        logger.info("LLM reasoning completed for Evidence Agent")

        parsed = self._parse_json_response(raw_text)

        consistency_score = parsed.get("consistency_score", 70)
        missing_evidence = parsed.get("missing_evidence", [])
        conflicts = parsed.get("conflicts", [])
        reasoning = parsed.get("reasoning", "")

        extracted = claim_data.get("extracted_text", "").lower()
        if "without police report" in extracted or "no police report" in extracted:
            if "Police report missing for damage > $3,000" not in missing_evidence:
                missing_evidence.append("Police report missing for damage > $3,000")

        output = EvidenceAgentOutput(
            consistency_score=consistency_score,
            missing_evidence=missing_evidence,
            conflicts=conflicts,
            reasoning=reasoning
        )

        logger.info("Evidence Agent finished")
        return output.model_dump()
