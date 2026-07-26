/**
 * FULL MOCK DATA — Matches shared API contract exactly.
 * Used when VITE_USE_MOCK=true
 * Allows complete UI development without backend dependency.
 */

export const MOCK_CLAIM_RESPONSE = {
  claim_id: 'CLM-2026-9901',
  overall_risk_score: 78,
  risk_level: 'HIGH',
  fraud_score: 82,
  agent_analysis: {
    fraud_agent: {
      agent_name: 'Fraud Analysis Agent',
      score: 82,
      risk_level: 'HIGH',
      flags: [
        'Duplicate invoice detected — matches claim CLM-2024-5512',
        'Billing inflation 340% above regional average for procedure type',
        'Claimant vehicle registration shows different ZIP code from incident location',
      ],
      findings: [
        {
          category: 'Billing Anomaly',
          severity: 'CRITICAL',
          description: 'Invoice total is 3.4× the average regional rate for equivalent vehicle repairs.',
          evidence_quote: 'Labor: 48 hrs @ $285/hr = $13,680. Regional benchmark: 14 hrs @ $120/hr = $1,680.',
          citation_id: 'DOC-INV-001',
        },
        {
          category: 'Duplicate Claim Pattern',
          severity: 'HIGH',
          description: 'Claim contains identical line items to previously settled claim CLM-2024-5512.',
          evidence_quote: 'Part #AX-4421 "Front Left Suspension Assembly" — exact match with prior claim.',
          citation_id: 'DOC-INV-002',
        },
        {
          category: 'Geographic Inconsistency',
          severity: 'MEDIUM',
          description: 'Vehicle registration address and incident location are 180 miles apart with no travel history.',
          evidence_quote: 'Registration: 4521 Oak St, Reno NV. Reported incident: I-5 Corridor, Sacramento CA.',
          citation_id: 'DOC-POL-001',
        },
      ],
      summary_reasoning:
        'The combination of extreme billing inflation, an exact match to a prior settled claim, and geographic inconsistency indicates a high probability of orchestrated fraud.',
    },
    medical_agent: {
      agent_name: 'Medical Verification Agent',
      score: 67,
      risk_level: 'HIGH',
      flags: [
        'Treatment timeline discrepancy — ER admission 11 days before accident date',
        'ICD-10 code mismatch: whiplash coded as traumatic brain injury',
      ],
      findings: [
        {
          category: 'Timeline Discrepancy',
          severity: 'CRITICAL',
          description: 'Emergency room admission date precedes the reported accident date by 11 days.',
          evidence_quote:
            'ER Admission: 2026-03-04. Reported Accident Date: 2026-03-15. Delta: -11 days.',
          citation_id: 'DOC-MED-001',
        },
        {
          category: 'Diagnosis Code Mismatch',
          severity: 'HIGH',
          description: 'ICD-10 code S09.90 (Traumatic brain injury) claimed for a rear-end collision at <15 mph.',
          evidence_quote:
            'Police report states: "Minor fender-bender, no visible damage, parties declined medical at scene."',
          citation_id: 'DOC-POL-002',
        },
      ],
      summary_reasoning:
        'Medical records show clear temporal impossibilities and diagnosis codes inconsistent with the reported accident severity. Likely pre-existing condition being attributed to this claim.',
    },
    document_agent: {
      agent_name: 'Document Verification Agent',
      score: 71,
      risk_level: 'HIGH',
      flags: [
        'PDF metadata: document creation date 6 weeks post-incident',
        'Font inconsistency on invoice line items (2 distinct fonts detected)',
        'EXIF geotag stripped from damage photographs',
      ],
      findings: [
        {
          category: 'Metadata Tampering',
          severity: 'CRITICAL',
          description: 'Invoice PDF was created 6 weeks after the reported incident date, suggesting fabrication.',
          evidence_quote:
            'PDF Producer: Adobe Acrobat 23.1. CreationDate: D:20260427. Incident date: 2026-03-15.',
          citation_id: 'DOC-INV-001',
        },
        {
          category: 'Font Alteration',
          severity: 'HIGH',
          description: 'Two distinct fonts detected in the invoice body, indicating digital text insertion.',
          evidence_quote:
            'Lines 1-8: Helvetica Neue 9pt. Lines 9-14: Arial 9pt — typical of copy-paste manipulation.',
          citation_id: 'DOC-INV-003',
        },
        {
          category: 'EXIF Data Absent',
          severity: 'MEDIUM',
          description: 'All damage photographs have had GPS and timestamp EXIF data removed.',
          evidence_quote:
            'Photo metadata: Make: SAMSUNG, Model: SM-G998B. GPS: [stripped]. DateTime: [stripped].',
          citation_id: 'DOC-IMG-001',
        },
      ],
      summary_reasoning:
        'Document integrity analysis reveals strong indicators of post-fabrication: metadata timestamps inconsistent with incident timeline, and evidence of digital editing in invoice PDFs.',
    },
    risk_agent: {
      agent_name: 'Risk Assessment Agent',
      score: 58,
      risk_level: 'MEDIUM',
      flags: [
        'High-value claim: $15,500 is 94th percentile for this claim type',
        'Claimant has 3 prior claims in 36 months',
      ],
      findings: [
        {
          category: 'Claim Frequency',
          severity: 'HIGH',
          description: 'Claimant John Doe has filed 3 claims in the past 36 months, placing them in the top 5% of frequency.',
          evidence_quote: 'Policy POL-88321 history: CLM-2023-2210 ($4,200), CLM-2024-5512 ($8,750), CLM-2026-9901 ($15,500).',
          citation_id: 'DOC-POL-001',
        },
        {
          category: 'Amount Escalation',
          severity: 'MEDIUM',
          description: 'Claimed amounts have escalated 269% across 3 consecutive claims.',
          evidence_quote: 'Escalation pattern: $4,200 → $8,750 → $15,500. Annualized growth: ~93% per claim.',
          citation_id: 'DOC-POL-002',
        },
      ],
      summary_reasoning:
        'Risk profile is elevated due to high claim frequency, escalating amounts, and statistical positioning in the top 5th percentile of the claimant population.',
    },
    compliance_agent: {
      agent_name: 'Compliance Agent',
      score: 34,
      risk_level: 'LOW',
      status: 'APPROVED_WITH_CONDITIONS',
      flags: [
        'Policy section 8.3.2 requires independent appraisal for claims > $10,000 — not yet completed',
      ],
      findings: [
        {
          category: 'Procedural Gap',
          severity: 'MEDIUM',
          description: 'Per Policy Section 8.3.2, an independent third-party appraisal is mandatory for claims exceeding $10,000. This has not been submitted.',
          evidence_quote: 'Policy POL-88321 §8.3.2: "Claims exceeding $10,000 USD require independent appraiser certification within 30 days of filing."',
          citation_id: 'DOC-POL-003',
        },
      ],
      summary_reasoning:
        'The claim is conditionally approvable from a compliance standpoint, pending receipt of the mandatory independent appraisal per policy section 8.3.2.',
    },
  },
  key_evidence: [
    'Repair estimate timestamp precedes incident date by 2 days.',
    'Medical bill software metadata shows creation date 6 weeks post-incident.',
    'Claimed vehicle damage inconsistent with reported collision speed of <15 mph.',
    'Invoice line items are identical to previously settled claim CLM-2024-5512.',
    'Emergency room admission 11 days before reported accident date.',
  ],
  investigator_questions: [
    'Can claimant provide verified tow receipts from the incident date (2026-03-15) showing GPS dispatch log?',
    'Please supply the original unedited repair shop invoice file directly from the mechanic — not a scan or re-print.',
    'Obtain treating physician\'s original handwritten notes from ER admission on 2026-03-04.',
    'Request body-worn camera footage from the responding officer at the incident scene.',
    'Cross-reference part #AX-4421 "Front Left Suspension Assembly" purchase date with vehicle service history.',
  ],
  final_recommendation: 'REFER TO SPECIAL INVESTIGATION UNIT (SIU)',
}

/** Mock SSE progress steps for development testing */
export const MOCK_SSE_STEPS = [
  { step: 'OCR_COMPLETE', progress: 20, message: 'Text extracted from 4 pages (2 OCR fallbacks)' },
  { step: 'RAG_RETRIEVAL', progress: 40, message: 'Policy context retrieved — 12 relevant sections found' },
  { step: 'AGENTS_RUNNING', progress: 60, message: '5 agents processing in parallel — Fraud, Medical, Document, Risk, Compliance' },
  { step: 'SYNTHESIS', progress: 80, message: 'Decision synthesis in progress — aggregating findings...' },
  { step: 'COMPLETED', progress: 100, message: 'Analysis complete — report ready' },
]

/** Mock upload response */
export const MOCK_UPLOAD_RESPONSE = {
  claim_id: 'CLM-2026-9901',
  status: 'PROCESSING',
  stream_url: '/api/v1/claims/CLM-2026-9901/stream',
}
