'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ChatItem } from '@shared/types/chat'
import getAvatarSrc from '@shared/lib/getAvatarSrc'
import { createEscapeKeyHandler } from '@shared/lib/keyboard-handlers'
import { cn } from '@shared/lib/utils'

interface CallModalProps {
    open: boolean
    onClose: () => void
    chat: ChatItem
    statusText?: string
    variant?: 'outgoing' | 'incoming'
}

const dots = [0, 1, 2]

export default function CallModal({
    open,
    onClose,
    chat,
    statusText,
    variant = 'outgoing',
}: Readonly<CallModalProps>) {
    const displayName = useMemo(() => {
        return (
            `${chat.chat.firstName || ''} ${chat.chat.lastName || ''}`.trim() ||
            chat.chat.nickname ||
            chat.chat.username ||
            'Контакт'
        )
    }, [chat])

    const resolvedStatusText =
        statusText ??
        (variant === 'incoming'
            ? 'Входящий звонок'
            : 'Звонок')

    const handleKeyDown = createEscapeKeyHandler(onClose)
    const isIncoming = variant === 'incoming'
    const [isFullscreen, setIsFullscreen] = useState(false)

    if (!open) return null

    return (
        <div
            className={cn(
                'fixed',
                isFullscreen
                    ? cn(
                          'top-[72px]',
                          'bottom-[8px]',
                          'left-1/2',
                          'w-full',
                          'max-w-[1200px]',
                          '-translate-x-1/2',
                      )
                    : 'inset-0',
                'z-50',
                'flex',
                'items-center',
                'justify-center',
                'bg-black/40',
                'backdrop-blur-sm',
                isFullscreen ? 'px-0' : 'px-4',
                isFullscreen ? 'py-0' : 'py-6',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Окно звонка"
            onKeyDown={handleKeyDown}
        >
            <div
                className={cn(
                    'relative',
                    'flex',
                    'flex-col',
                    isFullscreen ? 'h-full' : 'h-[770px]',
                    isFullscreen ? 'w-full' : 'w-[388px]',
                    isFullscreen
                        ? 'max-h-none'
                        : 'max-h-[90vh]',
                    isFullscreen
                        ? 'max-w-none'
                        : 'max-w-[90vw]',
                    'overflow-y-auto',
                    'rounded-lg',
                    isIncoming
                        ? 'bg-[color:var(--color-call-modal-incoming-bg)]'
                        : 'bg-accent-violet-dark',
                    isFullscreen ? 'px-12' : 'px-6',
                    isFullscreen ? 'py-10' : 'py-8',
                    'text-white',
                    'shadow-context-shadow',
                )}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) =>
                    event.stopPropagation()
                }
                role="presentation"
            >
                {!isIncoming && (
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            aria-label="Развернуть окно звонка"
                            onClick={() =>
                                setIsFullscreen(
                                    (prev) => !prev,
                                )
                            }
                            className={cn(
                                'rounded-full',
                                'cursor-pointer',
                                'p-2',
                                'text-white/80',
                                'transition',
                                'hover:bg-white/10',
                            )}
                        >
                            <Image
                                src="/icons/call/FullSize.svg"
                                alt="Развернуть"
                                width={17}
                                height={17}
                            />
                        </button>
                        <button
                            type="button"
                            aria-label="Закрыть звонок"
                            onClick={onClose}
                            className={cn(
                                'rounded-full',
                                'p-2',
                                'text-white/80',
                                'transition',
                                'hover:bg-white/10',
                                'cursor-pointer',
                            )}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <line
                                    x1="18"
                                    y1="6"
                                    x2="6"
                                    y2="18"
                                />
                                <line
                                    x1="6"
                                    y1="6"
                                    x2="18"
                                    y2="18"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                <div
                    className={cn(
                        'flex',
                        'flex-1',
                        'flex-col',
                        'items-center',
                        'justify-center',
                        'text-center',
                    )}
                >
                    <div
                        className={cn(
                            'relative',
                            'flex',
                            'h-40',
                            'w-40',
                            'items-center',
                            'justify-center',
                        )}
                    >
                        <div
                            className={cn(
                                'relative',
                                'h-36',
                                'w-36',
                                'overflow-hidden',
                                'rounded-full',
                                'ring-16',
                                'ring-call-modal-border',
                            )}
                            style={{
                                animation:
                                    'call-avatar-ring-pulse 2.2s ease-in-out infinite',
                            }}
                        >
                            <Image
                                src={getAvatarSrc(
                                    chat.chat,
                                )}
                                alt={displayName}
                                fill
                                sizes="96px"
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    </div>
                    <h2 className="mt-5 text-lg font-semibold">
                        {displayName}
                    </h2>
                    <div
                        className={cn(
                            'mt-2',
                            'flex',
                            'items-center',
                            'gap-2',
                            'text-sm',
                            'text-white/80',
                        )}
                    >
                        <span>{resolvedStatusText}</span>
                        {variant === 'outgoing' && (
                            <span className="flex items-center gap-1">
                                {dots.map((dot) => (
                                    <span
                                        key={dot}
                                        className={cn(
                                            'h-1.5',
                                            'w-1.5',
                                            'inline-block',
                                            'rounded-full',
                                            'bg-white/80',
                                        )}
                                        style={{
                                            animation:
                                                'call-dot-pulse 1s ease-in-out infinite',
                                            animationDelay: `${dot * 0.2}s`,
                                        }}
                                    />
                                ))}
                            </span>
                        )}
                    </div>
                </div>

                {variant === 'incoming' ? (
                    <div
                        className={cn(
                            'mx-auto',
                            'mt-auto',
                            'grid',
                            'w-full',
                            'max-w-[320px]',
                            'grid-cols-2',
                            'gap-4',
                            'pb-4',
                        )}
                    >
                        <button
                            type="button"
                            aria-label="Отмена"
                            className={cn(
                                'flex',
                                'h-12',
                                'items-center',
                                'justify-center',
                                'rounded-2xl',
                                'cursor-pointer',
                                'text-white',
                                'shadow',
                            )}
                            style={{
                                backgroundColor:
                                    'var(--color-call-modal-red)',
                            }}
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            aria-label="Ответить"
                            className={cn(
                                'flex',
                                'h-12',
                                'items-center',
                                'justify-center',
                                'rounded-2xl',
                                'cursor-pointer',
                                'text-white',
                                'shadow',
                            )}
                            style={{
                                backgroundColor:
                                    'var(--color-call-modal-green)',
                            }}
                        >
                            Ответить
                        </button>
                    </div>
                ) : (
                    <div
                        className={cn(
                            'mt-auto',
                            'grid',
                            'mx-auto',
                            'w-full',
                            'max-w-[280px]',
                            'grid-cols-3',
                            'items-end',
                            'justify-center',
                            'gap-6',
                            'pb-4',
                        )}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                aria-label="Видео"
                                className={cn(
                                    'flex',
                                    'h-12',
                                    'w-12',
                                    'items-center',
                                    'justify-center',
                                    'rounded-full',
                                    'cursor-pointer',
                                    'bg-white/90',
                                    'text-accent-violet-primary',
                                    'shadow',
                                )}
                            >
                                <Image
                                    src="/icons/call/Video.svg"
                                    alt="Видео"
                                    width={18}
                                    height={12}
                                />
                            </button>
                            <span className="text-xs text-white/80">
                                Видео
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                aria-label="Убрать звук"
                                className={cn(
                                    'flex',
                                    'h-12',
                                    'w-12',
                                    'items-center',
                                    'justify-center',
                                    'rounded-full',
                                    'cursor-pointer',
                                    'bg-white/90',
                                    'text-accent-violet-primary',
                                    'shadow',
                                )}
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                                    <path d="M19 11a7 7 0 0 1-14 0" />
                                    <line
                                        x1="12"
                                        y1="18"
                                        x2="12"
                                        y2="22"
                                    />
                                </svg>
                            </button>
                            <span className="text-xs text-white/80">
                                Убрать звук
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                aria-label="Завершить"
                                className={cn(
                                    'flex',
                                    'h-12',
                                    'w-12',
                                    'items-center',
                                    'justify-center',
                                    'rounded-full',
                                    'cursor-pointer',
                                    'text-white',
                                    'shadow',
                                )}
                                style={{
                                    backgroundColor:
                                        'var(--color-call-modal-red)',
                                }}
                                onClick={onClose}
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M4.5 12.5c2.5-2 5-3 7.5-3s5 1 7.5 3" />
                                    <path d="M3 14.5l2.5 3a1 1 0 0 0 1.4.2l2.2-1.7a1 1 0 0 0 .3-1.1l-1-2" />
                                    <path d="M21 14.5l-2.5 3a1 1 0 0 1-1.4.2l-2.2-1.7a1 1 0 0 1-.3-1.1l1-2" />
                                </svg>
                            </button>
                            <span className="text-xs text-white/80">
                                Завершить
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
