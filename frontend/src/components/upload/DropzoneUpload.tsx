import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CloudUpload, FileText, X, AlertCircle, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaimUpload } from '@/hooks/useClaimUpload'

const CLAIM_TYPES = [
  'Auto Collision',
  'Medical / Health',
  'Property Damage',
  'Liability',
  'Life Insurance',
  'Workers Compensation',
  'Other',
]

interface DropzoneUploadProps {
  onUploadSuccess: (claimId: string) => void
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({ onUploadSuccess }) => {
  const { uploadClaim, isUploading, uploadError } = useClaimUpload()

  const [formData, setFormData] = useState({
    claimNumber: '',
    policyNumber: '',
    claimantName: '',
    claimAmount: '',
    claimType: 'Auto Collision',
  })
  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: File[]) => {
    if (rejected.length > 0) {
      setValidationError('Only PDF, PNG, or JPEG files are accepted.')
      return
    }
    if (accepted[0]) {
      setFile(accepted[0])
      setValidationError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50 MB
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!file) {
      setValidationError('Please attach a claim document.')
      return
    }
    if (!formData.claimNumber || !formData.policyNumber || !formData.claimantName || !formData.claimAmount) {
      setValidationError('Please fill in all required fields.')
      return
    }

    try {
      const result = await uploadClaim({
        file,
        claimNumber: formData.claimNumber,
        policyNumber: formData.policyNumber,
        claimantName: formData.claimantName,
        claimedAmount: parseFloat(formData.claimAmount),
        claimType: formData.claimType,
      })
      onUploadSuccess(result.claim_id)
    } catch {
      // Error handled in hook
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] px-6 py-5">
        <h2 className="text-white font-bold text-lg tracking-tight">New Claim Submission</h2>
        <p className="text-blue-200 text-sm mt-0.5">Upload documents for AI analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Claim Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="claimNumber"
              value={formData.claimNumber}
              onChange={handleChange}
              placeholder="CLM-2026-0001"
              className="field-input font-mono text-sm"
              id="claim-number-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Policy Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
              placeholder="POL-88321"
              className="field-input font-mono text-sm"
              id="policy-number-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Claimant Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              placeholder="John Doe"
              className="field-input"
              id="claimant-name-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Claim Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">$</span>
              <input
                type="number"
                name="claimAmount"
                value={formData.claimAmount}
                onChange={handleChange}
                placeholder="15,500"
                className="field-input pl-7"
                id="claim-amount-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Claim Type Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Claim Type
          </label>
          <div className="relative">
            <select
              name="claimType"
              value={formData.claimType}
              onChange={handleChange}
              className="field-input appearance-none pr-10 cursor-pointer"
              id="claim-type-select"
            >
              {CLAIM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* File Dropzone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Claim Document <span className="text-red-400">*</span>
          </label>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                {...getRootProps()}
                className={cn(
                  'relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200',
                  isDragActive
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                )}
              >
                <input {...getInputProps()} id="file-dropzone-input" />
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                      isDragActive ? 'bg-blue-100' : 'bg-gray-50 border border-gray-200'
                    )}
                  >
                    <CloudUpload size={24} className={isDragActive ? 'text-blue-600' : 'text-gray-400'} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {isDragActive ? 'Drop document here' : 'Drag & drop claim document'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PDF, PNG, or JPEG — max 50 MB
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                    or click to browse
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file-preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl border border-blue-100"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error display */}
        <AnimatePresence>
          {(validationError || uploadError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{validationError || uploadError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isUploading}
          whileHover={{ scale: isUploading ? 1 : 1.01 }}
          whileTap={{ scale: isUploading ? 1 : 0.99 }}
          className={cn(
            'w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200',
            isUploading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-blue-glow'
          )}
          id="submit-claim-btn"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading Document...
            </span>
          ) : (
            '⚡ Run AI Analysis'
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
