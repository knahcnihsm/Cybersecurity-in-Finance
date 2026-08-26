import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/LoginPage'
import ExecutiveDashboard from '@/pages/ExecutiveDashboard'
import SecurityDashboard from '@/pages/SecurityDashboard'
import RiskAnalysis from '@/pages/RiskAnalysis'
import AssetManagement from '@/pages/AssetManagement'
import VulnerabilityManagement from '@/pages/VulnerabilityManagement'
import ScenarioSimulator from '@/pages/ScenarioSimulator'
import InvestmentOptimizer from '@/pages/InvestmentOptimizer'
import AIAssistant from '@/pages/AIAssistant'
import Settings from '@/pages/Settings'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppContent() {
  const { initialize, loading } = useAuthStore()

  useWebSocket()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ExecutiveDashboard />} />
        <Route path="security" element={<SecurityDashboard />} />
        <Route path="risk" element={<RiskAnalysis />} />
        <Route path="assets" element={<AssetManagement />} />
        <Route path="vulnerabilities" element={<VulnerabilityManagement />} />
        <Route path="simulator" element={<ScenarioSimulator />} />
        <Route path="investment" element={<InvestmentOptimizer />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
