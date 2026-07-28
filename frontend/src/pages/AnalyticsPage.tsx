import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, ShieldAlert, Zap, DollarSign,
  PieChart as PieIcon, Activity, CheckCircle2
} from 'lucide-react'
import { AnimatedCounter } from '@/components/common/AnimatedCounter'

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
          <BarChart3 size={16} />
          <span>Platform Intelligence</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Fraud Analytics & Agent Metrics</h1>
        <p className="text-blue-100 text-sm mt-1">
          Real-time metrics, fraud exposure prevention, and multi-agent AI performance logs.
        </p>
      </div>

      {/* Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fraud Savings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">$1.42M</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <TrendingUp size={12} /> +18.4% prevented this month
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Claims Audited</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">
              <AnimatedCounter target={148} />
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">99.4% accuracy rating</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Processing Time</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">
              <AnimatedCounter target={1.2} decimals={1} suffix="s" />
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Parallel asyncio agent fan-out</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SIU Referral Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">
              <AnimatedCounter target={14.2} decimals={1} suffix="%" />
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1 font-medium">High risk threshold &gt; 75</p>
        </motion.div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <PieIcon size={18} className="text-blue-600" />
            Risk Level Distribution
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Critical Risk (> 85)', pct: 12, color: 'bg-red-500 text-red-600' },
              { label: 'High Risk (70–85)', pct: 28, color: 'bg-amber-500 text-amber-600' },
              { label: 'Medium Risk (40–70)', pct: 35, color: 'bg-blue-500 text-blue-600' },
              { label: 'Low Risk (< 40)', pct: 25, color: 'bg-emerald-500 text-emerald-600' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.color.split(' ')[0]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Flagged Patterns */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-600" />
            Top Detected Fraud Patterns
          </h2>
          <ul className="space-y-3">
            {[
              { title: 'Billing inflation > 300% regional average', count: '42 cases', severity: 'Critical' },
              { title: 'Repair quote date precedes accident date', count: '29 cases', severity: 'High' },
              { title: 'Duplicate invoice submitted across subsidiaries', count: '18 cases', severity: 'Critical' },
              { title: 'Diagnosis ICD-10 code mismatch with notes', count: '14 cases', severity: 'Medium' },
            ].map((flag, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-800">{flag.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{flag.count}</p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-lg">
                  {flag.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
