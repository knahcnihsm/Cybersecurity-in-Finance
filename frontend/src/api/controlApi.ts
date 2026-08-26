import apiClient from './client'
import type { SecurityControl } from '../types/investment'

interface ControlAsset {
  asset_id: string
  asset_name: string
  status: string
  applied_at: string | null
}

interface ControlEffectiveness {
  control_id: string
  assets_covered: number
  total_assets: number
  risk_reduction_achieved: number
  risk_reduction_potential: number
}

interface ControlCoverage {
  total_controls: number
  assets_with_controls: number
  total_assets: number
  coverage_percent: number
}

export const controlApi = {
  list: (params?: { type?: string; page?: number; size?: number }) =>
    apiClient.get<{ data: SecurityControl[]; total: number }>('/controls', { params }),

  create: (data: Partial<SecurityControl>) =>
    apiClient.post<SecurityControl>('/controls', data),

  getByAsset: (assetId: string) =>
    apiClient.get<ControlAsset[]>(`/controls/asset/${assetId}`),

  getEffectiveness: (controlId: string) =>
    apiClient.get<ControlEffectiveness>(`/controls/${controlId}/effectiveness`),

  getCoverage: () =>
    apiClient.get<ControlCoverage>('/controls/coverage'),

  updateStatus: (controlId: string, assetId: string, status: string) =>
    apiClient.put(`/controls/${controlId}/asset/${assetId}/status`, { status }),
}
