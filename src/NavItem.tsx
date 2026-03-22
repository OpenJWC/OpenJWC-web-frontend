import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./lib/utils";
type NavItemProps = {
  to: string;
  icon: ComponentType<{
    className?: string;
    size?: string | number;
    strokeWidth?: string | number;
  }>;
  label: string;
  end?: boolean;
};
export default function NavItem({ to, icon: Icon, label, end }: NavItemProps) {
  return (
    <li>
      <NavLink to={to} end={end}>
        {({ isActive }) => (
          <div
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300",
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
            )}
          >
            <Icon
              strokeWidth={isActive ? 2.4 : 1.8}
              size={16}
              className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-600" : "text-slate-500")}
            />
            <span className="relative inline-grid whitespace-nowrap leading-none">
              <span className="invisible font-bold">{label}</span>
              <span
                className={cn(
                  "absolute inset-0",
                  isActive ? "font-bold text-slate-900" : "font-medium text-slate-600"
                )}
              >
                {label}
              </span>
            </span>
            <span
              className={cn(
                "absolute left-2 right-2 -bottom-1 h-0.5 origin-center rounded-full bg-blue-600 transition-transform duration-300",
                isActive ? "scale-x-100" : "scale-x-0"
              )}
            />
          </div>
        )}
      </NavLink>
    </li>
  );
}
