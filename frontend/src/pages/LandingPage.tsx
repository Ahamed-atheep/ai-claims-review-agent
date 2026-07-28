import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ArrowRight, Zap, CheckCircle2,
  Lock, Activity
} from 'lucide-react'
import { DropzoneUpload } from '@/components/upload/DropzoneUpload'
import { ProcessingProgressModal } from '@/components/upload/ProcessingProgressModal'
import { useClaimStore } from '@/store/useClaimStore'
import { MOCK_CLAIM_RESPONSE } from '@/lib/mockData'
import { analyzeByClaimId } from '@/lib/api'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

interface LandingPageProps {
  onNavigateToDashboard: () => void
}

const FEATURES = [
  {
    icon: '🕵️',
    title: 'Adversarial Multi-Agent RAG',
    desc: '5 specialized agents challenge each claim simultaneously with domain-filtered vector search.',
  },
  {
    icon: '⚡',
    title: 'Sub-Second Analysis',
    desc: 'Parallel execution powered by Groq and Gemini 2.0 Pro.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'Strict Pydantic schema validation and zero data persistence policy.',
  },
  {
    icon: '📄',
    title: 'Interactive Citation Viewer',
    desc: 'Direct line-by-line evidence mapping to uploaded claim PDFs.',
  },
]

const STATS = [
  { value: 99.4, label: 'Fraud Detection Accuracy', suffix: '%', icon: CheckCircle2, color: 'text-emerald-500', decimals: 1 },
  { value: 1.2, label: 'Avg Processing Time', suffix: 's', icon: Zap, color: 'text-blue-500', decimals: 1 },
  { value: 100, label: 'API Contract Compliance', suffix: '%', icon: Activity, color: 'text-purple-500', decimals: 0 },
  { value: 256, label: 'Bit Encryption Standard', suffix: '', icon: Lock, color: 'text-indigo-500', decimals: 0 },
]

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard }) => {
  const [showModal, setShowModal] = useState(false)
  const { currentClaimId, setReport, hasSeenIntro, setHasSeenIntro } = useClaimStore()

  useEffect(() => {
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setHasSeenIntro(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [hasSeenIntro, setHasSeenIntro])

  const handleUploadSuccess = (_claimId: string) => {
    setShowModal(true)
  }

  const handleAnalysisComplete = () => {
    setShowModal(false)

    if (USE_MOCK) {
      // Load mock report data matching exact backend contract
      const mockReport = {
        claim_id: MOCK_CLAIM_RESPONSE.claim_id,
        overall_risk_score: MOCK_CLAIM_RESPONSE.overall_risk_score,
        risk_level: MOCK_CLAIM_RESPONSE.risk_level,
        fraud_score: MOCK_CLAIM_RESPONSE.fraud_score,
        agent_analysis: MOCK_CLAIM_RESPONSE.agent_analysis,
        key_evidence: MOCK_CLAIM_RESPONSE.key_evidence,
        investigator_questions: MOCK_CLAIM_RESPONSE.investigator_questions,
        final_recommendation: MOCK_CLAIM_RESPONSE.final_recommendation,
      }
      setReport(mockReport)
    }
    onNavigateToDashboard()
  }

  const runSeededDemo = async () => {
    try {
      const seededId = 'ca15f152-c02e-4145-b00d-8d0f23897828'
      const data = await analyzeByClaimId(seededId)
      // set report in store and navigate
      setReport(data)
      onNavigateToDashboard()
    } catch (err) {
      console.error('Seeded demo failed', err)
    }
  }

  return (
    <div className="min-h-screen relative">
      
      {/* 0:00 - 0:02 Intro Animation (Centered Logo) */}
      {!hasSeenIntro && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
          <motion.div 
            layoutId="app-logo"
            className="flex items-center gap-4 cursor-pointer inline-flex"
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-9 h-9 text-white" />
            </div>
            <div className="overflow-hidden flex items-center">
              <motion.span 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="text-5xl font-black text-gray-900 tracking-tight whitespace-nowrap block"
              >
                ClaimGuard <span className="text-blue-600">AI</span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ml-1 w-3 h-10 bg-blue-600 inline-block"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Page Content */}
      {hasSeenIntro && (
        <>
          {/* Hero Section */}
          <div className="pt-24 pb-0 relative overflow-hidden">
            {/* Subtle grid overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_20%,#000_80%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left: Hero Copy */}
                <div className="pt-8">
                  {/* Announcement pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    className="inline-flex items-center gap-2 bg-white/40 border border-white/60 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    Gemini 2.0 Pro · Llama 3.3 70B · Pinecone RAG
                  </motion.div>

                  {/* Main headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-gray-900 uppercase"
                  >
                    AI ADVERSARIAL
                    <br />
                    <span className="text-blue-600">CLAIMS</span>
                    <br />
                    REVIEW ENGINE
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="mt-5 text-base text-gray-700 leading-relaxed max-w-md"
                  >
                    Upload insurance claim documents. Five specialized AI agents analyze fraud patterns,
                    medical records, document integrity, risk factors, and compliance — simultaneously,
                    in seconds.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    className="mt-7 flex items-center gap-3"
                  >
                    <button
                      onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all duration-150 shadow-lg shadow-blue-600/30 cursor-pointer select-none"
                      id="hero-cta-btn"
                    >
                      Analyze a Claim
                      <ArrowRight size={16} />
                    </button>
                    {USE_MOCK && (
                      <button
                        onClick={() => {
                          setShowModal(true)
                          const store = useClaimStore.getState()
                          store.setCurrentClaimId('CLM-2026-9901')
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-full border border-white/20 backdrop-blur-sm transition-all duration-150 cursor-pointer select-none"
                        id="demo-btn"
                      >
                        <Zap size={15} className="text-amber-400" />
                        Run Demo
                      </button>
                    )}
                    {import.meta.env.DEV && (
                      <button
                        onClick={runSeededDemo}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-full border border-white/20 backdrop-blur-sm transition-all duration-150 cursor-pointer select-none"
                      >
                        Run Seeded Demo
                      </button>
                    )}
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
                    }}
                    className="mt-10 flex items-center gap-6"
                  >
                    {STATS.map(({ value, label, suffix, icon: Icon, color, decimals }) => (
                      <motion.div 
                        key={label} 
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0, transition: { type: "spring" } }
                        }}
                        className="flex flex-col gap-1"
                      >
                        <div className={`flex items-center gap-1.5 text-2xl font-black ${color}`}>
                          <Icon size={16} className="opacity-70" />
                          <AnimatedCounter
                            target={value}
                            suffix={suffix}
                            decimals={decimals}
                            className="leading-none"
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Right: Upload Card */}
                <motion.div
                  id="upload-section"
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 22 }}
                >
                  <DropzoneUpload onUploadSuccess={handleUploadSuccess} />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Blue hero stripe */}
          <div id="features-section" className="mt-16 hero-gradient py-16 px-6 relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="max-w-7xl mx-auto relative z-10"
            >
              <div className="text-center mb-10">
                <p className="section-label text-blue-300 mb-2">Built for Growth</p>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight">
                  ENTERPRISE-GRADE FRAUD DETECTION
                </h2>
                <p className="text-blue-200 text-sm mt-3 max-w-xl mx-auto">
                  Multi-agent AI system with adversarial prompt injection defense, explainable audit trails, and real-time streaming analysis.
                </p>
              </div>

              {/* Feature cards */}
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.9 } }
                }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {FEATURES.map((feat) => (
                  <motion.div
                    key={feat.title}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { opacity: 1, y: 0, transition: { type: "spring" } }
                    }}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all duration-200"
                  >
                    <div className="text-3xl mb-3">{feat.icon}</div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{feat.title}</h3>
                    <p className="text-xs text-blue-200 leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Trusted by section */}
          <motion.div 
            id="infrastructure-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="py-10 px-6 border-b border-blue-900/10"
          >
            <div className="max-w-7xl mx-auto">
              <p className="text-center text-xs font-semibold text-blue-900/50 uppercase tracking-widest mb-6">
                Powered by industry-leading AI infrastructure
              </p>
              <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
                {['Google Gemini', 'Llama 3.3', 'Pinecone', 'FastAPI', 'PostgreSQL'].map((tech) => (
                  <span key={tech} className="text-sm font-bold text-blue-900">{tech}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Processing Modal */}
      <ProcessingProgressModal
        claimId={currentClaimId}
        isOpen={showModal}
        onComplete={handleAnalysisComplete}
      />
    </div>
  )
}
