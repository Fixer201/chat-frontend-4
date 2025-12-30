import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type LegacyVariant = 'primary' | 'secondary' | 'danger'
type ModernVariant = 'solid' | 'outline' | 'ghost'
export type ButtonVariant = LegacyVariant | ModernVariant
export type ButtonColor =
    | 'primary'
    | 'danger'
    | 'neutral'
    | 'disabled'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    color?: ButtonColor
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    className?: string
}

const baseClasses =
    'inline-flex items-center justify-center border border-transparent transition-colors duration-200 focus:outline-none select-none'

const colorSchemeClasses: Record<
    Exclude<ButtonColor, 'disabled'>,
    Record<ModernVariant, string>
> = {
    primary: {
        solid: 'bg-[var(--color-accent-violet-primary)] text-white hover:bg-[var(--color-accent-violet-white)] hover:text-[var(--color-accent-violet-primary)] active:bg-[var(--color-accent-violet-dark)] active:text-white cursor-pointer',
        outline:
            'text-[var(--color-accent-violet-primary)] border-[var(--color-accent-violet-primary)] hover:bg-[var(--color-accent-violet-white)] active:bg-[var(--color-accent-violet-dark)] active:text-white cursor-pointer',
        ghost: 'bg-transparent text-[var(--color-accent-violet-primary)] hover:text-[var(--color-accent-violet-dark)] active:text-[color-mix(in srgb, var(--color-accent-violet-dark) 90%, black)] cursor-pointer',
    },
    danger: {
        solid: 'bg-[var(--color-system-red)] text-white hover:bg-[color-mix(in srgb, var(--color-system-red) 88%, white)] active:bg-[color-mix(in srgb, var(--color-system-red) 85%, black)] cursor-pointer',
        outline:
            'text-[var(--color-system-red)] border-[var(--color-system-red)] hover:bg-[var(--color-system-red-surface)] active:bg-[color-mix(in srgb, var(--color-system-red) 80%, black)] active:text-white cursor-pointer',
        ghost: 'bg-transparent text-[var(--color-system-red)] hover:text-[var(--color-system-red-soft)] active:text-[var(--color-system-red-dark)] cursor-pointer',
    },
    neutral: {
        solid: 'bg-[var(--color-text-black)] text-white hover:bg-[color-mix(in srgb, var(--color-text-black) 88%, white)] active:bg-[color-mix(in srgb, var(--color-text-black) 85%, black)] cursor-pointer',
        outline:
            'text-[var(--color-text-black)] border-[var(--color-text-black)] hover:bg-[color-mix(in srgb, var(--color-text-black) 90%, white)] active:bg-[color-mix(in srgb, var(--color-text-black) 80%, black)] active:text-white cursor-pointer',
        ghost: 'bg-transparent text-[var(--color-text-black)] hover:text-[color-mix(in srgb, var(--color-text-black) 75%, white)] active:text-[color-mix(in srgb, var(--color-text-black) 85%, black)] cursor-pointer',
    },
}

const disabledClassByVariant: Record<
    ModernVariant,
    string
> = {
    solid: 'bg-[#E4E4E4] text-[#A0A0A0] ',
    outline: 'border-[#E4E4E4] text-[#A0A0A0] ',
    ghost: 'text-[#A0A0A0] ',
}

const legacyVariantMap: Record<
    LegacyVariant,
    { variant: ModernVariant; color: ButtonColor }
> = {
    primary: { variant: 'solid', color: 'primary' },
    secondary: { variant: 'outline', color: 'primary' },
    danger: { variant: 'solid', color: 'danger' },
}

const sizeClasses: Record<
    NonNullable<ButtonProps['size']>,
    string
> = {
    sm: 'h-8 px-4 text-base rounded',
    md: 'h-12 px-6 text-lg rounded-lg',
    lg: 'h-14 px-6 text-xl rounded-xl',
}

const spinnerClasses =
    'w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin'

const isLegacyVariant = (
    value: ButtonVariant,
): value is LegacyVariant => value in legacyVariantMap

export const Button = forwardRef<
    HTMLButtonElement,
    ButtonProps
>(
    (
        {
            children,
            variant = 'primary',
            color,
            size = 'md',
            loading = false,
            className,
            disabled,
            ...props
        },
        ref,
    ) => {
        const { resolvedVariant, resolvedColor } = (() => {
            if (isLegacyVariant(variant)) {
                const mapping = legacyVariantMap[variant]
                return {
                    resolvedVariant: mapping.variant,
                    resolvedColor: color ?? mapping.color,
                }
            }

            return {
                resolvedVariant: variant as ModernVariant,
                resolvedColor: color ?? 'primary',
            }
        })()

        const variantClass =
            disabled || resolvedColor === 'disabled'
                ? disabledClassByVariant[resolvedVariant]
                : colorSchemeClasses[resolvedColor][
                      resolvedVariant
                  ]

        return (
            <button
                ref={ref}
                type={props.type ?? 'button'}
                className={twMerge(
                    baseClasses,
                    variantClass,
                    sizeClasses[size],
                    className,
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
        )
    },
)

Button.displayName = 'Button'

// Пример использования:
// <Button variant="primary" size="md">Отправить</Button>
