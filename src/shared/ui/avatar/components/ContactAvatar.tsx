'use client'
import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

export interface ContactAvatarProps
    extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    statusText?: string
    isOnline?: boolean
    rightElement?: ReactNode
    className?: string
}

export const ContactAvatar = forwardRef<
    HTMLDivElement,
    ContactAvatarProps
>(({
    src,
    alt,
    name,
    statusText,
    isOnline,
    rightElement,
    className,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex gap-3 px-3 py-2 rounded-md transition-colors duration-200 select-none cursor-pointer',
            'bg-(--color-gray-main) hover:bg-(--color-gray-light) active:bg-(--color-accent-violet-dark)/60',
            className
        )}
        {...props}
    >
        <div className="relative shrink-0 rounded-full overflow-hidden bg-(--color-gray-main) w-10 h-10">
            <Image
                src={src}
                alt={alt ?? name}
                fill
                sizes="40px"
                className="object-cover"
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="min-w-0 flex flex-col">
                <p className="text-base font-medium truncate text-(--color-text-black)">
                    {name}
                </p>
                {statusText && (
                    <p className={cn(
                        'text-sm truncate',
                        isOnline
                            ? 'text-(--color-accent-violet-primary)'
                            : 'text-(--color-text-gray)'
                    )}>
                        {statusText}
                    </p>
                )}
            </div>
        </div>
        {rightElement && (
            <div className="ml-3 flex gap-2 items-center">
                {rightElement}
            </div>
        )}
    </div>
))

ContactAvatar.displayName = 'ContactAvatar'