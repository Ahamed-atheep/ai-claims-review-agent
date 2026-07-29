import { useState, useCallback } from 'react'
import { uploadClaimDocument } from '@/lib/api'
import { useClaimStore } from '@/store/useClaimStore'

export function useClaimUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { setCurrentClaimId, setUploadedFile, setIsProcessing } = useClaimStore()

  const uploadClaim = useCallback(async (params: {
    file: File
    claimNumber: string
    policyNumber: string
    claimantName: string
    claimedAmount: number
    claimType?: string
  }) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      // Store file reference for the PDF viewer
      setUploadedFile(params.file)

      // Real upload: multipart/form-data
      const formData = new FormData()
      formData.append('file', params.file)
      formData.append('claim_number', params.claimNumber)
      formData.append('policy_number', params.policyNumber)
      formData.append('claimant_name', params.claimantName)
      formData.append('claimed_amount', String(params.claimedAmount))

      const result = await uploadClaimDocument(formData)
      setCurrentClaimId(result.claim_id)
      setIsProcessing(true)
      return result

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setUploadError(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [setCurrentClaimId, setUploadedFile, setIsProcessing])

  return { uploadClaim, isUploading, uploadError }
}
