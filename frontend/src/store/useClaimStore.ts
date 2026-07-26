import { create } from 'zustand'

// ─── Types — Exact LLD Schema ────────────────────────────────────────
export interface Finding {
  category: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  evidence_quote: string
  citation_id?: string
}

export interface AgentResult {
  agent_name: string
  risk_score: number
  risk_level: string
  findings: Finding[]
  summary_reasoning: string
  // Extended fields from shared API contract
  flags?: string[]
  status?: string
  score?: number
}

export interface ClaimReport {
  claim_id: string
  overall_risk_score: number
  overall_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommended_action: 'APPROVE' | 'REJECT' | 'ESCALATE_TO_INVESTIGATOR'
  executive_summary: string
  agents: Record<string, AgentResult>
  investigator_questions: string[]
  // From shared API contract
  risk_level?: string
  fraud_score?: number
  agent_analysis?: Record<string, {
    flags?: string[]
    score?: number
    status?: string
    findings?: Finding[]
    summary_reasoning?: string
    agent_name?: string
    risk_level?: string
  }>
  key_evidence?: string[]
  final_recommendation?: string
}

export interface SSEProgressEvent {
  step: 'OCR_COMPLETE' | 'RAG_RETRIEVAL' | 'AGENTS_RUNNING' | 'SYNTHESIS' | 'COMPLETED' | 'FAILED'
  progress: number
  message: string
}

export interface ClaimFormData {
  claimNumber: string
  policyNumber: string
  claimantName: string
  claimAmount: number
  claimType: string
  file: File | null
}

// ─── Store State Interface ───────────────────────────────────────────
interface ClaimStoreState {
  // Current claim being processed
  currentClaimId: string | null
  currentClaimForm: ClaimFormData | null
  uploadedFile: File | null
  localPdfUrl: string | null

  // SSE Processing state
  processingProgress: number
  currentStepMessage: string
  currentStep: string
  isProcessing: boolean
  processingSteps: SSEProgressEvent[]

  // Results
  report: ClaimReport | null
  rawResponse: Record<string, unknown> | null

  // UI interaction state
  selectedCitation: string | null
  activeTab: string
  isSidebarOpen: boolean
  hasSeenIntro: boolean

  // ─── Actions ──────────────────────────────────────────────────────
  setCurrentClaimId: (id: string | null) => void
  setClaimForm: (form: ClaimFormData) => void
  setUploadedFile: (file: File | null) => void
  setLocalPdfUrl: (url: string | null) => void

  setProcessingState: (progress: number, message: string, step?: string) => void
  addProcessingStep: (event: SSEProgressEvent) => void
  setIsProcessing: (val: boolean) => void

  setReport: (report: ClaimReport, raw?: Record<string, unknown>) => void
  clearReport: () => void

  setSelectedCitation: (citationId: string | null) => void
  setActiveTab: (tab: string) => void
  toggleSidebar: () => void
  setHasSeenIntro: (hasSeen: boolean) => void

  reset: () => void
}

// ─── Initial State ───────────────────────────────────────────────────
const INITIAL_STATE = {
  currentClaimId: null,
  currentClaimForm: null,
  uploadedFile: null,
  localPdfUrl: null,
  processingProgress: 0,
  currentStepMessage: '',
  currentStep: '',
  isProcessing: false,
  processingSteps: [],
  report: null,
  rawResponse: null,
  selectedCitation: null,
  activeTab: 'overview',
  isSidebarOpen: true,
  hasSeenIntro: false,
}

// ─── Store ────────────────────────────────────────────────────────────
export const useClaimStore = create<ClaimStoreState>((set) => ({
  ...INITIAL_STATE,

  setCurrentClaimId: (id) => set({ currentClaimId: id }),

  setClaimForm: (form) => set({ currentClaimForm: form }),

  setUploadedFile: (file) => set({
    uploadedFile: file,
    localPdfUrl: file ? URL.createObjectURL(file) : null,
  }),

  setLocalPdfUrl: (url) => set({ localPdfUrl: url }),

  setProcessingState: (progress, message, step) =>
    set({
      processingProgress: progress,
      currentStepMessage: message,
      currentStep: step || '',
    }),

  addProcessingStep: (event) =>
    set((state) => ({
      processingSteps: [...state.processingSteps, event],
      processingProgress: event.progress,
      currentStepMessage: event.message,
      currentStep: event.step,
    })),

  setIsProcessing: (val) => set({ isProcessing: val }),

  setReport: (report, raw) => set({
    report,
    rawResponse: raw || null,
    isProcessing: false,
    processingProgress: 100,
  }),

  clearReport: () => set({ report: null, rawResponse: null }),

  setSelectedCitation: (citationId) => set({ selectedCitation: citationId }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  reset: () => set({
    ...INITIAL_STATE,
    processingSteps: [],
  }),

  setHasSeenIntro: (hasSeen) => set({ hasSeenIntro: hasSeen }),
}))
