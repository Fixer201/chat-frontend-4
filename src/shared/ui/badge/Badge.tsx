import { cn } from "@shared/lib/utils";
import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";

export type BadgeVariant = "counter" | "status" | "label";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeColor = "primary" | "success" | "danger" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  children?: ReactNode;
  className?: string;
}

const baseClasses = "inline-flex items-center justify-center select-none transition-colors duration-200";

const sizeClasses: Record<BadgeSize, string> = {
  sm: "min-w-[16px] h-[16px] px-[4px] text-[10px]",
  md: "min-w-[21px] h-[21px] px-[6px] text-sm",
  lg: "min-w-[44px] h-[44px] px-3 text-2xl",
};

const variantClasses: Record<BadgeVariant, string> = {
  counter: "font-semibold rounded-full leading-none",
  status: "w-2.5 h-2.5 rounded-full p-0",
  label: "h-6 px-2 text-xs rounded-full",
};

const colorClasses: Record<BadgeColor, string> = {
  primary: "bg-[#7769E1] text-white",
  success: "bg-[#34C759] text-white",
  danger: "bg-[#FF383C] text-white",
  neutral: "bg-[#E4E4E4] text-[#6B7280]",
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "counter", color = "primary", size = "md", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

// Пример использования:
// <Badge variant="counter" color="primary" size="lg">5</Badge>
