import Image from 'next/image'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@shared/lib/utils'
import type { ButtonProps } from '@shared/ui/button/Button'
import { Button } from '@shared/ui/button/Button'
import {
    createEscapeKeyHandler,
    createEscapeKeyHandlerWithCondition,
} from '@shared/lib/keyboard-handlers'

type ModalButtonConfig = {
    label: string
    onClick?: () => void
    variant?: ButtonProps['variant']
    color?: ButtonProps['color']
    type?: ButtonProps['type']
    loading?: boolean
    disabled?: boolean
    className?: string
}

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    open: boolean
    onClose?: () => void
    title: string
    description?: string
    titleClassName?: string
    descriptionColor?: 'default' | 'muted'
    titleAlign?: 'left' | 'center' | 'right'
    blurBackground?: boolean
    closeOnOverlayClick?: boolean
    iconSrc?: string
    iconAlt?: string
    icon?: ReactNode
    buttons?: ModalButtonConfig[]
    footer?: ReactNode
}

const containerBase =
    'w-full max-w-md rounded-md bg-white shadow-context-shadow p-6'
const overlayBase =
    'fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-violet-shadow-dark'

const alignmentVariants = {
    left: {
        text: 'text-left',
        items: 'items-start',
        icon: 'self-start',
    },
    center: {
        text: 'text-center',
        items: 'items-center',
        icon: 'self-center',
    },
    right: {
        text: 'text-right',
        items: 'items-end',
        icon: 'self-end',
    },
} as const

export default function Modal({
    open,
    onClose,
    title,
    description,
    descriptionColor = 'default',
    titleAlign = 'center',
    titleClassName,
    blurBackground = false,
    closeOnOverlayClick = true,
    iconSrc,
    iconAlt = '',
    icon,
    buttons = [],
    footer,
    className,
    children,
    ...props
}: ModalProps) {
    if (!open) {
        return null
    }

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose?.()
        }
    }

    const handleOverlayKeyDown =
        createEscapeKeyHandlerWithCondition(
            () => onClose?.(),
            closeOnOverlayClick,
        )

    const handleModalKeyDown = createEscapeKeyHandler(() =>
        onClose?.(),
    )

    const secondaryTextClass =
        descriptionColor === 'muted'
            ? 'text-text-gray'
            : 'text-text-black'

    const hasActions = buttons.length > 0

    const alignment = alignmentVariants[titleAlign]
    const {
        text: textAlignClass,
        items: itemsAlignClass,
        icon: iconAlignClass,
    } = alignment

    return (
        <div
            className={cn(
                overlayBase,
                blurBackground && 'backdrop-blur-sm',
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={handleOverlayClick}
            onKeyDown={handleOverlayKeyDown}
        >
            <div
                className={cn(containerBase, className)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleModalKeyDown}
                {...props}
            >
                <div className="flex flex-col items-center gap-4">
                    {(icon || iconSrc) && (
                        <div
                            className={cn(
                                `
                                  flex h-16 w-16 items-center justify-center
                                  rounded-full bg-accent-violet-white
                                `,
                                iconAlignClass,
                            )}
                        >
                            {icon || (
                                <Image
                                    src={iconSrc as string}
                                    alt={iconAlt}
                                    width={40}
                                    height={40}
                                />
                            )}
                        </div>
                    )}
                    <div
                        className={cn(
                            'flex w-full flex-col gap-3',
                            itemsAlignClass,
                            textAlignClass,
                        )}
                    >
                        <h2
                            className={cn(
                                'm-0 text-lg font-medium text-text-black',
                                titleClassName,
                            )}
                        >
                            {title}
                        </h2>
                        {(description || children) && (
                            <div
                                className={cn(
                                    'flex w-full flex-col gap-3',
                                    itemsAlignClass,
                                    textAlignClass,
                                )}
                            >
                                {description && (
                                    <p
                                        className={cn(
                                            'm-0 text-base',
                                            secondaryTextClass,
                                            textAlignClass,
                                        )}
                                    >
                                        {description}
                                    </p>
                                )}
                                {children}
                            </div>
                        )}
                    </div>
                </div>
                {(hasActions || footer) && (
                    <div className="mt-6 flex flex-col gap-3">
                        {hasActions && (
                            <div
                                className={`
                                  flex flex-row justify-center gap-3
                                  md:justify-end md:gap-3
                                `}
                            >
                                {buttons.map(
                                    (
                                        {
                                            label,
                                            onClick,
                                            variant,
                                            color,
                                            type,
                                            loading,
                                            disabled,
                                            className:
                                                buttonClass,
                                        },
                                        index,
                                    ) => {
                                        const resolvedVariant =
                                            variant ??
                                            (index ===
                                            buttons.length -
                                                1
                                                ? 'primary'
                                                : 'secondary')

                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    resolvedVariant
                                                }
                                                color={
                                                    color
                                                }
                                                size="sm"
                                                type={
                                                    type ??
                                                    'button'
                                                }
                                                onClick={
                                                    onClick
                                                }
                                                loading={
                                                    loading
                                                }
                                                disabled={
                                                    disabled
                                                }
                                                className={cn(
                                                    `
                                                      h-11 w-35
                                                      sm:h-auto sm:w-auto
                                                    `,
                                                    buttonClass,
                                                )}
                                            >
                                                {label}
                                            </Button>
                                        )
                                    },
                                )}
                            </div>
                        )}
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export type { ModalButtonConfig }

// Примеры использования:
// <Modal open title="Удалить сообщения" description="Вы действительно хотите удалить сообщения?" descriptionColor="muted" buttons={[{ label: "Отмена", variant: "secondary" }, { label: "Удалить", variant: "primary" }]} />
// <Modal open title="Удалить фото профиля" description="Вы уверены, что хотите удалить текущее фото?" descriptionColor="muted" buttons={[{ label: "Отмена", variant: "secondary" }, { label: "Удалить", variant: "solid", color: "danger" }]} />
// <Modal open titleAlign="left" title="Заблокировать пользователя?" description="Пользователь не сможет писать вам личные сообщения" descriptionColor="muted" buttons={[{ label: "Заблокировать", variant: "ghost", color: "danger" }, { label: "Отмена", variant: "primary" }]} />
// <Modal open blurBackground iconSrc="/images/Check.svg" title="Анастасия Бортникова" description="теперь в списке ваших контактов" buttons={[{ label: "Понятно", variant: "primary" }]} />
