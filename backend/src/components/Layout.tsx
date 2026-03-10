import { NavLink, Outlet } from "react-router-dom";
import { useLeadsToCall } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/to-call", icon: PhoneCall, label: "À rappeler" },
];

export function Layout() {
  const { data: toCallData } = useLeadsToCall({ page_size: 1 });
  const toCallCount = toCallData?.total ?? 0;
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-4">
          <Dumbbell className="h-6 w-6 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-gray-900">CrossFit Avignon</p>
            <p className="text-xs text-gray-400">CRM</p>
          </div>
        </div>

        <nav className="flex-1 p-2">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {label === "À rappeler" && toCallCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                  {toCallCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer : utilisateur + logout */}
        <div className="border-t border-gray-100 p-3">
          {user && (
            <p
              className="mb-2 truncate px-1 text-xs text-gray-400"
              title={user.email}
            >
              {user.email}
            </p>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
