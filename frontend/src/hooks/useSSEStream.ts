import { useEffect, useRef, useCallback } from 'react'
import { getSSEStreamUrl } from '@/lib/api'
import { useClaimStore, type SSEProgressEvent } from '@/store/useClaimStore'

interface UseSSEStreamOptions {
  claimId: string | null
  onComplete?: () => void
  onError?: (error: string) => void
}

export function useSSEStream({ claimId, onComplete, onError }: UseSSEStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  const { addProcessingStep, setIsProcessing } = useClaimStore()

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onComplete, onError])

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!claimId) return

    const url = getSSEStreamUrl(claimId)
    const es = new EventSource(url)
    eventSourceRef.current = es

    setIsProcessing(true)

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEProgressEvent
        addProcessingStep(data)

        if (data.step === 'COMPLETED') {
          stopStream()
          setIsProcessing(false)
          onCompleteRef.current?.()
        }
        if (data.step === 'FAILED') {
          stopStream()
          setIsProcessing(false)
          onErrorRef.current?.(data.message || 'Processing failed')
        }
      } catch (e) {
        console.error('[SSE] Failed to parse event:', e)
      }
    }

    es.onerror = () => {
      stopStream()
      setIsProcessing(false)
      onErrorRef.current?.('Connection to analysis stream lost.')
    }

    return () => stopStream()
  }, [claimId, addProcessingStep, setIsProcessing, stopStream])

  return { stopStream }
}
