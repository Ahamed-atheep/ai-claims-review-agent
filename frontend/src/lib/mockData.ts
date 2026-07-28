/**
 * FULL MOCK DATA — Matches exact latest Backend & AI Engine API contract.
 */

export const MOCK_CLAIM_RESPONSE = {
  claim_id: 'CLM-2026-9901',
  overall_risk_score: 78,
  risk_level: 'HIGH',
  fraud_score: 82,
  agent_analysis: {
    fraud_agent: {
      score: 82,
      flags: [
        'Duplicate invoice',
        'Billing inflation 340% above regional average for procedure type',
        'Claimant vehicle registration shows different ZIP code from incident location'
      ]
    },
    medical_agent: {
      score: 60,
      flags: [
        'Timeline discrepancy: ER admission precedes accident date',
        'ICD-10 diagnosis code mismatch'
      ]
    },
    compliance_agent: {
      status: 'APPROVED_WITH_CONDITIONS'
    }
  },
  key_evidence: [
    'Repair estimate timestamp precedes incident date by 2 days.',
    'Body shop labor rate ($125/hr) exceeds regional benchmark ($85/hr).',
    'Police report missing for damage > $3,000'
  ],
  investigator_questions: [
    'Can claimant provide verified tow receipts?',
    'Why was repair estimate prepared prior to accident date?',
    'Can claimant provide verified repair photos showing VIN?'
  ],
  final_recommendation: 'REFER TO SPECIAL INVESTIGATION UNIT (SIU)'
}

export const MOCK_UPLOAD_RESPONSE = {
  claim_id: 'CLM-2026-9901',
  status: 'PROCESSING',
  stream_url: 'http://localhost:8000/api/v1/claims/CLM-2026-9901/stream',
}

export const MOCK_SSE_STEPS = [
  {
    step: 'OCR_COMPLETE',
    progress: 20,
    message: '📄 Document OCR & Text Extraction Complete (PyMuPDF)',
  },
  {
    step: 'RAG_RETRIEVAL',
    progress: 45,
    message: '🔍 Querying Pinecone Vector Index (Top K=5, domain metadata filtering)',
  },
  {
    step: 'AGENTS_RUNNING',
    progress: 75,
    message: '🤖 Running 5 Parallel AI Agents via asyncio.gather()...',
  },
  {
    step: 'SYNTHESIS',
    progress: 90,
    message: '⚖️ Master Synthesis Agent generating Risk Scorecard & SIU recommendation...',
  },
  {
    step: 'COMPLETED',
    progress: 100,
    message: '✅ Analysis Complete! Rendering Risk Dashboard.',
  },
]
