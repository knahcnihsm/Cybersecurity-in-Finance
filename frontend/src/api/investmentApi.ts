import apiClient from './client'
import type { OptimizeResult, InvestmentItem, ROSIResult, InvestmentPlan, SecurityControl } from '../types/investment'

export const investmentApi = {
  optimize: (data: {
    budget_inr: number
    time_horizon_years?: number
    max_per_control_percent?: number
  }) => apiClient.post<OptimizeResult>('/investment/optimize', data),

  listControls: () => apiClient.get<SecurityControl[]>('/investment/controls'),

  getROSSummary: (params?: { time_horizon_years?: number }) =>
    apiClient.get<ROSIResult[]>('/investment/rosi', { params }),

  createPlan: (data: {
    name: string
    budget_inr: number
    items: { control_id: string; allocation_inr: number; risk_reduction?: number; expected_rosi?: number; priority?: number }[]
  }) => apiClient.post<{ id: string; name: string; status: string; created_at: string }>('/investment/plans', data),

  listPlans: () => apiClient.get<InvestmentPlan[]>('/investment/plans'),

  getPlan: (planId: string) => apiClient.get<InvestmentPlan>(`/investment/plans/${planId}`),
}
