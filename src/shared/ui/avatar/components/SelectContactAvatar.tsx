/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import { createButtonKeyHandler } from '@shared/lib/keyboard-handlers'
import type { HTMLAttributes, ReactNode } from 'react'

export interface SelectContactAvatarProps extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    statusText?: string
    selected?: boolean
    rightElement?: ReactNode
    className?: string
    isSelected?: boolean
    onSelect?: () => void
}

export const SelectContactAvatar = forwardRef<
    HTMLDivElement,
    SelectContactAvatarProps
>(
    (
        {
            src,
            alt,
            name,
            statusText,
            selected,
            rightElement,
            className,
            isSelected,
            onSelect,
            ...props
        },
        ref,
    ) => {
        const handleSelectKeyDown = createButtonKeyHandler(
            () => onSelect?.(),
        )

        return (
            <div
                ref={ref}
                className={cn(
                    `
                      flex cursor-pointer gap-3 rounded-md px-3 py-2
                      transition-colors duration-200 select-none
                    `,
                    'bg-(--color-white-bg)',
                    selected &&
                        'bg-(--color-accent-violet-dark)',
                    className,
                )}
                {...props}
            >
                <div
                    className={`
                      relative h-15 w-15 shrink-0 overflow-hidden rounded-full
                      bg-(--color-gray-main)
                    `}
                >
                    <Image
                        src={src}
                        alt={alt ?? name}
                        fill
                        sizes="40px"
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col">
                        <p
                            className={cn(
                                'truncate text-base font-medium',
                                selected
                                    ? 'text-(--color-white-bg)'
                                    : 'text-(--color-text-black)',
                            )}
                        >
                            {name}
                        </p>
                        {statusText && (
                            <p
                                className={cn(
                                    'truncate text-sm',
                                    selected
                                        ? 'text-white-bg/80'
                                        : 'text-(--color-text-gray)',
                                )}
                            >
                                {statusText}
                            </p>
                        )}
                    </div>
                </div>
                <div className="ml-3 flex items-center gap-2">
                    <span
                        className={cn(
                            `
                              flex h-6 w-6 items-center justify-center
                              rounded-full border-2
                            `,
                            selected
                                ? `
                                  border-(--color-white-bg)
                                  bg-(--color-white-bg)
                                `
                                : `border-(--color-accent-violet-primary)`,
                            isSelected
                                ? `
                                  border-(--color-white-bg)
                                  bg-(--color-white-bg)
                                `
                                : 'border-(--color-accent-violet-primary)',
                        )}
                        onClick={(event) => {
                            event.stopPropagation()
                            onSelect?.()
                        }}
                        onKeyDown={handleSelectKeyDown}
                        role="button"
                        tabIndex={0}
                        aria-label={
                            isSelected
                                ? 'Отменить выбор'
                                : 'Выбрать'
                        }
                    >
                        {isSelected && (
                            <Image
                                src="/images/Check.svg"
                                alt="selected"
                                width={20}
                                height={20}
                            />
                        )}
                    </span>
                    {rightElement}
                </div>
            </div>
        )
    },
)

SelectContactAvatar.displayName = 'SelectContactAvatar'
