import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/store/authStore'

export type WSMessage = {
  type: string
  payload: unknown
}

export type WSConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'LIVE'

type WSCallback = (msg: WSMessage) => void

const listeners = new Set<WSCallback>()

let client: Client | null = null

const connectionListeners = new Set<(state: WSConnectionState) => void>()

function emitConnectionState(state: WSConnectionState) {
  connectionListeners.forEach((cb) => cb(state))
}

export function useWSConnectionState(): WSConnectionState {
  const [state, setState] = useState<WSConnectionState>('DISCONNECTED')

  useEffect(() => {
    const cb = (s: WSConnectionState) => setState(s)
    connectionListeners.add(cb)
    if (client) {
      if (client.connected) setState('LIVE')
      else if (client.active) setState('RECONNECTING')
    }
    return () => {
      connectionListeners.delete(cb)
    }
  }, [])

  return state
}

function connect() {
  const token = useAuthStore.getState().token
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  const sock = new SockJS(`${protocol}//${window.location.host}/ws`)

  client = new Client({
    webSocketFactory: () => sock,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    onConnect: () => {
      emitConnectionState('LIVE')
      client?.subscribe('/topic/risk/updated', (message) => {
        try {
          const payload = JSON.parse(message.body)
          listeners.forEach((cb) => cb({ type: 'risk:updated', payload }))
        } catch {}
      })
      client?.subscribe('/topic/ingestion/event', (message) => {
        try {
          const payload = JSON.parse(message.body)
          listeners.forEach((cb) => cb({ type: 'ingestion:event', payload }))
        } catch {}
      })
    },
    onWebSocketClose: () => {
      emitConnectionState('RECONNECTING')
    },
    onStompError: () => {
      emitConnectionState('RECONNECTING')
    },
  })
  emitConnectionState('CONNECTING')
  client.activate()
}

function disconnect() {
  emitConnectionState('DISCONNECTED')
  client?.deactivate()
  client = null
}

export function useWebSocket(onMessage?: WSCallback) {
  const initialized = useRef(false)

  useEffect(() => {
    if (onMessage) listeners.add(onMessage)
    if (!initialized.current) {
      initialized.current = true
      connect()
    }
    return () => {
      if (onMessage) listeners.delete(onMessage)
    }
  }, [onMessage])

  useEffect(() => {
    return () => {
      if (listeners.size === 0) disconnect()
    }
  }, [])

  const send = useCallback((msg: WSMessage) => {
    client?.publish({ destination: '/app/subscribe', body: JSON.stringify(msg.payload ?? msg.type) })
  }, [])

  return { send }
}