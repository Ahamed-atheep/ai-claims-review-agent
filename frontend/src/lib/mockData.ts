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

export const SAMPLE_CLAIMS = [
  {
    claim_id: 'CLM-2026-9901',
    claimant_name: 'John Doe',
    policy_number: 'POL-88321',
    claim_type: 'Auto Collision',
    claimed_amount: 15500,
    submitted_date: '2026-07-26',
    overall_risk_score: 78,
    risk_level: 'HIGH',
    fraud_score: 82,
    final_recommendation: 'REFER TO SPECIAL INVESTIGATION UNIT (SIU)',
    report: MOCK_CLAIM_RESPONSE,
  },
  {
    claim_id: 'CLM-2026-7749',
    claimant_name: 'Apex Logistics Inc.',
    policy_number: 'POL-90112',
    claim_type: 'Commercial Property',
    claimed_amount: 84200,
    submitted_date: '2026-07-27',
    overall_risk_score: 92,
    risk_level: 'CRITICAL',
    fraud_score: 94,
    final_recommendation: 'REJECT CLAIM & ESCALATE TO SIU',
    report: {
      claim_id: 'CLM-2026-7749',
      overall_risk_score: 92,
      risk_level: 'CRITICAL',
      fraud_score: 94,
      agent_analysis: {
        fraud_agent: {
          score: 94,
          flags: [
            'Multiple duplicate invoices submitted across 3 subsidiaries',
            'Altered repair completion timestamps on digital PDF headers',
            'Vendor tax ID registration revoked in 2024'
          ]
        },
        medical_agent: {
          score: 45,
          flags: [
            'Worker injury reports conflict with on-site CCTV timestamp'
          ]
        },
        compliance_agent: {
          status: 'DENIED'
        }
      },
      key_evidence: [
        'PDF metadata indicates document modified in Adobe Acrobat 2 hours prior to submission.',
        'Invoiced equipment replacement cost $45,000 exceeds policy limit of $25,000.',
        'Tax ID mismatch on contractor invoice'
      ],
      investigator_questions: [
        'Can insured provide original signed bills of lading for damaged cargo?',
        'Why do digital PDF timestamps differ from claimed date of flood damage?',
        'Has insured filed prior claims under registered subsidiary tax IDs?'
      ],
      final_recommendation: 'REJECT CLAIM & ESCALATE TO SIU'
    }
  },
  {
    claim_id: 'CLM-2026-4102',
    claimant_name: 'Sarah Jenkins',
    policy_number: 'POL-44109',
    claim_type: 'Medical / Health',
    claimed_amount: 4200,
    submitted_date: '2026-07-25',
    overall_risk_score: 24,
    risk_level: 'LOW',
    fraud_score: 15,
    final_recommendation: 'FAST-TRACK APPROVAL',
    report: {
      claim_id: 'CLM-2026-4102',
      overall_risk_score: 24,
      risk_level: 'LOW',
      fraud_score: 15,
      agent_analysis: {
        fraud_agent: {
          score: 15,
          flags: []
        },
        medical_agent: {
          score: 20,
          flags: ['Procedure codes match diagnostic notes']
        },
        compliance_agent: {
          status: 'APPROVED'
        }
      },
      key_evidence: [
        'Hospital records verified via EHR integration.',
        'All treatment codes standard for minor outpatient procedure.'
      ],
      investigator_questions: [
        'Verify co-pay receipt provided by claimant.'
      ],
      final_recommendation: 'FAST-TRACK APPROVAL'
    }
  },
  {
    claim_id: 'CLM-2026-3891',
    claimant_name: 'Robert Martinez',
    policy_number: 'POL-33290',
    claim_type: 'Workers Compensation',
    claimed_amount: 12800,
    submitted_date: '2026-07-24',
    overall_risk_score: 52,
    risk_level: 'MEDIUM',
    fraud_score: 48,
    final_recommendation: 'APPROVE WITH CONDITIONS (REQUEST AUDIT)',
    report: {
      claim_id: 'CLM-2026-3891',
      overall_risk_score: 52,
      risk_level: 'MEDIUM',
      fraud_score: 48,
      agent_analysis: {
        fraud_agent: {
          score: 48,
          flags: ['Claim filed 45 days after alleged workplace incident']
        },
        medical_agent: {
          score: 55,
          flags: ['Physical therapy sessions slightly above median frequency']
        },
        compliance_agent: {
          status: 'APPROVED_WITH_CONDITIONS'
        }
      },
      key_evidence: [
        'Incident report confirmed by supervisor 3 days post-event.',
        'Medical treatment timeline aligns with physician notes.'
      ],
      investigator_questions: [
        'Why was formal claim submission delayed by 45 days?',
        'Can attending physician provide update on return-to-work timeline?'
      ],
      final_recommendation: 'APPROVE WITH CONDITIONS (REQUEST AUDIT)'
    }
  }
]

