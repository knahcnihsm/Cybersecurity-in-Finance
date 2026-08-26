import apiClient from './client'
import type { OptimizeResult, InvestmentItem, ROSIResult, InvestmentPlan, SecurityControl } from '../types/investment'

export const investmentApi = {
  optimize: (data: {
    budget_inr: number
    time_horizon_years?: number
    max_per_control_percent?: number
  }) => apiClient.post<OptimizeResult>('/investment/optimize', data),

  listControls: () => apiClient.get<SecurityControl[]>('/investment/controls'),

  getROSI: (controlId: string, params?: { time_horizon_years?: number }) =>
    apiClient.get<ROSIResult>(`/investment/controls/${controlId}/rosi`, { params }),

  createPlan: (data: {
    name: string
    total_budget_inr: number
    items: { control_id: string; allocation_inr: number }[]
  }) => apiClient.post<InvestmentPlan>('/investment/plans', data),

  listPlans: () => apiClient.get<InvestmentPlan[]>('/investment/plans'),

  getPlan: (planId: string) => apiClient.get<InvestmentPlan>(`/investment/plans/${planId}`),
}
