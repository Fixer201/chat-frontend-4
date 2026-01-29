import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export type TextareaBorderColor = 'gray' | 'violet' | 'red'
export type TextareaTextColor = 'gray' | 'violet'
export type InputSize = 'sm' | 'md' | 'lg'
export type TextareaLabelColor = 'gray' | 'red'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    isInvalid?: boolean
    borderColor?: TextareaBorderColor
    textColor?: TextareaTextColor
    label?: string
    labelColor?: TextareaLabelColor
    className?: string
}
const baseClasses =
    'bg-white border border-solid rounded-lg focus:outline-none focus:ring-0 transition-colors duration-200'

const borderColorClasses: Record<
    TextareaBorderColor,
    string
> = {
    gray: 'border-gray-300 focus:border-gray-500 text-[#747474]',
    violet: 'border-[var(--color-accent-violet-primary)] focus:border-[var(--color-accent-violet-dark)]',
    red: 'border-red-500 focus:border-red-500',
}

const textColorClasses: Record<TextareaTextColor, string> =
    {
        gray: 'text-[#747474]',
        violet: 'text-[var(--color-accent-violet-primary)]',
    }

const labelColorClasses: Record<
    TextareaLabelColor,
    string
> = {
    gray: 'text-gray-600',
    red: 'text-text-red',
}

export const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>(
    (
        {
            borderColor = 'gray',
            textColor = 'gray',
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
            'h-[220px] w-[360px] resize-none p-4 text-lg',
            className,
        )

        return (
            <div className="flex flex-col gap-1">
                {label && (
                    <label
                        className={twMerge(
                            'h-4 w-full text-sm font-normal',
                            labelColorClasses[labelColor],
                        )}
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={combinedClasses}
                    {...props}
                />
            </div>
        )
    },
)

Textarea.displayName = 'Textarea'

export default Textarea
