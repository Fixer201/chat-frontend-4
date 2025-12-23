'use client'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export interface SelectContactAvatarProps
    extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    statusText?: string
    selected?: boolean
    rightElement?: ReactNode
    className?: string
}

export const SelectContactAvatar = forwardRef<
    HTMLDivElement,
    SelectContactAvatarProps
>(({
    src,
    alt,
    name,
    statusText,
    selected,
    rightElement,
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer',
            'bg-(--color-white-bg)',
            selected && 'bg-(--color-accent-violet-dark)',
            className
        )}
        {...props}
    >
        <div className="relative shrink-0 rounded-full overflow-hidden bg-(--color-gray-main) w-[60px] h-[60px]">
            <Image
                src={src}
                alt={alt ?? name}
                fill
                sizes="60px"
                className="object-cover"
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="min-w-0 flex flex-col">
                <p className={cn(
                    'text-base font-medium truncate',
                    selected
                        ? 'text-(--color-white-bg)'
                        : 'text-(--color-text-black)'
                )}>
                    {name}
                </p>
                {statusText && (
                    <p className={cn(
                        'text-sm truncate',
                        selected
                            ? 'text-white-bg/80'
                            : 'text-(--color-text-gray)'
                    )}>
                        {statusText}
                    </p>
                )}
            </div>
        </div>
        <div className="ml-3 flex gap-2 items-center">
            <span className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                selected
                    ? 'bg-(--color-white-bg) border-(--color-white-bg)'
                    : 'border-(--color-accent-violet-primary)'
            )}>
                {selected && (
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
))

SelectContactAvatar.displayName = 'SelectContactAvatar'