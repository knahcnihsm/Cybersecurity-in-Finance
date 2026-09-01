import { useRiskData } from '@/hooks/useRiskData'
import RiskScoreCard from '@/components/dashboard/RiskScoreCard'
import EALCard from '@/components/dashboard/EALCard'
import BudgetCard from '@/components/dashboard/BudgetCard'
import TopRiskCard from '@/components/dashboard/TopRiskCard'
import VulnerabilityPieChart from '@/components/charts/VulnerabilityPieChart'
import RiskTrendChart from '@/components/charts/RiskTrendChart'
import RecentEventsFeed from '@/components/dashboard/RecentEventsFeed'
import FinancialExposureChart from '@/components/charts/FinancialExposureChart'
import DataQualityCard from '@/components/insights/DataQualityCard'
import LossDistributionCard from '@/components/insights/LossDistributionCard'
import ComplianceCard from '@/components/insights/ComplianceCard'
import AuditChainPanel from '@/components/insights/AuditChainPanel'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function ExecutiveDashboard() {
  const { enterpriseRisk, eal, trends, loading, error } = useRiskData()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="cyber-card p-6 text-center text-status-critical">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Executive Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <RiskScoreCard score={enterpriseRisk?.enterprise_risk_score ?? 0} />
        <EALCard eal={eal?.total_eal ?? 0} />
        <BudgetCard allocated={0} total={10000000} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopRiskCard drivers={enterpriseRisk?.top_risk_drivers ?? []} />
        </div>
        <div className="cyber-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Vulnerability Distribution</h3>
          <VulnerabilityPieChart />
        </div>
      </div>

      <RiskTrendChart data={trends} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataQualityCard />
        <LossDistributionCard />
        <ComplianceCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentEventsFeed />
        <FinancialExposureChart />
      </div>

      <AuditChainPanel />
    </div>
  )
}
