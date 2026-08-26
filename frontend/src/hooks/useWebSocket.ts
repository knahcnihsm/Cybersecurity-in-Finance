import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'

type WSMessage = {
  type: string
  payload: unknown
}

type WSCallback = (msg: WSMessage) => void

const listeners = new Set<WSCallback>()

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

function connect() {
  const token = useAuthStore.getState().token
  if (!token) return
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  ws = new WebSocket(`${protocol}//${host}/ws?token=${token}`)

  ws.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data)
      listeners.forEach((cb) => cb(msg))
    } catch {}
  }

  ws.onclose = () => {
    reconnectTimer = setTimeout(connect, 5000)
  }

  ws.onerror = () => {
    ws?.close()
  }
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

  const send = useCallback((msg: WSMessage) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  return { send }
}
