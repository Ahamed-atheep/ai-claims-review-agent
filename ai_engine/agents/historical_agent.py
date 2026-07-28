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
        logger.info("LLM reasoning completed for Historical Agent")

        parsed = self._parse_json_response(raw_text)

        similarity_score = parsed.get("similarity_score", 45)
        matched_patterns = parsed.get("matched_patterns", [])
        reasoning = parsed.get("reasoning", "")

        output = HistoricalAgentOutput(
            similarity_score=similarity_score,
            matched_patterns=matched_patterns,
            reasoning=reasoning
        )

        logger.info("Historical Agent finished")
        return output.model_dump()
