import React from 'react'
import { motion } from 'framer-motion'
import {
  FileSearch, FileText, CheckCircle2, Zap, ArrowUpRight,
  Shield, Eye
} from 'lucide-react'
import { useClaimStore } from '@/store/useClaimStore'
import { SAMPLE_CLAIMS } from '@/lib/mockData'

export const DocumentsPage: React.FC = () => {
  const { setReport, setActiveNav } = useClaimStore()

  const handleAnalyze = (claim: typeof SAMPLE_CLAIMS[0]) => {
    setReport(claim.report)
    setActiveNav('dashboard')
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
          <FileSearch size={16} />
          <span>Document Vault</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Claim Documents & OCR Repository</h1>
        <p className="text-blue-100 text-sm mt-1">
          Manage claim PDFs, inspect PyMuPDF text extractions, and launch vector indexing.
        </p>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAMPLE_CLAIMS.map((claim) => (
          <motion.div
            key={claim.claim_id}
            whileHover={{ y: -3 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                  {claim.claim_id}
                </span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> OCR Extracted
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{claim.claim_type} PDF Document</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Claimant: <span className="font-semibold text-gray-700">{claim.claimant_name}</span></p>
                  <p className="text-xs text-gray-400 font-mono">Policy: {claim.policy_number}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Claim Amount:</span>
                  <span className="font-mono font-bold">${claim.claimed_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pinecone RAG Vector Index:</span>
                  <span className="font-mono text-emerald-600 font-semibold">Indexed (512-dim)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">PDF • 4 Pages • 6.7 KB</span>
              <button
                onClick={() => handleAnalyze(claim)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer select-none"
              >
                <Zap size={14} className="text-amber-300" />
                Analyze in Dashboard
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
