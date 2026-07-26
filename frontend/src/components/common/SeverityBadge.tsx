import React from 'react'
import { cn, getRiskColorClasses } from '@/lib/utils'

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface SeverityBadgeProps {
  severity: Severity | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SEVERITY_ICONS: Record<string, string> = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🟢',
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  className,
}) => {
  const colors = getRiskColorClasses(severity)
  const normalized = severity?.toUpperCase()

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        colors.badge,
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[10px] leading-none">{SEVERITY_ICONS[normalized] || '⚪'}</span>
      {normalized}
    </span>
  )
}
