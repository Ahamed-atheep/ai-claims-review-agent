import React from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

interface RiskRadarChartProps {
  agentScores: {
    fraud: number
    medical: number
    policy?: number
    evidence?: number
    historical?: number
    document?: number
    risk?: number
    compliance?: number
  }
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { subject: string } }> }) => {
  if (active && payload && payload.length) {
    const { subject } = payload[0].payload
    const score = payload[0].value
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-800">{subject}</p>
        <p className="font-mono text-blue-600 mt-0.5">Score: {score}/100</p>
      </div>
    )
  }
  return null
}

export const RiskRadarChart: React.FC<RiskRadarChartProps> = ({ agentScores }) => {
  const data = [
    { subject: 'Fraud Intelligence', score: agentScores.fraud ?? 0,      fullMark: 100 },
    { subject: 'Medical & Repair',  score: agentScores.medical ?? 0,    fullMark: 100 },
    { subject: 'Policy Compliance', score: agentScores.policy ?? agentScores.compliance ?? 0, fullMark: 100 },
    { subject: 'Evidence Verification', score: agentScores.evidence ?? agentScores.document ?? 0, fullMark: 100 },
    { subject: 'Historical Patterns', score: agentScores.historical ?? agentScores.risk ?? 0, fullMark: 100 },
  ]

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">5-Agent Multi-Domain Risk Vector Analysis</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-400/60 border border-red-400" />
          <span className="text-xs text-gray-500">Risk Level</span>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              stroke="#E5E7EB"
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Claim Risk"
              dataKey="score"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Legend */}
      <div className="grid grid-cols-5 gap-1.5">
        {data.map((d) => {
          const color =
            d.score >= 80 ? 'text-red-600 bg-red-50 border-red-100' :
            d.score >= 55 ? 'text-orange-600 bg-orange-50 border-orange-100' :
            d.score >= 30 ? 'text-amber-600 bg-amber-50 border-amber-100' :
            'text-emerald-600 bg-emerald-50 border-emerald-100'
          return (
            <div key={d.subject} className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg border ${color}`}>
              <span className="font-mono text-base font-bold leading-none">{d.score}</span>
              <span className="text-[9px] font-semibold uppercase text-center leading-tight opacity-75 truncate w-full">
                {d.subject.split(' ')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
