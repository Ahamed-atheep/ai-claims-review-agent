import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Cpu, ShieldCheck, Database, Sliders,
  Save, CheckCircle2
} from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-pro')
  const [criticalThreshold, setCriticalThreshold] = useState(85)
  const [highThreshold, setHighThreshold] = useState(70)
  const [enableAdversarialDefense, setEnableAdversarialDefense] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#2563EB] p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
          <Settings size={16} />
          <span>System Architecture</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">AI Engine & SIU Workflow Settings</h1>
        <p className="text-blue-100 text-sm mt-1">
          Configure model parameters, risk score thresholds, and security guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Cpu size={18} className="text-blue-600" />
            AI Model & Execution Engine
          </h2>
          
          <div className="space-y-3">
            {[
              { id: 'gemini-2.0-pro', title: 'Google Gemini 2.0 Pro', desc: 'Recommended • Sub-second reasoning & 2M context window', speed: '< 1.2s' },
              { id: 'llama-3.3-70b', title: 'Groq Llama 3.3 70B', desc: 'Ultra fast LPUs • Sub-500ms parallel agent fan-out', speed: '< 0.5s' },
              { id: 'gpt-4o', title: 'OpenAI GPT-4o', desc: 'Enterprise fallback • Strict JSON schema verification', speed: '< 1.8s' },
            ].map((model) => (
              <label
                key={model.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={() => setSelectedModel(model.id)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">{model.title}</p>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {model.speed}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{model.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Risk Threshold Sliders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders size={18} className="text-purple-600" />
            Risk Escalation Thresholds
          </h2>

          {/* Critical Risk Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-red-600">Critical Risk SIU Referral Cutoff</span>
              <span className="font-mono text-gray-900 font-bold">{criticalThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="70"
              max="95"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-400">Claims scoring above this threshold trigger immediate SIU audit requirement.</p>
          </div>

          {/* High Risk Slider */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-600">High Risk Condition Cutoff</span>
              <span className="font-mono text-gray-900 font-bold">{highThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="80"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-gray-400">Claims in this band require manual review before approval.</p>
          </div>

          {/* Security Guardrails */}
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Adversarial Prompt Injection Defense
                </p>
                <p className="text-xs text-gray-500">Sanitize uploaded PDF text for adversarial instructions prior to vector insertion.</p>
              </div>
              <input
                type="checkbox"
                checked={enableAdversarialDefense}
                onChange={(e) => setEnableAdversarialDefense(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Save bar */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer select-none"
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-300" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  )
}
