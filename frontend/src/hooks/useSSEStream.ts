import { useEffect, useRef, useCallback } from 'react'
import { getSSEStreamUrl } from '@/lib/api'
import { useClaimStore, type SSEProgressEvent } from '@/store/useClaimStore'
import { MOCK_SSE_STEPS } from '@/lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

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

  // Mock SSE simulation for development
  const runMockStream = useCallback(async () => {
    setIsProcessing(true)
    for (const step of MOCK_SSE_STEPS) {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200))
      addProcessingStep(step as SSEProgressEvent)
      if (step.step === 'COMPLETED') {
        setTimeout(() => {
          setIsProcessing(false)
          onCompleteRef.current?.()
        }, 600)
      }
      if (step.step === 'FAILED') {
        setIsProcessing(false)
        onErrorRef.current?.('Processing failed')
      }
    }
  }, [addProcessingStep, setIsProcessing])

  useEffect(() => {
    if (!claimId) return

    if (USE_MOCK) {
      runMockStream()
      return
    }

    // Real SSE connection
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
  }, [claimId, runMockStream, addProcessingStep, setIsProcessing, stopStream])

  return { stopStream }
}
