import apiClient from './client'
import type { EnterpriseRisk, EALResult, RiskCalculation, RiskTrend, ScenarioResult } from '../types/risk'

export const riskApi = {
  calculateAsset: (assetId: string) =>
    apiClient.post<RiskCalculation>(`/risk/calculate?asset_id=${assetId}`),

  calculateAll: () => apiClient.post('/risk/calculate-all'),

  getScore: () => apiClient.get<EnterpriseRisk>('/risk/score'),

  getEAL: () => apiClient.get<EALResult>('/risk/eal'),

  getDrivers: (limit = 10) => apiClient.get(`/risk/drivers?limit=${limit}`),

  getTrends: (days = 30) => apiClient.get<RiskTrend>(`/risk/trends?days=${days}`),

  simulateScenario: (changes: Record<string, unknown>[]) =>
    apiClient.post<ScenarioResult>('/risk/scenario/simulate', { changes }),

  sendEvent: (event: { event_type: string; asset_id?: string; source: string; details: Record<string, unknown> }) =>
    apiClient.post('/risk/event', event),

  getAssetRisk: (assetId: string) =>
    apiClient.get<RiskCalculation>(`/risk/asset/${assetId}`),

  getRiskGraph: () => apiClient.get('/risk/graph'),

  getBlastRadius: (assetId: string) =>
    apiClient.get(`/risk/blast-radius/${assetId}`),

  getAttackPath: () => apiClient.get('/risk/attack-path'),

  getDataQuality: () => apiClient.get('/risk/data-quality'),

  getDataQualityForAsset: (assetId: string) =>
    apiClient.get(`/risk/data-quality/${assetId}`),

  getLossDistribution: (simulations = 5000) =>
    apiClient.get(`/risk/loss-distribution?simulations=${simulations}`),

  getCompliance: () => apiClient.get('/risk/compliance'),

  getForecast: (horizonMonths = 12) =>
    apiClient.get(`/risk/forecast?horizon_months=${horizonMonths}`),

  createSnapshot: () => apiClient.post('/risk/snapshot'),

  getSnapshots: () => apiClient.get('/risk/snapshots'),

  getAuditChain: () => apiClient.get('/risk/audit/chain'),

  verifyAuditChain: () => apiClient.get('/risk/audit/verify'),
}
