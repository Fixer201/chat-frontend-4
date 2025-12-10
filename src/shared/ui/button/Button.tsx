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
  primary: "bg-[var(--color-accent-violet-primary)] text-white hover:bg-[var(--color-accent-violet-white)] hover:text-[var(--color-accent-violet-primary)] active:bg-[var(--color-accent-violet-dark)] active:text-white",
  secondary: "bg-white text-[var(--color-accent-violet-primary)] border border-[var(--color-accent-violet-primary)] hover:bg-[var(--color-accent-violet-primary)] hover:text-white active:bg-[var(--color-accent-violet-dark)] active:text-white",
  danger: "bg-[var(--color-system-red)] text-white hover:bg-[color-mix(in srgb, var(--color-system-red) 90%, white)] active:bg-[color-mix(in srgb, var(--color-system-red) 90%, black)]",
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
