import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive" | "success" | "warning";
};

const variantStyles = {
  default: "border-ink-200 bg-white text-ink-800",
  destructive: "border-red-200 bg-red-50/80 text-red-800",
  success: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
  warning: "border-amber-200 bg-amber-50/80 text-amber-800",
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "relative w-full rounded-xl border p-4 text-sm font-sans animate-scale-in",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-none tracking-tight text-ink-900", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-ink-600", className)} {...props} />;
}
