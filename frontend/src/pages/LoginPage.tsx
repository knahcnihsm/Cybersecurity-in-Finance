import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Shield } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const inputClass =
  "h-10 w-full rounded-[6px] border border-border-default bg-bg-input px-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const animationCss = `
@keyframes crtFadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes crtFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes orbDriftA {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(9vw, -6vh, 0) scale(1.15); }
  100% { transform: translate3d(-4vw, 5vh, 0) scale(0.92); }
}
@keyframes orbDriftB {
  0%   { transform: translate3d(0, 0, 0) scale(1.05); }
  50%  { transform: translate3d(-8vw, 4vh, 0) scale(0.9); }
  100% { transform: translate3d(6vw, -5vh, 0) scale(1.12); }
}
@keyframes orbDriftC {
  0%   { transform: translate3d(0, 0, 0) scale(0.95); }
  50%  { transform: translate3d(5vw, 7vh, 0) scale(1.1); }
  100% { transform: translate3d(-6vw, -4vh, 0) scale(0.98); }
}
.crt-fade-up { animation: crtFadeSlideUp 0.22s ease both; }
.crt-fade-in { animation: crtFadeIn 0.2s ease both; }
.orb-a { animation: orbDriftA 38s ease-in-out infinite; }
.orb-b { animation: orbDriftB 52s ease-in-out infinite; }
.orb-c { animation: orbDriftC 64s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .orb-a, .orb-b, .orb-c { animation: none; }
}
`;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: string;
};

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const LINK_DIST = 110;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

    const setupParticles = () => {
      const target = Math.min(90, Math.floor((width * height) / 16000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.3 + 0.6,
        hue: Math.random() < 0.75 ? "#38BDF8" : "#818CF8",
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setupParticles();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      const n = particles.length;

      for (let i = 0; i < n; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        const a = particles[i];
        for (let j = i + 1; j < n; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST_SQ) {
            const t = 1 - Math.sqrt(d2) / LINK_DIST;
            ctx.strokeStyle = `rgba(56, 189, 248, ${(t * 0.16).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < n; i++) {
        const p = particles[i];
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = p.hue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
      }
    };

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {}
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-bg-app">
      <style>{animationCss}</style>

      {/* Radial depth + gradient orbs + particles */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 540px at 12% -8%, rgba(56,189,248,0.07), transparent 62%), radial-gradient(800px 520px at 92% 108%, rgba(129,140,248,0.06), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute -left-32 top-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-[90px] orb-a" />
      <div className="pointer-events-none absolute right-[-8%] top-[30%] h-[380px] w-[380px] rounded-full bg-blue-500/20 blur-[100px] orb-b" />
      <div className="pointer-events-none absolute bottom-[-12%] left-[30%] h-[360px] w-[360px] rounded-full bg-indigo-500/15 blur-[100px] orb-c" />
      <ParticleField />

      {/* Left pane */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-center lg:flex lg:pl-[140px] xl:pl-[160px]">
        <div className="max-w-md">
          <img
            src="/logo.png"
            alt="CyberRisk Twin"
            className="crt-fade-up h-auto w-full max-w-[340px]"
          />
          <h1 className="crt-fade-in mt-10 text-[30px] font-semibold leading-tight tracking-tight text-text-primary">
            Quantify Your Cyber Risk.
          </h1>
          <p className="crt-fade-in mt-3 max-w-sm text-[15px] leading-relaxed text-text-secondary">
            Model exposure. Forecast impact. Make better investment decisions.
          </p>
        </div>
      </div>

      {/* Right pane */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="crt-fade-up mb-8 text-center lg:hidden">
            <img
              src="/logo.png"
              alt="CyberRisk Twin"
              className="mx-auto h-auto w-[180px]"
            />
            <h1 className="mt-3 text-base font-semibold tracking-tight text-text-primary">
              Quantify Your Cyber Risk.
            </h1>
            <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-snug text-text-secondary">
              Model exposure. Forecast impact. Make better investment decisions.
            </p>
          </div>

          <div className="crt-fade-in rounded-[10px] border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-primary">
                Secure Access
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-[13px] font-medium text-text-secondary"
                >
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
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-text-secondary"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                {loading ? (
                  <LoadingSpinner
                    size="sm"
                    className="border-[#04131A] border-t-transparent"
                  />
                ) : null}
                Access Dashboard →
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-1.5 border-t border-white/5 pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-status-low shadow-[0_0_6px_rgba(34,197,94,0.9)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-tertiary">
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
