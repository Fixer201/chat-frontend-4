import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type InputBorderColor = 'gray' | 'violet' | 'red'
export type InputTextColor = 'gray' | 'violet'
export type InputSize = 'sm' | 'md' | 'lg'
export type InputLabelColor = 'gray' | 'red'

export interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size'
> {
    borderColor?: InputBorderColor
    textColor?: InputTextColor
    inputSize?: InputSize
    label?: string
    labelColor?: InputLabelColor
    className?: string
}

const baseClasses =
    'bg-white border border-solid rounded-lg focus:outline-none focus:ring-0 transition-colors duration-200'

const borderColorClasses: Record<InputBorderColor, string> =
    {
        gray: 'border-gray-300 focus:border-gray-500 text-[#747474]',
        violet: 'border-[var(--color-accent-violet-primary)] focus:border-[var(--color-accent-violet-dark)]',
        red: 'text-red-500 focus:text-red-500',
    }

const textColorClasses: Record<InputTextColor, string> = {
    gray: 'text-[#747474]',
    violet: 'text-[var(--color-accent-violet-primary)]',
}

const sizeClasses: Record<InputSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-14 w-[360px] px-4 text-lg',
}

const labelColorClasses: Record<InputLabelColor, string> = {
    gray: 'text-gray-600',
    red: 'text-red-500',
}

export const Input = forwardRef<
    HTMLInputElement,
    InputProps
>(
    (
        {
            borderColor = 'gray',
            textColor = 'gray',
            inputSize = 'md',
            label,
            labelColor = 'gray',
            className,
            ...props
        },
        ref,
    ) => {
        const combinedClasses = twMerge(
            baseClasses,
            borderColorClasses[borderColor],
            textColorClasses[textColor],
            sizeClasses[inputSize],
            className,
        )

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label
                        className={twMerge(
                            'h-4 w-full align-[1%] text-sm font-normal',
                            labelColorClasses[labelColor],
                        )}
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={combinedClasses}
                    {...props}
                />
            </div>
        )
    },
)

Input.displayName = 'Input'
