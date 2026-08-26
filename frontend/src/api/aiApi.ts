import apiClient from './client'
import type { AIQueryResponse, AIRecommendation, AIExplainResponse } from '../types/api'

export const aiApi = {
  query: (question: string) =>
    apiClient.post<AIQueryResponse>('/ai/query', { question }),

  getRecommendations: () =>
    apiClient.get<AIRecommendation>('/ai/recommendations'),

  explainAsset: (assetId: string) =>
    apiClient.get<AIExplainResponse>(`/ai/explain/${assetId}`),
}
