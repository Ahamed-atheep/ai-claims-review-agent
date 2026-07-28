import React from 'react'
import { motion } from 'framer-motion'
import { Download, Printer, Shield, AlertTriangle } from 'lucide-react'
import { useClaimStore } from '@/store/useClaimStore'
import { getRecommendationDisplay, formatCurrency } from '@/lib/utils'

interface ReportExportPDFProps {}

export const ReportExportPDF: React.FC<ReportExportPDFProps> = () => {
  const { report, currentClaimForm } = useClaimStore()

  if (!report) return null

  const recDisplay = getRecommendationDisplay(report.final_recommendation)

  const handlePrint = () => window.print()

  const handleDownload = () => {
    // Create a formatted text report for download
    const content = generateTextReport(report, currentClaimForm)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ClaimGuard_Report_${report.claim_id}_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Report Preview Card */}
      <div className="premium-card p-5 space-y-4" id="report-preview">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">ClaimGuard AI — Adversarial Review Report</h3>
            <p className="text-xs text-gray-500 font-mono">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Key info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Claim ID', value: report.claim_id, mono: true },
            { label: 'Risk Level', value: report.risk_level },
            { label: 'Overall Score', value: `${report.overall_risk_score}/100`, mono: true },
            { label: 'Fraud Score', value: `${report.fraud_score}/100`, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-sm font-bold text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Recommendation banner */}
        <div className={`rounded-xl p-3 border ${recDisplay.bg} flex items-center gap-3`}>
          <AlertTriangle size={16} className={recDisplay.textColor} />
          <div>
            <p className="text-xs font-semibold text-gray-600">Final Recommendation</p>
            <p className={`text-sm font-bold ${recDisplay.textColor}`}>
              {report.final_recommendation}
            </p>
          </div>
        </div>

        {/* Evidence summary */}
        {report.key_evidence && report.key_evidence.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Key Evidence ({report.key_evidence.length})
            </p>
            <ul className="space-y-1.5">
              {report.key_evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions */}
        {report.investigator_questions && report.investigator_questions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Investigator Questions ({report.investigator_questions.length})
            </p>
            <ul className="space-y-1.5">
              {report.investigator_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-blue-500 font-mono font-bold flex-shrink-0">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          className="flex-1 btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
          id="btn-download-report"
        >
          <Download size={16} />
          Download Text Report
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          id="btn-print-report"
        >
          <Printer size={16} />
          Print
        </motion.button>
      </div>
    </div>
  )
}

function generateTextReport(report: any, form: any): string {
  return `=================================================================
CLAIMGUARD AI — ADVERSARIAL CLAIMS REVIEW AUDIT REPORT
Generated: ${new Date().toISOString()}
=================================================================

CLAIM METADATA:
  Claim ID:          ${report.claim_id}
  Policy Number:     ${form?.policyNumber || 'N/A'}
  Claimant:          ${form?.claimantName || 'N/A'}
  Claim Amount:      ${form?.claimAmount ? formatCurrency(form.claimAmount) : 'N/A'}
  Claim Type:        ${form?.claimType || 'N/A'}

ASSESSMENT SUMMARY:
  Overall Risk Score: ${report.overall_risk_score} / 100
  Risk Level:         ${report.risk_level}
  Fraud Score:        ${report.fraud_score} / 100
  Final Recommendation: ${report.final_recommendation}

AGENT ANALYSIS:
  Compliance Agent Status: ${report.agent_analysis?.compliance_agent?.status || 'N/A'}
  Fraud Agent Score:       ${report.agent_analysis?.fraud_agent?.score || 'N/A'}
  Fraud Agent Flags:       ${(report.agent_analysis?.fraud_agent?.flags || []).join('; ')}
  Medical Agent Score:     ${report.agent_analysis?.medical_agent?.score || 'N/A'}
  Medical Agent Flags:     ${(report.agent_analysis?.medical_agent?.flags || []).join('; ')}

KEY EVIDENCE:
${(report.key_evidence || []).map((e: string) => `  - ${e}`).join('\n')}

INVESTIGATOR QUESTIONS:
${(report.investigator_questions || []).map((q: string, i: number) => `  ${i + 1}. ${q}`).join('\n')}

=================================================================
CONFIDENTIAL — FOR SPECIAL INVESTIGATION UNIT (SIU) USE ONLY
=================================================================
`
}
