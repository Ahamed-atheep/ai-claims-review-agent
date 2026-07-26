import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getRiskScoreColor } from '@/lib/utils'

interface OverallScoreGaugeProps {
  score: number
  riskLevel: string
  size?: number
}

export const OverallScoreGauge: React.FC<OverallScoreGaugeProps> = ({
  score,
  riskLevel,
  size = 180,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1400
      const startTime = performance.now()
      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimatedScore(Math.round(eased * score))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  // Arc spans 270° (from 135° to 405°) — classic gauge
  const arcLength = circumference * 0.75
  const offset = arcLength - (animatedScore / 100) * arcLength
  const color = getRiskScoreColor(score)

  // Track color for background arc
  const trackColor = '#F3F4F6'

  const cx = size / 2
  const cy = size / 2

  // Start angle: 135° (bottom-left), sweep 270°
  const startAngle = 135
  const sweepAngle = 270

  const polarToCartesian = (angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    }
  }

  const arcPath = (startDeg: number, sweepDeg: number) => {
    const start = polarToCartesian(startDeg)
    const end = polarToCartesian(startDeg + sweepDeg)
    const largeArc = sweepDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  const filledSweep = (animatedScore / 100) * sweepAngle

  const riskLevelColors: Record<string, string> = {
    CRITICAL: 'text-red-600',
    HIGH: 'text-orange-600',
    MEDIUM: 'text-amber-600',
    LOW: 'text-emerald-600',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Background track */}
          <path
            d={arcPath(startAngle, sweepAngle)}
            fill="none"
            stroke={trackColor}
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* Animated filled arc */}
          {animatedScore > 0 && (
            <motion.path
              d={arcPath(startAngle, filledSweep)}
              fill="none"
              stroke={color}
              strokeWidth={14}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            />
          )}
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="font-mono font-bold text-gray-900 leading-none"
            style={{ fontSize: size * 0.22 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-xs text-gray-500 font-medium mt-1">/ 100</span>
        </div>
      </div>

      {/* Risk Level Label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <p className={`text-lg font-bold tracking-tight ${riskLevelColors[riskLevel?.toUpperCase()] || 'text-gray-700'}`}>
          {riskLevel?.toUpperCase()} RISK
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Overall Composite Score</p>
      </motion.div>
    </div>
  )
}
