import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const inputClass =
  'h-10 w-full rounded-[6px] border border-border-default bg-bg-input px-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary'

const animationCss = `
@keyframes crtFadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes crtFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.crt-fade-up { animation: crtFadeSlideUp 0.22s ease both; }
.crt-fade-in { animation: crtFadeIn 0.2s ease both; }
`

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, isAuthenticated } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch {}
  }

  return (
    <div className="relative flex min-h-screen bg-bg-app">
      <style>{animationCss}</style>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 540px at 12% -8%, rgba(56,189,248,0.05), transparent 62%)',
        }}
      />

      <div className="hidden w-1/2 flex-col justify-center border-r border-border-subtle px-16 lg:flex xl:px-24">
        <div className="max-w-md">
          <img
            src="/logo.png"
            alt="CyberRisk Twin"
            className="crt-fade-up h-auto w-full max-w-[340px]"
          />
          <h1 className="crt-fade-in mt-10 text-[22px] font-semibold tracking-tight text-text-primary">
            CyberRisk Twin
          </h1>
          <p className="crt-fade-in mt-1 text-sm text-text-secondary">
            Continuous Cyber Risk Intelligence
          </p>
          <p className="crt-fade-in mt-6 max-w-sm text-[13px] leading-relaxed text-text-tertiary">
            Enterprise cyber risk quantification — model, forecast, and communicate exposure
            across assets, controls, and investment decisions.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="crt-fade-up mb-10 text-center lg:hidden">
            <img
              src="/logo.png"
              alt="CyberRisk Twin"
              className="mx-auto h-auto w-[220px]"
            />
            <h1 className="mt-4 text-lg font-semibold tracking-tight text-text-primary">
              CyberRisk Twin
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary">Continuous Cyber Risk Intelligence</p>
          </div>

          <div className="crt-fade-in rounded-[8px] border border-border-default bg-bg-surface p-8 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-primary">
              Secure Access
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
              Sign in to CyberRisk Twin
            </h2>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className="block text-[13px] font-medium text-text-secondary">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className={`${inputClass} mt-2`}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[13px] font-medium text-text-secondary">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={`${inputClass} pr-10`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-text-secondary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-status-critical/30 bg-status-critical/10 p-3 text-sm text-status-critical">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-accent-primary text-[13px] font-semibold text-[#04131A] transition-all duration-150 hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <LoadingSpinner size="sm" className="border-[#04131A] border-t-transparent" /> : null}
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}