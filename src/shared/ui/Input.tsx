import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type InputBorderColor = "gray" | "violet";
export type InputTextColor = "gray" | "violet";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  borderColor?: InputBorderColor;
  textColor?: InputTextColor;
  inputSize?: InputSize;
  label?: string;  
  className?: string;
}

const baseClasses = "bg-white border border-solid rounded-lg focus:outline-none focus:ring-0 transition-colors duration-200";

const borderColorClasses: Record<InputBorderColor, string> = {
  gray: "border-gray-300 focus:border-gray-500 text-[#747474]",
  violet: "border-[var(--color-accent-violet-primary)] focus:border-[var(--color-accent-violet-dark)]",
};

const textColorClasses: Record<InputTextColor, string> = {
  gray: "text-[#747474]",
  violet: "text-[var(--color-accent-violet-primary)]",
};

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-14 w-[360px] px-4 text-lg",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ borderColor = "gray", textColor = "gray", inputSize = "md", label, className, ...props }, ref) => {
    const combinedClasses = twMerge(
      baseClasses,
      borderColorClasses[borderColor],
      textColorClasses[textColor],
      sizeClasses[inputSize],
      className
    );

    return (
      <div className="flex flex-col gap-1">  
        {label && (
          <label className="w-full h-[17px] font-normal align-[1%] text-sm text-gray-600">  
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={combinedClasses}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

// Примеры использования:
// <Input label="Введите номер телефона" placeholder="Email" borderColor="violet" textColor="gray" inputSize="lg" />