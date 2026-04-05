import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Size variants
        size === "sm" && "h-8 px-3 text-xs rounded-lg",
        size === "md" && "h-10 px-4 text-sm rounded-xl",
        size === "lg" && "h-12 px-6 text-base rounded-xl",
        // Style variants
        variant === "default" &&
          "bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98] shadow-sm hover:shadow",
        variant === "outline" &&
          "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-300 active:scale-[0.98]",
        variant === "ghost" &&
          "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-sm",
        className
      )}
      {...props}
    />
  );
}
