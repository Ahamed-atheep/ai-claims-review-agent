import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Map risk level string to Tailwind color classes */
export function getRiskColorClasses(level: string): {
  bg: string; border: string; text: string; badge: string;
} {
  switch (level?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700 border border-red-200',
      }
    case 'HIGH':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700 border border-orange-200',
      }
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700 border border-amber-200',
      }
    case 'LOW':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      }
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-600 border border-gray-200',
      }
  }
}

/** Map risk score (0-100) to color string */
export function getRiskScoreColor(score: number): string {
  if (score >= 80) return '#EF4444'
  if (score >= 55) return '#F97316'
  if (score >= 30) return '#F59E0B'
  return '#10B981'
}

/** Map recommendation string to display label + colors */
export function getRecommendationDisplay(rec: string) {
  switch (rec?.toUpperCase()) {
    case 'APPROVE':
      return { label: 'APPROVE', color: 'bg-emerald-600', textColor: 'text-emerald-700', bg: 'bg-emerald-50' }
    case 'REJECT':
      return { label: 'REJECT', color: 'bg-red-600', textColor: 'text-red-700', bg: 'bg-red-50' }
    case 'ESCALATE_TO_INVESTIGATOR':
      return { label: 'ESCALATE TO INVESTIGATOR', color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50' }
    default:
      return { label: rec || 'REFER TO SIU', color: 'bg-orange-600', textColor: 'text-orange-700', bg: 'bg-orange-50' }
  }
}

/** Format currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format date */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

/** Severity sort order */
export const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
}
