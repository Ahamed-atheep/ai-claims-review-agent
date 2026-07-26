import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Quote, ExternalLink } from 'lucide-react'
import { cn, getRiskColorClasses, SEVERITY_ORDER } from '@/lib/utils'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { useClaimStore, type Finding } from '@/store/useClaimStore'

interface RedFlagsListProps {
  findings: Finding[]
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({ findings }) => {
  const { setSelectedCitation } = useClaimStore()

  const sortedFindings = [...findings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length
  const highCount = findings.filter((f) => f.severity === 'HIGH').length

  if (findings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={24} className="text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-gray-600">No critical red flags detected</p>
        <p className="text-xs text-gray-400">All findings are below HIGH severity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center gap-3">
        {criticalCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
            🔴 {criticalCount} Critical
          </span>
        )}
        {highCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
            🟠 {highCount} High
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {findings.length} total flags across 5 agents
        </span>
      </div>

      {/* Flag cards */}
      <motion.div 
        className="space-y-2.5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {sortedFindings.map((finding, i) => {
          const colors = getRiskColorClasses(finding.severity)
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20, scale: 0.98 },
                show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
              }}
              whileHover={{ y: -2, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
              className={cn(
                'rounded-2xl border p-4 transition-colors duration-150',
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={finding.severity} />
                  <span className="text-xs font-semibold text-gray-700 bg-white/60 px-2 py-0.5 rounded-md border border-gray-200/60">
                    {finding.category}
                  </span>
                </div>

                {finding.citation_id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCitation(finding.citation_id!)}
                    className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-blue-600 hover:text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
                    title="Highlight in PDF viewer"
                  >
                    <ExternalLink size={10} />
                    {finding.citation_id}
                  </motion.button>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mt-2">{finding.description}</p>

              {finding.evidence_quote && (
                <div className="mt-2.5 flex items-start gap-2">
                  <Quote size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-gray-500 italic leading-relaxed">
                    "{finding.evidence_quote}"
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
