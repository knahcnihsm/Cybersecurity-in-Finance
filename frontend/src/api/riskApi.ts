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
}
