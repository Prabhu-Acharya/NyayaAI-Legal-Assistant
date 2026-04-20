import { NavLink, Outlet } from "react-router-dom";
import { MessageCircle, FileText, User, LogOut } from "lucide-react";

const navLinks = [
  { to: "/dashboard",           label: "Legal Assistant",    icon: MessageCircle, end: true },
  { to: "/dashboard/contracts", label: "Contract Generator", icon: FileText },
  { to: "/dashboard/profile",   label: "Profile",            icon: User },
];

const DashboardLayout = ({ onLogout }) => (
  <div className="h-screen flex">
    <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-4 text-lg font-bold border-b border-gray-700">
        ⚖️ NyayaAI
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-500 text-black font-medium"
                  : "text-gray-300 hover:bg-gray-700"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;