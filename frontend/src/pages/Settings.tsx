import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { User, Bell, Palette, Code, Info } from 'lucide-react'
import { clsx } from 'clsx'

type Section = 'profile' | 'notifications' | 'theme' | 'api' | 'about'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [wsEnabled, setWsEnabled] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { key: 'theme', label: 'Theme', icon: <Palette className="h-4 w-4" /> },
    { key: 'api', label: 'API Configuration', icon: <Code className="h-4 w-4" /> },
    { key: 'about', label: 'About', icon: <Info className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <nav className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeSection === s.key
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                    {user?.fullName?.charAt(0) ?? 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.fullName}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      defaultValue={user?.username}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      defaultValue={user?.role}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                  </div>
                </div>
                <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">WebSocket Real-time Alerts</p>
                    <p className="text-xs text-gray-500">Receive real-time security event notifications</p>
                  </div>
                  <button
                    onClick={() => setWsEnabled(!wsEnabled)}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors',
                      wsEnabled ? 'bg-brand-600' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        wsEnabled && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Alerts</p>
                    <p className="text-xs text-gray-500">Get email notifications for critical events</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors',
                      emailAlerts ? 'bg-brand-600' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                        emailAlerts && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'theme' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Theme</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setDarkMode(false)}
                  className={clsx(
                    'flex-1 rounded-xl border-2 p-4 text-center transition-colors',
                    !darkMode ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="mx-auto mb-2 flex h-12 w-20 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Palette className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Light</span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={clsx(
                    'flex-1 rounded-xl border-2 p-4 text-center transition-colors',
                    darkMode ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="mx-auto mb-2 flex h-12 w-20 items-center justify-center rounded-lg bg-gray-900 shadow-sm">
                    <Palette className="h-6 w-6 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Dark</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value={import.meta.env.VITE_API_BASE_URL || '/api'}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    WebSocket URL
                  </label>
                  <input
                    type="text"
                    value={`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">About</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span>Application</span>
                  <span className="font-medium text-gray-900">CyberRisk Quantifier</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span>Version</span>
                  <span className="font-medium text-gray-900">0.1.0</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span>Framework</span>
                  <span className="font-medium text-gray-900">React 18 + TypeScript</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span>Build</span>
                  <span className="font-medium text-gray-900">Vite 5</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
