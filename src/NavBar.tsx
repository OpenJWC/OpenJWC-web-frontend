import {
  LayoutDashboard,
  LogOut,
  Logs,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "./store/authSlice";
import { useAppDispatch } from "./store/hooks";
import NavItem from "./NavItem";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/logs", label: "Logs", icon: Logs },
  { to: "/reviews", label: "Reviews", icon: MessageSquareText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/users", label: "Users", icon: Users },
];

export default function NavBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-ink-200/50 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[90rem] px-6 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-ink-200/60 bg-white px-5 py-2.5 shadow-nav">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/src/assets/icon_test.png" alt="OPENJWC" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            <span className="font-display text-xl tracking-wide text-ink-900">
              OPENJWC
            </span>
          </div>

          {/* Navigation */}
          <ul className="flex items-center gap-0.5 rounded-2xl bg-ink-100/60 p-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
              />
            ))}
          </ul>

          {/* Logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-all duration-200 hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900 active:scale-[0.98]"
            >
              <LogOut size={15} />
              退出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
