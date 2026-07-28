import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface RedFlagsListProps {
  flags: string[]
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({ flags }) => {
  if (!flags || flags.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={24} className="text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-gray-600">No critical red flags detected</p>
        <p className="text-xs text-gray-400">All risk checks passed clean</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
          🔴 {flags.length} Risk Flags
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
        {flags.map((flag, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, x: -20, scale: 0.98 },
              show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
            }}
            whileHover={{ y: -2, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="rounded-2xl border border-red-200 bg-red-50/70 p-4 transition-colors duration-150"
          >
            <div className="flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">🚩</span>
              <p className="text-sm font-semibold text-red-800 leading-relaxed flex-1">{flag}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
