import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, ArrowLeft, Copy, ClipboardCheck,
  ShieldAlert, TrendingUp, Zap, FolderOpen, Upload
} from 'lucide-react'
import { useClaimStore } from '@/store/useClaimStore'
import { CitationPdfViewer } from '@/components/dashboard/CitationPdfViewer'
import { RiskRadarChart } from '@/components/dashboard/RiskRadarChart'
import { OverallScoreGauge } from '@/components/dashboard/OverallScoreGauge'
import { AgentAccordionCard } from '@/components/dashboard/AgentAccordionCard'
import { RedFlagsList } from '@/components/dashboard/RedFlagsList'
import { ReportExportPDF } from '@/components/report/ReportExportPDF'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'
import { cn, getRecommendationDisplay } from '@/lib/utils'
import { DropzoneUpload } from '@/components/upload/DropzoneUpload'
import { ProcessingProgressModal } from '@/components/upload/ProcessingProgressModal'
import { SAMPLE_CLAIMS } from '@/lib/mockData'

interface DashboardPageProps {
  onNavigateBack: () => void
}

const TABS = [
  { id: 'overview',   label: '📊 Overview'    },
  { id: 'radar',      label: '🕸️ Risk Radar'   },
  { id: 'agents',     label: '🤖 Agent Findings' },
  { id: 'flags',      label: '🚩 Red Flags'    },
  { id: 'questions',  label: '❓ Questions'    },
  { id: 'export',     label: '📄 Export'       },
]

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateBack }) => {
  const { report, setReport, activeTab, setActiveTab, localPdfUrl, setActiveNav } = useClaimStore()
  const [copiedQuestion, setCopiedQuestion] = React.useState<number | null>(null)
  const [processingClaimId, setProcessingClaimId] = React.useState<string | null>(null)

  if (!report) {
    return (
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldAlert size={16} />
              <span>SIU Review Workspace</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">No Active Claim Loaded</h1>
            <p className="text-blue-100 text-sm mt-1">
              Upload a claim document below or select a pre-analyzed sample claim to view the AI risk scorecard.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveNav('claims')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer select-none"
            >
              <FolderOpen size={14} />
              Claims History
            </button>
          </div>
        </div>

        {/* Workspace Grid: Dropzone & Sample Claims */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Embedded Upload Dropzone (7 cols) */}
          <div className="lg:col-span-7">
            <DropzoneUpload onUploadSuccess={(id) => setProcessingClaimId(id)} />
          </div>

          {/* Right: Quick Load Sample Claims (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                Quick Load Sample Claims
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Click any sample claim below to instantly load its multi-agent risk report & evidence citations.
              </p>

              <div className="space-y-3">
                {SAMPLE_CLAIMS.slice(0, 3).map((claim) => (
                  <motion.div
                    key={claim.claim_id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => setReport(claim.report)}
                    className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{claim.claim_id}</span>
                        <SeverityBadge severity={claim.risk_level} />
                      </div>
                      <p className="text-xs font-bold text-gray-800 mt-1">{claim.claim_type}</p>
                      <p className="text-[11px] text-gray-400">{claim.claimant_name} • ${claim.claimed_amount.toLocaleString()}</p>
                    </div>

                    <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Analyze <Zap size={12} className="text-amber-500" />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ProcessingProgressModal
          claimId={processingClaimId}
          isOpen={Boolean(processingClaimId)}
          onComplete={() => setProcessingClaimId(null)}
        />
      </div>
    )
  }

  const recDisplay = getRecommendationDisplay(report.final_recommendation)

  // Direct mapping using exact backend contract schema
  const agentAnalysis = report.agent_analysis
  const fraudAgent = agentAnalysis?.fraud_agent
  const medicalAgent = agentAnalysis?.medical_agent
  const complianceAgent = agentAnalysis?.compliance_agent

  const agentScores = {
    fraud: fraudAgent?.score ?? report.fraud_score ?? 0,
    medical: medicalAgent?.score ?? 0,
    policy: complianceAgent?.status === 'DENIED' ? 90 : complianceAgent?.status === 'APPROVED_WITH_CONDITIONS' ? 50 : 20,
    evidence: report.key_evidence?.length ? Math.min(100, report.key_evidence.length * 30) : 30,
    historical: report.fraud_score ?? 50,
  }

  // Gather all flags for red flags list
  const allFlags: string[] = [
    ...(fraudAgent?.flags || []),
    ...(medicalAgent?.flags || []),
    ...(report.key_evidence || [])
  ]

  const handleCopyQuestion = (q: string, i: number) => {
    navigator.clipboard.writeText(q)
    setCopiedQuestion(i)
    setTimeout(() => setCopiedQuestion(null), 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Top summary stat cards */}
      <motion.div 
        className="px-5 pt-5 pb-0"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Score card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, x: -15, scale: 0.95 },
              show: { opacity: 1, y: 0, x: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } }
            }}
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 30px -4px rgba(37,99,235,0.2)' }}
            className="premium-card p-4 bg-gradient-to-br from-[#1E1B4B] to-[#2563EB] text-white cursor-default"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Overall Risk Score</p>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">{report.claim_id}</span>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="font-mono text-4xl font-black leading-none">
                <AnimatedCounter target={report.overall_risk_score} />
              </span>
              <span className="text-blue-200 text-sm mb-1">/100</span>
            </div>
            <SeverityBadge
              severity={report.risk_level}
              className="mt-2 border-blue-400/30 bg-white/10 text-white"
            />
          </motion.div>

          {/* Fraud score card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } }
            }}
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="premium-card p-4 cursor-default"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fraud Score</p>
            <div className="flex items-end justify-between mt-2">
              <span className="font-mono text-4xl font-black text-red-600 leading-none">
                <AnimatedCounter target={report.fraud_score} />
              </span>
              <span className="text-gray-400 text-sm mb-1">/100</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <TrendingUp size={12} />
              <span className="font-medium">
                {report.fraud_score >= 80 ? 'Critical fraud threshold exceeded' : 'Elevated fraud risk'}
              </span>
            </div>
          </motion.div>

          {/* Recommendation card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30, x: 15, scale: 0.95 },
              show: { opacity: 1, y: 0, x: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 22 } }
            }}
            whileHover={{ y: -4, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="premium-card p-4 cursor-default"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Final Recommendation</p>
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${recDisplay.bg} ${recDisplay.textColor}`}>
              <AlertTriangle size={13} />
              {report.final_recommendation}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Compliance Status: <span className="font-semibold text-gray-700">{complianceAgent?.status || 'PENDING'}</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main split-screen content */}
      <div className="flex-1 flex min-h-0 px-5 pb-5 gap-4">
        {/* Left: PDF Citation Viewer (38%) */}
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
          className="w-[38%] flex-shrink-0 min-h-0 flex flex-col"
        >
          <CitationPdfViewer pdfUrl={localPdfUrl} />
        </motion.div>

        {/* Right: Analysis Panel (62%) */}
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 25 }}
          className="flex-1 min-w-0 flex flex-col min-h-0"
        >
          <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-0 px-3 border-b border-gray-100 overflow-x-auto flex-shrink-0">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  id={`tab-${id}`}
                  className={cn(
                    'relative flex-shrink-0 px-3 py-3.5 text-xs font-semibold transition-colors duration-150 whitespace-nowrap',
                    activeTab === id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  {label}
                  {activeTab === id && (
                    <motion.div
                      layoutId="activeDashboardTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 overflow-y-auto p-5 relative">
              <AnimatePresence mode="wait">
                {/* ── TAB: Overview ──────────────────────────────── */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-5"
                  >
                    {/* Gauge */}
                    <div className="flex justify-center py-2">
                      <OverallScoreGauge
                        score={report.overall_risk_score}
                        riskLevel={report.risk_level}
                        size={200}
                      />
                    </div>

                    {/* Recommendation full banner */}
                    <div className={cn(
                      'rounded-2xl p-4 border flex items-start gap-3',
                      recDisplay.bg
                    )}>
                      <AlertTriangle size={18} className={cn('flex-shrink-0 mt-0.5', recDisplay.textColor)} />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                          Final Recommendation
                        </p>
                        <p className={cn('text-base font-bold', recDisplay.textColor)}>
                          {report.final_recommendation}
                        </p>
                      </div>
                    </div>

                    {/* Key Evidence */}
                    {report.key_evidence && report.key_evidence.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Key Evidence ({report.key_evidence.length})
                        </p>
                        <ul className="space-y-2">
                          {report.key_evidence.map((ev, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, y: 10, x: -8 }}
                              animate={{ opacity: 1, y: 0, x: 0 }}
                              transition={{ delay: i * 0.08, type: "spring", stiffness: 250 }}
                              className="flex items-start gap-2 text-sm text-gray-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
                            >
                              <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                              {ev}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── TAB: Risk Radar ────────────────────────────── */}
                {activeTab === 'radar' && (
                  <motion.div
                    key="radar"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-4"
                  >
                    <div className="premium-card p-4">
                      <RiskRadarChart agentScores={agentScores} />
                    </div>
                    <p className="text-xs text-gray-400 text-center leading-relaxed">
                      Each axis represents one AI agent's risk assessment (0–100).
                      The shaded area shows the aggregate risk profile of claim #{report.claim_id}.
                    </p>
                  </motion.div>
                )}

                {/* ── TAB: Agent Findings ───────────────────────── */}
                {activeTab === 'agents' && (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-3"
                  >
                    {/* Fraud Agent Card */}
                    {fraudAgent && (
                      <AgentAccordionCard
                        agentKey="fraud_agent"
                        agent={{
                          agent_name: 'Fraud Intelligence Agent',
                          score: fraudAgent.score,
                          flags: fraudAgent.flags,
                        }}
                        index={0}
                      />
                    )}

                    {/* Medical Agent Card */}
                    {medicalAgent && (
                      <AgentAccordionCard
                        agentKey="medical_agent"
                        agent={{
                          agent_name: 'Medical & Repair Cost Agent',
                          score: medicalAgent.score,
                          flags: medicalAgent.flags,
                        }}
                        index={1}
                      />
                    )}

                    {/* Compliance Agent Card */}
                    {complianceAgent && (
                      <AgentAccordionCard
                        agentKey="compliance_agent"
                        agent={{
                          agent_name: 'Policy Compliance Agent',
                          score: complianceAgent.status === 'DENIED' ? 90 : 50,
                          status: complianceAgent.status,
                          flags: [
                            `Compliance Status: ${complianceAgent.status}`
                          ],
                        }}
                        index={2}
                      />
                    )}
                  </motion.div>
                )}

                {/* ── TAB: Red Flags ────────────────────────────── */}
                {activeTab === 'flags' && (
                  <motion.div
                    key="flags"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-3"
                  >
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      All Flagged Risk Indicators ({allFlags.length})
                    </p>
                    <ul className="space-y-2">
                      {allFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
                          <span className="flex-shrink-0">🚩</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* ── TAB: Questions ────────────────────────────── */}
                {activeTab === 'questions' && (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      AI-suggested follow-up questions for the investigator. Click to copy.
                    </p>
                    {(report.investigator_questions || []).map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="premium-card p-4 flex items-start gap-3 group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                        onClick={() => handleCopyQuestion(q, i)}
                        id={`question-${i}`}
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700 flex-1 leading-relaxed">{q}</p>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-blue-100 text-blue-500 flex-shrink-0">
                          {copiedQuestion === i ? (
                            <ClipboardCheck size={15} className="text-emerald-600" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* ── TAB: Export ───────────────────────────────── */}
                {activeTab === 'export' && (
                  <motion.div
                    key="export"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <ReportExportPDF />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
