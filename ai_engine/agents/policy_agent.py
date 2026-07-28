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
        logger.info(f"[{self.name}] Running domain='{self.domain}' retrieval and analysis...")
        
        query = f"{claim_data.get('claim_type', '')} {claim_data.get('extracted_text', '')}"
        context = retrieve_domain_context(domain=self.domain, query=query, top_k=3)
        if not context:
            context = "Apex Policy Rules: Max collision coverage $50,000. Standard deductible $500. 30-day reporting window."

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

        status = parsed.get("status", "APPROVED_WITH_CONDITIONS")
        violations = parsed.get("violations", [])

        output = PolicyAgentOutput(status=status, violations=violations)
        logger.info(f"[{self.name}] Result: status={output.status}, violations={output.violations}")
        return output.model_dump()
