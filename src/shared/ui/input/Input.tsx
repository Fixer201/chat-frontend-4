import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type InputBorderColor = 'gray' | 'violet' | 'none'
export type InputTextColor = 'gray' | 'violet' | 'black'
export type InputSize = 'sm' | 'md' | 'lg'
export type InputVariant = 'outline' | 'simple'

export interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size'
> {
    borderColor?: InputBorderColor
    textColor?: InputTextColor
    inputSize?: InputSize
    label?: string
    labelClassName?: string
    wrapperClassName?: string
    isInvalid?: boolean
    variant?: InputVariant
    className?: string
}

const outlineBaseClasses =
    'bg-white border border-solid rounded-lg focus:outline-none focus:ring-0 transition-colors duration-200'
const simpleBaseClasses =
    'w-full rounded-md bg-white p-4 text-base text-text-black transition-colors outline-none'

const borderColorClasses: Record<InputBorderColor, string> =
    {
        gray: 'border-gray-300 focus:border-gray-500 text-[#747474]',
        violet: 'border-[var(--color-accent-violet-primary)] focus:border-[var(--color-accent-violet-dark)]',
        none: 'border-none focus:border-none',
    }

const textColorClasses: Record<InputTextColor, string> = {
    gray: 'text-[#747474]',
    violet: 'text-[var(--color-accent-violet-primary)]',
    black: 'text-text-black',
}

const sizeClasses: Record<InputSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-14 w-[360px] px-4 text-lg',
}

const invalidClasses =
    'border-2 border-[var(--color-system-red)] focus:border-[var(--color-system-red)] focus:shadow-none'

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
            labelClassName,
            wrapperClassName,
            isInvalid = false,
            variant = 'outline',
            className,
            ...props
        },
        ref,
    ) => {
        const outlineClasses = twMerge(
            outlineBaseClasses,
            borderColorClasses[borderColor],
            textColorClasses[textColor],
            sizeClasses[inputSize],
        )

        const simpleClasses = twMerge(
            simpleBaseClasses,
            textColor === 'black'
                ? ''
                : textColorClasses[textColor],
        )

        const computedClasses = twMerge(
            variant === 'simple'
                ? simpleClasses
                : outlineClasses,
            isInvalid && invalidClasses,
            className,
        )

        const wrapperClasses = twMerge(
            'flex flex-col',
            label ? 'gap-1' : undefined,
            variant === 'simple' ? 'w-full' : undefined,
            wrapperClassName,
        )

        const resolvedLabelClass = twMerge(
            'h-4 w-full align-[1%] text-sm font-normal text-gray-600',
            labelClassName,
        )

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className={resolvedLabelClass}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={computedClasses}
                    aria-invalid={isInvalid || undefined}
                    {...props}
                />
            </div>
        )
    },
)

Input.displayName = 'Input'

export default Input

// Примеры использования:
// <Input label="Введите номер телефона" placeholder="Email" borderColor="violet" textColor="gray" inputSize="lg" />
