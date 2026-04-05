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
              "relative flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300",
              isActive
                ? "bg-white text-ink-900 shadow-sm ring-1 ring-ink-200/50"
                : "text-ink-500 hover:bg-white/70 hover:text-ink-800"
            )}
          >
            <Icon
              strokeWidth={isActive ? 2.2 : 1.8}
              size={16}
              className={cn(
                "h-4 w-4 transition-colors duration-200",
                isActive ? "text-amber-600" : "text-ink-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium leading-none",
                isActive ? "font-semibold text-ink-900" : "font-medium text-ink-600"
              )}
            >
              {label}
            </span>
            {/* Active indicator bar */}
            <span
              className={cn(
                "absolute bottom-0 left-3 right-3 h-0.5 origin-center rounded-full bg-amber-500 transition-all duration-300",
                isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              )}
            />
          </div>
        )}
      </NavLink>
    </li>
  );
}
