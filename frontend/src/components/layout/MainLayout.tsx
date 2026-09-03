import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWSConnectionState } from "@/hooks/useWebSocket";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Server,
  Bug,
  LineChart,
  Bot,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/security", icon: Shield, label: "Security" },
  { to: "/risk", icon: AlertTriangle, label: "Risk Analysis" },
  { to: "/assets", icon: Server, label: "Assets" },
  { to: "/vulnerabilities", icon: Bug, label: "Vulnerabilities" },
  { to: "/simulator", icon: LineChart, label: "Simulator" },
  { to: "/investment", icon: DollarSign, label: "Investment" },
  { to: "/ai", icon: Bot, label: "AI Assistant" },
];

const connectionStyle: Record<
  string,
  { dot: string; label: string; text: string }
> = {
  LIVE: { dot: "bg-status-live", label: "LIVE", text: "text-status-live" },
  CONNECTING: {
    dot: "bg-status-medium animate-pulse",
    label: "CONNECTING",
    text: "text-status-medium",
  },
  RECONNECTING: {
    dot: "bg-status-medium animate-pulse",
    label: "RECONNECTING",
    text: "text-status-medium",
  },
  DISCONNECTED: {
    dot: "bg-status-critical",
    label: "DISCONNECTED",
    text: "text-status-critical",
  },
};

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const wsState = useWSConnectionState();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const conn = connectionStyle[wsState] ?? connectionStyle.DISCONNECTED;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-app">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-[232px] border-r border-border-subtle bg-bg-sidebar text-white transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[148px] items-center justify-between px-8">
          <div className="flex flex-1 items-center justify-center py-6">
            <img
              src="/logo.png"
              alt="CyberRisk Twin"
              className="h-[100px] w-auto object-contain"
            />
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 space-y-0.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "relative flex h-[34px] items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-bg-surface text-text-primary"
                    : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-accent-primary" />
                  )}
                  <item.icon
                    className="h-4 w-4 flex-shrink-0"
                    strokeWidth={1.75}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border-subtle p-3">
          <button
            onClick={handleLogout}
            className="flex h-[34px] w-full items-center gap-3 rounded-md px-3 text-[13px] font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[60px] items-center justify-between border-b border-border-subtle bg-bg-sidebar px-5">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-text-secondary" />
          </button>

          <div className="flex-1" />

          <div className="mr-3 hidden items-center gap-1.5 rounded-full border border-border-default bg-bg-surface px-2.5 py-1 sm:flex">
            <span className={clsx("h-2 w-2 rounded-full", conn.dot)} />
            <span
              className={clsx(
                "text-[11px] font-semibold tracking-wide",
                conn.text,
              )}
            >
              {conn.label}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-bg-hover"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/15 text-xs font-bold text-accent-primary">
                {user?.full_name?.charAt(0) ?? "U"}
              </div>
              <span className="hidden font-medium text-text-primary md:block">
                {user?.full_name ?? "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border-default bg-bg-elevated py-1 shadow-modal">
                  <div className="border-b border-border-subtle px-4 py-3">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-text-tertiary">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-critical hover:bg-bg-hover"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
