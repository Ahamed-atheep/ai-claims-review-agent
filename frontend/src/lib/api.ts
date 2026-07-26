import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

// ─── Request interceptor (add auth token when available) ──────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

// ─── API Functions ────────────────────────────────────────────

/**
 * Upload a claim document (multipart/form-data)
 * POST /api/v1/claims/upload
 */
export async function uploadClaimDocument(formData: FormData) {
  const response = await apiClient.post('/api/v1/claims/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data as {
    claim_id: string
    status: string
    stream_url: string
  }
}

/**
 * Get full analysis results for a claim
 * POST /api/v1/analyze
 */
export async function analyzeClaim(payload: {
  claim_id: string
  policy_number: string
  claimant_name: string
  claim_amount: number
  claim_type: string
  extracted_text: string
}) {
  const response = await apiClient.post('/api/v1/analyze', payload)
  return response.data
}

/**
 * Get stream URL for a claim (SSE)
 * Returns full URL string for EventSource connection
 */
export function getSSEStreamUrl(claimId: string): string {
  return `${BASE_URL}/api/v1/claims/${claimId}/stream`
}
