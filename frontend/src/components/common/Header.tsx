import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, BarChart3, Settings, Shield,
  Menu, X, ChevronRight, Bell, User, LogOut, FileSearch
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClaimStore } from '@/store/useClaimStore'

interface HeaderProps {
  currentPage: 'landing' | 'dashboard'
  onNavigateHome: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'claims', label: 'Claims History', icon: FolderOpen },
  { id: 'analysis', label: 'Analytics', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileSearch },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigateHome }) => {
  const { isSidebarOpen, toggleSidebar, report, hasSeenIntro } = useClaimStore()
  const [activeNav, setActiveNav] = React.useState('dashboard')

  if (currentPage === 'landing') {
    return (
      <motion.header 
        initial={{ borderBottomColor: 'rgba(255,255,255,0)' }}
        animate={{ borderBottomColor: hasSeenIntro ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0)' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/30 transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          {/* Logo - Uses layoutId to catch the logo flying from the center */}
          <div className="flex-1">
            {hasSeenIntro && (
              <motion.div
                layoutId="app-logo"
                className="flex items-center gap-2.5 cursor-pointer origin-left inline-flex"
                onClick={onNavigateHome}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-white" size={18} />
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden">
                  ClaimGuard <span className="text-blue-600">AI</span>
                </span>
              </motion.div>
            )}
          </div>

          {/* Nav links and Actions - Fade in after intro */}
          <AnimatePresence>
            {hasSeenIntro && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center flex-1 justify-end gap-8"
              >
                <nav className="hidden md:flex items-center gap-6">
                  <button
                    onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => document.getElementById('infrastructure-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Infrastructure
                  </button>
                </nav>

                <div className="flex items-center gap-3">
                  <button className="text-sm text-gray-700 hover:text-gray-900 font-medium px-3 py-1.5 transition-colors">
                    Sign In
                  </button>
                  <button 
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all duration-150 shadow-lg shadow-blue-600/30 cursor-pointer select-none"
                  >
                    Submit Claim
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    )
  }

  // Dashboard layout sidebar
  return (
    <>
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        <motion.aside
          key="sidebar"
          initial={{ width: 240 }}
          animate={{ width: isSidebarOpen ? 240 : 64 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed left-0 top-0 h-screen bg-[#1E1B4B] border-r border-indigo-900/50 z-40 flex flex-col overflow-hidden"
        >
          {/* Logo area */}
          <div className="h-16 flex items-center px-4 border-b border-indigo-900/40 flex-shrink-0">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNavigateHome}>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-white" />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-bold text-white whitespace-nowrap"
                  >
                    ClaimGuard <span className="text-blue-400">AI</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeNav === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-indigo-300 hover:bg-indigo-800/50 hover:text-white'
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && isSidebarOpen && (
                    <ChevronRight size={14} className="ml-auto text-blue-200" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="px-2 py-3 border-t border-indigo-900/40 flex-shrink-0">
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-indigo-300 hover:bg-indigo-800/50 cursor-pointer transition-all duration-150'
            )}>
              <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-xs font-semibold text-white truncate">Investigator</p>
                    <p className="text-[10px] text-indigo-400 truncate">SIU Team Lead</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Top header bar for dashboard */}
      <motion.header
        animate={{ left: isSidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 z-30 flex items-center px-6 gap-4"
        style={{ left: isSidebarOpen ? 240 : 64 }}
      >
        {/* Toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Dashboard</span>
          {report && (
            <>
              <ChevronRight size={14} />
              <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                {report.claim_id}
              </span>
            </>
          )}
        </div>

        {/* Right: notifications + user */}
        <div className="ml-auto flex items-center gap-3">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer">
            <User size={15} className="text-white" />
          </div>
        </div>
      </motion.header>
    </>
  )
}
