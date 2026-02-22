'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@shared/lib/utils'

interface ToastProps {
    open: boolean
    onClose: () => void
    children?: React.ReactNode
    message?: string
    icon?: React.ReactNode
    duration?: number
    className?: string
}

export function Toast({
    open,
    onClose,
    children,
    message,
    icon,
    duration = 2000,
    className,
}: ToastProps) {
    useEffect(() => {
        if (!open || children) return // если есть children, не закрываем автоматически
        const timer = setTimeout(() => {
            onClose()
        }, duration)
        return () => clearTimeout(timer)
    }, [open, duration, onClose, children])

    if (!open) return null

    return createPortal(
        <div
            className={cn(
                'fixed top-20 left-1/2 -translate-x-1/2',
                'flex items-center gap-3 rounded-lg px-4 py-3',
                'bg-black/70 text-white shadow-lg',
                'transition-opacity duration-200',
                'h-12 min-w-[360px]',
                className,
            )}
            role="alert"
        >
            {children ? (
                children
            ) : (
                <>
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <span className="text-sm font-medium">
                        {message}
                    </span>
                </>
            )}
        </div>,
        document.body,
    )
}
