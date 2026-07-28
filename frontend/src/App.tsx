import React, { useState } from 'react'
import { Header } from '@/components/common/Header'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { useClaimStore } from '@/store/useClaimStore'
import { cn } from '@/lib/utils'
import { Interactive3DBackground } from "@/components/background"

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing')
  const { isSidebarOpen, isProcessing, report, processingSteps } = useClaimStore()

  // Determine background state
  let agentStatus: "idle" | "processing" | "success" | "warning" | "error" = "idle";
  if (isProcessing) {
    agentStatus = "processing";
    if (processingSteps.length > 0 && processingSteps[processingSteps.length - 1].step === 'FAILED') {
      agentStatus = "error";
    }
  } else if (report) {
    const risk = report.risk_level;
    if (risk === "CRITICAL") agentStatus = "error";
    else if (risk === "HIGH" || risk === "MEDIUM") agentStatus = "warning";
    else agentStatus = "success";
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
    window.scrollTo(0, 0)
  }

  const navigateToHome = () => {
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <Interactive3DBackground state={agentStatus} intensity={0.8} interactive />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          currentPage={currentPage}
          onNavigateHome={navigateToHome}
        />

        <main
          className={cn(
            'flex-1 transition-all duration-200 flex flex-col',
            currentPage === 'dashboard'
              ? isSidebarOpen
                ? 'ml-[240px] pt-16' // Sidebar width + header height
                : 'ml-[64px] pt-16' // Collapsed sidebar width + header height
              : 'pt-0' // Landing page handles its own padding
          )}
        >
          {currentPage === 'landing' ? (
            <LandingPage onNavigateToDashboard={navigateToDashboard} />
          ) : (
            <DashboardPage onNavigateBack={navigateToHome} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
