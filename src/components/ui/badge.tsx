import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#C27D3D]/30 bg-[rgba(194,125,61,0.15)] text-[#D99A5B]",
        secondary: "border-[#27272A] bg-[#18181B] text-zinc-300",
        outline: "border-[#27272A] bg-transparent text-zinc-300",
        success: "border-[#34D399]/30 bg-[#34D399]/15 text-[#34D399]",
        danger: "border-[#FB7185]/30 bg-[#FB7185]/15 text-[#FB7185]",
        warning: "border-[#F59E0B]/30 bg-[rgba(194,125,61,0.15)] text-[#D99A5B]",
        info: "border-[#22D3EE]/30 bg-[#22D3EE]/15 text-[#22D3EE]",
        purple: "border-[#C084FC]/30 bg-[#C084FC]/15 text-[#C084FC]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
