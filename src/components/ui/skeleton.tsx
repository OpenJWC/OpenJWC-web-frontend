import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-ink-100 via-ink-200 to-ink-100 bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
