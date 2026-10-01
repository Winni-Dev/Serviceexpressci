import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27D3D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#C27D3D] text-[#000000] font-semibold rounded-xl shadow-[0_8px_18px_rgba(194,125,61,0.22)] hover:bg-[#D99A5B] hover:shadow-[0_12px_24px_rgba(194,125,61,0.3)] active:scale-[0.99]",
        destructive:
          "bg-[#FB7185]/15 text-[#FB7185] border border-[#FB7185]/30 rounded-xl hover:bg-[#FB7185]/25 active:scale-[0.99]",
        outline:
          "border border-[#27272A] bg-[#121212] text-zinc-200 rounded-xl hover:bg-[#18181B] hover:border-[#C27D3D]/50 hover:text-[#D99A5B]",
        secondary:
          "bg-[#18181B] text-zinc-200 rounded-xl border border-[#27272A] hover:bg-[#27272A] hover:text-white",
        accent:
          "bg-[#C27D3D] text-[#000000] font-semibold rounded-xl hover:bg-[#D99A5B] shadow-[0_8px_18px_rgba(194,125,61,0.22)]",
        ghost:
          "bg-transparent text-zinc-300 rounded-xl hover:bg-white/5 hover:text-white",
        link:
          "text-[#D99A5B] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-1.5 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };