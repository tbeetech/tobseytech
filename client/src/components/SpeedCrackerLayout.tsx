import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Zap,
  LayoutDashboard,
  GitBranch,
  CheckSquare,
  Video,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/admin/speed-cracker", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/speed-cracker/workflows", label: "Workflows", icon: GitBranch },
  { path: "/admin/speed-cracker/approval-center", label: "Approval Center", icon: CheckSquare },
  { path: "/admin/speed-cracker/vlog", label: "Vlog", icon: Video },
  { path: "/admin/speed-cracker/blog-manager", label: "Blog Manager", icon: FileText },
  { path: "/admin/speed-cracker/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/speed-cracker/settings", label: "Settings", icon: Settings },
];

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function SpeedCrackerLayout({ children, title, subtitle }: Props) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400">This area is restricted to Arcolyte Technologies administrators only.</p>
          <Link href="/dashboard">
            <span className="text-neon-cyan underline cursor-pointer">Go to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin/speed-cracker">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="font-bold text-sm text-white leading-none">SPEED CRACKER</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin System</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact ? location === path : location.startsWith(path);
            return (
              <Link key={path} href={path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all",
                    isActive
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Admin badge */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
              {user.username[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white truncate font-medium">{user.displayName || user.username}</p>
              <p className="text-[10px] text-yellow-400 uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                Admin Only
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
