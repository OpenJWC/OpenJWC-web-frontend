import {
  LayoutDashboard,
  LogOut,
  Logs,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import iconTest from "./assets/icon_test.png";
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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 bg-slate-50/80 backdrop-blur">
      <div className="mx-auto w-full max-w-[90rem] px-8 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img src={iconTest} alt="OPENJWC" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-sm font-semibold tracking-wide text-slate-900">
              OPENJWC
            </span>
          </div>
          <ul className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <LogOut size={14} />
              退出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
