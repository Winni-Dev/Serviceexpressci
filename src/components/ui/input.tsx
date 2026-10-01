// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#2D2D2D] bg-[#262626] px-3 py-2 text-sm text-white placeholder:text-[#707070] shadow-inner shadow-black/10 transition-all duration-200 focus:outline-none focus:border-[#C27D3D] focus:ring-2 focus:ring-[#C27D3D]/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };