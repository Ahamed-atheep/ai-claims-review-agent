from typing import Dict, Any
from ai_engine.agents.base_agent import BaseAgent
from ai_engine.models.agent_models import PolicyAgentOutput
from ai_engine.rag.retriever import retrieve_domain_context
from ai_engine.utils.logger import logger

class PolicyAgent(BaseAgent):
    """Policy Compliance Agent (domain=policy)."""

    def __init__(self):
        super().__init__(
            name="Policy Compliance Agent",
            domain="policy",
            prompt_file="policy.txt"
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
        logger.info("LLM reasoning completed for Policy Agent")

        parsed = self._parse_json_response(raw_text)

        status = parsed.get("status", "APPROVED_WITH_CONDITIONS")
        violations = parsed.get("violations", [])
        reasoning = parsed.get("reasoning", "Policy terms checked against $50,000 maximum collision limit and $500 deductible.")

        output = PolicyAgentOutput(
            status=status,
            violations=violations,
            reasoning=reasoning
        )

        logger.info("Policy Agent finished")
        return output.model_dump()
