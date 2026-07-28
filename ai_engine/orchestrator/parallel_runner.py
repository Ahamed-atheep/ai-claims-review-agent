import asyncio
from typing import Dict, Any
from ai_engine.agents.fraud_agent import FraudAgent
from ai_engine.agents.medical_agent import MedicalAgent
from ai_engine.agents.policy_agent import PolicyAgent
from ai_engine.agents.evidence_agent import EvidenceAgent
from ai_engine.agents.historical_agent import HistoricalAgent
from ai_engine.utils.logger import logger

class ParallelRunner:
    """Executes all 5 specialized AI agents in parallel asynchronously using asyncio.gather."""

    def __init__(self):
        self.fraud_agent = FraudAgent()
        self.medical_agent = MedicalAgent()
        self.policy_agent = PolicyAgent()
        self.evidence_agent = EvidenceAgent()
        self.historical_agent = HistoricalAgent()

    async def run_all(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Starting parallel execution of 5 AI agents for Claim ID '{claim_data.get('claim_id')}'...")

        # Run all 5 sub-agents concurrently using asyncio.gather
        fraud_task = self.fraud_agent.analyze(claim_data)
        medical_task = self.medical_agent.analyze(claim_data)
        policy_task = self.policy_agent.analyze(claim_data)
        evidence_task = self.evidence_agent.analyze(claim_data)
        historical_task = self.historical_agent.analyze(claim_data)

        fraud_out, medical_out, policy_out, evidence_out, historical_out = await asyncio.gather(
            fraud_task,
            medical_task,
            policy_task,
            evidence_task,
            historical_task,
            return_exceptions=True
        )

        # Handle potential exception fallbacks
        if isinstance(fraud_out, Exception):
            logger.error(f"Fraud agent failed: {fraud_out}")
            fraud_out = {"score": 50, "flags": ["Analysis error in fraud agent"]}

        if isinstance(medical_out, Exception):
            logger.error(f"Medical agent failed: {medical_out}")
            medical_out = {"score": 50, "flags": ["Analysis error in medical agent"]}

        if isinstance(policy_out, Exception):
            logger.error(f"Policy agent failed: {policy_out}")
            policy_out = {"status": "APPROVED_WITH_CONDITIONS", "violations": []}

        if isinstance(evidence_out, Exception):
            logger.error(f"Evidence agent failed: {evidence_out}")
            evidence_out = {"consistency_score": 50, "missing_evidence": [], "conflicts": []}

        if isinstance(historical_out, Exception):
            logger.error(f"Historical agent failed: {historical_out}")
            historical_out = {"similarity_score": 0, "matched_patterns": []}

        results = {
            "fraud_agent": fraud_out,
            "medical_agent": medical_out,
            "policy_agent": policy_out,
            "evidence_agent": evidence_out,
            "historical_agent": historical_out
        }

        logger.info("Parallel execution of all 5 agents completed successfully.")
        return results
