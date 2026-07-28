import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, ExternalLink, Quote } from 'lucide-react'
import { cn, getRiskColorClasses, SEVERITY_ORDER } from '@/lib/utils'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { useClaimStore, type Finding } from '@/store/useClaimStore'

interface AgentResult {
  agent_name?: string
  score?: number
  risk_score?: number
  risk_level?: string
  flags?: string[]
  findings?: Finding[]
  summary_reasoning?: string
  reasoning?: string
  status?: string
}

interface AgentAccordionCardProps {
  agentKey: string
  agent: AgentResult
  index: number
}

const AGENT_ICONS: Record<string, string> = {
  fraud_agent: '🕵️',
  medical_agent: '🩺',
  policy_agent: '⚖️',
  compliance_agent: '⚖️',
  evidence_agent: '📸',
  historical_agent: '📜',
}

const AGENT_DISPLAY_NAMES: Record<string, string> = {
  fraud_agent: 'Fraud Intelligence Agent',
  medical_agent: 'Medical & Repair Cost Agent',
  policy_agent: 'Policy Compliance Agent',
  compliance_agent: 'Policy Compliance Agent',
  evidence_agent: 'Evidence Verification Agent',
  historical_agent: 'Historical Intelligence Agent',
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
    (a, b) => (SEVERITY_ORDER[a.severity || 'LOW'] ?? 9) - (SEVERITY_ORDER[b.severity || 'LOW'] ?? 9)
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
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Status: {agent.status}</p>
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

        <div className="text-gray-400">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </motion.button>

      {/* Body Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-4 bg-gray-50/30">
              {/* Reasoning summary */}
              {(agent.summary_reasoning || agent.reasoning) && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold text-blue-800 block mb-1">🤖 AI Agent Reasoning:</span>
                  {agent.summary_reasoning || agent.reasoning}
                </div>
              )}

              {/* Flags list if findings are empty */}
              {agent.flags && agent.flags.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700">Flagged Risk Indicators:</p>
                  <ul className="space-y-1">
                    {agent.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50/70 p-2 rounded-lg border border-red-100">
                        <span>🚩</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Findings List */}
              {sortedFindings.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-gray-700">Detailed Findings:</p>
                  {sortedFindings.map((finding, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-gray-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-800">{finding.category || 'General'}</span>
                        <SeverityBadge severity={finding.severity || 'LOW'} size="sm" />
                      </div>
                      <p className="text-gray-600 leading-relaxed">{finding.description || ''}</p>
                      
                      {finding.evidence_quote && (
                        <div className="flex items-start gap-2 p-2 bg-amber-50/70 border border-amber-100 rounded-lg text-amber-900 text-[11px] font-mono">
                          <Quote size={12} className="flex-shrink-0 mt-0.5 text-amber-500" />
                          <span className="flex-1 italic">"{finding.evidence_quote}"</span>
                          {finding.citation_id && (
                            <button
                              onClick={() => handleCitationClick(finding.citation_id!)}
                              className="text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-1 flex-shrink-0 ml-1"
                            >
                              <span>{finding.citation_id}</span>
                              <ExternalLink size={10} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
