import React, { useState } from 'react'
import { Header } from '@/components/common/Header'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { useClaimStore } from '@/store/useClaimStore'
import { cn } from '@/lib/utils'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing')
  const { isSidebarOpen } = useClaimStore()

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
    window.scrollTo(0, 0)
  }

  const navigateToHome = () => {
    setCurrentPage('landing')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
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
  )
}

export default App
