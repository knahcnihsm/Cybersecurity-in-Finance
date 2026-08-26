import { useState, useEffect, useCallback } from 'react'
import { riskApi } from '@/api/riskApi'
import { vulnerabilityApi } from '@/api/vulnerabilityApi'
import { controlApi } from '@/api/controlApi'
import type { EnterpriseRisk, EALResult, RiskTrend } from '@/types/risk'
import type { Vulnerability } from '@/types/vulnerability'

interface RiskDataState {
  enterpriseRisk: EnterpriseRisk | null
  eal: EALResult | null
  trends: RiskTrend | null
  vulnerabilities: Vulnerability[]
  loading: boolean
  error: string | null
}

export function useRiskData() {
  const [state, setState] = useState<RiskDataState>({
    enterpriseRisk: null,
    eal: null,
    trends: null,
    vulnerabilities: [],
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [scoreRes, ealRes, trendRes, vulnRes] = await Promise.all([
        riskApi.getScore(),
        riskApi.getEAL(),
        riskApi.getTrends(),
        vulnerabilityApi.list({ page: 1, size: 10 }),
      ])
      setState({
        enterpriseRisk: scoreRes.data,
        eal: ealRes.data,
        trends: trendRes.data,
        vulnerabilities: vulnRes.data.data,
        loading: false,
        error: null,
      })
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.response?.data?.detail || 'Failed to load risk data',
      }))
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refresh: fetch }
}
