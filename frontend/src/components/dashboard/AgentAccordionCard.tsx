import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, ExternalLink, Quote } from 'lucide-react'
import { cn, getRiskColorClasses, SEVERITY_ORDER } from '@/lib/utils'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { useClaimStore, type Finding } from '@/store/useClaimStore'

interface AgentResult {
  agent_name: string
  score?: number
  risk_score?: number
  risk_level?: string
  flags?: string[]
  findings?: Finding[]
  summary_reasoning?: string
  status?: string
}

interface AgentAccordionCardProps {
  agentKey: string
  agent: AgentResult
  index: number
}

const AGENT_ICONS: Record<string, string> = {
  fraud_agent: '🕵️',
  medical_agent: '🏥',
  document_agent: '📋',
  risk_agent: '📊',
  compliance_agent: '⚖️',
}

const AGENT_DISPLAY_NAMES: Record<string, string> = {
  fraud_agent: 'Fraud Analysis',
  medical_agent: 'Medical Verification',
  document_agent: 'Document Integrity',
  risk_agent: 'Risk Assessment',
  compliance_agent: 'Compliance Check',
}

export const AgentAccordionCard: React.FC<AgentAccordionCardProps> = ({
  agentKey,
  agent,
  index,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0)
  const { setSelectedCitation, setActiveTab } = useClaimStore()

  const score = agent.score ?? agent.risk_score ?? 0
  const riskLevel = agent.risk_level || (score >= 80 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW')
  const colors = getRiskColorClasses(riskLevel)
  const displayName = agent.agent_name || AGENT_DISPLAY_NAMES[agentKey] || agentKey
  const icon = AGENT_ICONS[agentKey] || '🤖'

  const sortedFindings = [...(agent.findings || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )

  const handleCitationClick = (citationId: string) => {
    setSelectedCitation(citationId)
    setActiveTab('overview')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.05)' }}
      transition={{ 
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3, delay: index * 0.08 },
        y: { type: "spring", stiffness: 300, damping: 25, delay: index * 0.08 }
      }}
      className="premium-card overflow-hidden bg-white"
    >
      {/* Header */}
      <motion.button
        layout="position"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors text-left"
        id={`agent-accordion-${agentKey}`}
      >
        {/* Agent icon + name */}
        <span className="text-xl leading-none flex-shrink-0">{icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{displayName}</p>
          {agent.status && (
            <p className="text-xs text-emerald-600 font-medium mt-0.5">{agent.status}</p>
          )}
        </div>

        {/* Score pill */}
        <div className={cn(
          'flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold',
          colors.badge
        )}>
          <span>{score}</span>
          <span className="opacity-60 font-normal">/100</span>
        </div>

        {/* Risk badge */}
        <SeverityBadge severity={riskLevel} size="sm" />

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 space-y-4">

              {/* Summary reasoning */}
              {agent.summary_reasoning && (
                <motion.div layout="position" className="pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Agent Summary</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{agent.summary_reasoning}</p>
                </motion.div>
              )}

              {/* Flags list */}
              {agent.flags && agent.flags.length > 0 && (
                <motion.div layout="position">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Detected Flags</p>
                  <ul className="space-y-1.5">
                    {agent.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">▸</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Detailed Findings */}
              {sortedFindings.length > 0 && (
                <motion.div layout="position">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Detailed Findings ({sortedFindings.length})
                  </p>
                  <motion.div 
                    className="space-y-3"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 }
                      }
                    }}
                  >
                    {sortedFindings.map((finding, fi) => (
                      <motion.div
                        key={fi}
                        variants={{
                          hidden: { opacity: 0, x: -12 },
                          show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                        }}
                        className={cn(
                          'rounded-xl p-3 border',
                          getRiskColorClasses(finding.severity).bg,
                          getRiskColorClasses(finding.severity).border
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={finding.severity} size="sm" />
                            <span className="text-xs font-semibold text-gray-700">{finding.category}</span>
                          </div>
                          {finding.citation_id && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCitationClick(finding.citation_id!)}
                              className="flex items-center gap-1 text-[10px] font-mono text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 hover:border-blue-200 transition-colors flex-shrink-0"
                              title="Jump to citation in PDF viewer"
                            >
                              <ExternalLink size={10} />
                              {finding.citation_id}
                            </motion.button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{finding.description}</p>
                        {finding.evidence_quote && (
                          <div className="mt-2 flex items-start gap-1.5">
                            <Quote size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="evidence-quote flex-1">"{finding.evidence_quote}"</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
