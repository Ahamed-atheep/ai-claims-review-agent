import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen, Search, Filter, ArrowUpRight,
  ShieldAlert, ShieldCheck, AlertTriangle, FileText, Plus
} from 'lucide-react'
import { useClaimStore } from '@/store/useClaimStore'
import { SAMPLE_CLAIMS } from '@/lib/mockData'
import { SeverityBadge } from '@/components/common/SeverityBadge'
import { DropzoneUpload } from '@/components/upload/DropzoneUpload'
import { ProcessingProgressModal } from '@/components/upload/ProcessingProgressModal'

export const ClaimsHistoryPage: React.FC = () => {
  const { setReport, setActiveNav, setCurrentClaimId } = useClaimStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState<string>('ALL')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null)

  const filteredClaims = SAMPLE_CLAIMS.filter((c) => {
    const matchesSearch =
      c.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.claimant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.claim_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRisk = filterRisk === 'ALL' || c.risk_level === filterRisk

    return matchesSearch && matchesRisk
  })

  const handleSelectClaim = (c: typeof SAMPLE_CLAIMS[0]) => {
    setReport(c.report)
    setActiveNav('dashboard')
  }

  const handleUploadSuccess = (claimId: string) => {
    setProcessingClaimId(claimId)
  }

  const handleAnalysisComplete = () => {
    setProcessingClaimId(null)
    setShowUploadModal(false)
    setActiveNav('dashboard')
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <FolderOpen size={16} />
            <span>SIU Repository</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Claims History & Audit Logs</h1>
          <p className="text-blue-100 text-sm mt-1">
            Review past claims, inspect AI agent scores, and manage SIU escalation cases.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 text-sm font-bold rounded-2xl transition-all shadow-md flex-shrink-0 cursor-pointer select-none"
        >
          <Plus size={18} className="text-blue-600" />
          Submit New Claim
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Claim ID, Claimant, Policy # or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-4">Claimant</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Claimed</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4 text-center">Fraud Score</th>
                <th className="py-3.5 px-4">Recommendation</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClaims.map((claim) => (
                <motion.tr
                  key={claim.claim_id}
                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                  className="transition-colors cursor-pointer"
                  onClick={() => handleSelectClaim(claim)}
                >
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">
                    {claim.claim_id}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">{claim.claimant_name}</p>
                    <p className="text-xs text-gray-400 font-mono">{claim.policy_number}</p>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-600">
                    {claim.claim_type}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-gray-900">
                    ${claim.claimed_amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <SeverityBadge severity={claim.risk_level} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      claim.fraud_score >= 80 ? 'bg-red-100 text-red-700' : claim.fraud_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {claim.fraud_score}/100
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-gray-600 max-w-[200px] truncate">
                    {claim.final_recommendation}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectClaim(claim)
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Report
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for new upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
            >
              Close
            </button>
            <DropzoneUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      <ProcessingProgressModal
        claimId={processingClaimId}
        isOpen={Boolean(processingClaimId)}
        onComplete={handleAnalysisComplete}
      />
    </div>
  )
}
