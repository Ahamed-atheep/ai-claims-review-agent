import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaimStore } from '@/store/useClaimStore'
import { useSSEStream } from '@/hooks/useSSEStream'

const STEPS = [
  { key: 'OCR_COMPLETE',   label: 'OCR Extraction',       icon: '📄', desc: 'Reading & extracting document text' },
  { key: 'RAG_RETRIEVAL',  label: 'Policy RAG Retrieval', icon: '🔍', desc: 'Querying policy & fraud databases'  },
  { key: 'AGENTS_RUNNING', label: '5 Agents Running',     icon: '🤖', desc: 'Parallel AI agent fan-out'          },
  { key: 'SYNTHESIS',      label: 'Decision Synthesis',   icon: '⚡', desc: 'Aggregating findings & scoring'     },
  { key: 'COMPLETED',      label: 'Analysis Complete',    icon: '✅', desc: 'Report ready for review'            },
]

const AGENT_ORBS = [
  { label: 'Fraud',       color: 'bg-red-500',     emoji: '🕵️' },
  { label: 'Medical',     color: 'bg-blue-500',    emoji: '🏥' },
  { label: 'Document',    color: 'bg-purple-500',  emoji: '📋' },
  { label: 'Risk',        color: 'bg-orange-500',  emoji: '📊' },
  { label: 'Compliance',  color: 'bg-emerald-500', emoji: '⚖️' },
]

interface ProcessingProgressModalProps {
  claimId: string | null
  isOpen: boolean
  onComplete: () => void
}

export const ProcessingProgressModal: React.FC<ProcessingProgressModalProps> = ({
  claimId,
  isOpen,
  onComplete,
}) => {
  const { processingProgress, currentStepMessage, currentStep, processingSteps } = useClaimStore()

  useSSEStream({
    claimId: isOpen ? claimId : null,
    onComplete,
    onError: (err) => console.error('[SSE Error]', err),
  })

  // Progress bar color based on progress
  const getProgressColor = () => {
    if (processingProgress >= 100) return 'from-emerald-500 to-emerald-400'
    if (processingProgress >= 60) return 'from-amber-500 to-orange-400'
    return 'from-blue-600 to-indigo-500'
  }

  const completedStepKeys = processingSteps.map((s) => s.step)
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1729]/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] px-6 py-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: processingProgress < 100 ? 360 : 0 }}
                  transition={{ duration: 2, repeat: processingProgress < 100 ? Infinity : 0, ease: 'linear' }}
                  className="w-8 h-8"
                >
                  <Zap size={32} className="text-yellow-300" />
                </motion.div>
                <div>
                  <h2 className="text-white font-bold text-lg">AI Analysis in Progress</h2>
                  <p className="text-blue-200 text-xs">
                    {claimId && <span className="font-mono">{claimId}</span>}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-blue-200">
                  <span>{currentStepMessage || 'Initializing...'}</span>
                  <span className="font-mono font-bold">{processingProgress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full bg-gradient-to-r', getProgressColor())}
                    initial={{ width: '0%' }}
                    animate={{ width: `${processingProgress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="px-6 py-4 space-y-1">
              {STEPS.map((step, idx) => {
                const isDone = completedStepKeys.includes(step.key as typeof processingSteps[number]['step'])
                const isCurrent = currentStep === step.key && !isDone
                const isPending = idx > currentStepIndex && !isDone

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                      isCurrent && 'bg-blue-50 border border-blue-100',
                      isDone && 'opacity-70',
                      isPending && 'opacity-40',
                    )}
                  >
                    {/* Status icon */}
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 size={20} className="text-blue-600" />
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>

                    <span className="text-xl leading-none">{step.icon}</span>

                    <div className="flex-1">
                      <p className={cn(
                        'text-sm font-semibold',
                        isCurrent ? 'text-blue-700' : isDone ? 'text-gray-700' : 'text-gray-400'
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-blue-500 mt-0.5"
                        >
                          {step.desc}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Agent orbs — show when AGENTS_RUNNING */}
            <AnimatePresence>
              {currentStep === 'AGENTS_RUNNING' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-5"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Parallel Agent Execution
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    {AGENT_ORBS.map((orb, idx) => (
                      <motion.div
                        key={orb.label}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <motion.div
                          animate={{
                            boxShadow: [
                              `0 0 0 0 rgba(0,0,0,0)`,
                              `0 0 0 6px rgba(99,102,241,0.15)`,
                              `0 0 0 0 rgba(0,0,0,0)`,
                            ],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                            orb.color + '/20 border-2 border-current'
                          )}
                          style={{ borderColor: 'currentColor' }}
                        >
                          {orb.emoji}
                        </motion.div>
                        <span className="text-[9px] font-semibold text-gray-500 uppercase">{orb.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer note */}
            <div className="px-6 pb-5">
              <p className="text-center text-xs text-gray-400">
                Adversarial injection defense active • Sandboxed claim data
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
