import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
}

const baseClasses = "inline-flex items-center justify-center transition-colors duration-200 focus:outline-none disabled:opacity-60 select-none cursor-pointer";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#7769E1] text-white hover:bg-[#53499e]",
  secondary: "bg-white text-[#7769E1] border border-[#7769E1] hover:bg-[#7769E1] hover:text-white",
  danger: "bg-[#FF383C] text-white hover:bg-[#d32f2f]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-base rounded-md",
  md: "h-12 px-6 text-lg rounded-lg",
  lg: "h-14 px-6 text-xl rounded-xl",
};

const spinnerClasses = "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", loading = false, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={twMerge(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className={spinnerClasses} />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Пример использования:
// <Button variant="primary" size="md">Отправить</Button>
