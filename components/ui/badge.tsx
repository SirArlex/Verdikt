import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary/50 text-muted-foreground",
        positive:
          "border-agent-liquidity/40 bg-agent-liquidity/10 text-agent-liquidity",
        neutral:
          "border-agent-volatility/40 bg-agent-volatility/10 text-agent-volatility",
        negative: "border-red-500/40 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
