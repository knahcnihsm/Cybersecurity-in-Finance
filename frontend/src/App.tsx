import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useRiskStore } from '@/store/riskStore'
import { useWebSocket, type WSMessage } from '@/hooks/useWebSocket'
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

type RiskUpdate = {
  assetId?: string
  assetName?: string
  message?: string
  delta?: number
  currentRisk?: number
  previousRisk?: number
}

function handleLiveMessage(msg: WSMessage) {
  const notifications = useNotificationStore.getState()
  const risk = useRiskStore.getState()

  if (msg.type === 'risk:updated') {
    const p = msg.payload as RiskUpdate
    const title = p.assetName || p.assetId || 'asset'
    const delta = typeof p.delta === 'number' ? p.delta : 0
    notifications.addNotification(
      delta > 0 ? 'warning' : 'success',
      p.message || `Risk changed by ₹${delta.toLocaleString('en-IN')} for ${title}`,
    )
    risk.fetchRiskScore()
    risk.fetchEAL()
    risk.fetchTrends()
  } else if (msg.type === 'ingestion:event') {
    notifications.addNotification('info', 'New security event ingested')
  }
}

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

  useWebSocket(handleLiveMessage)

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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  )
}
