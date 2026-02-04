'use client'

import { cn } from '@shared/lib/utils'
import { useState, useEffect } from 'react'

interface ParticipantsContentProps {
    isPreview?: boolean
}

export default function ParticipantsContent({
    isPreview = false,
}: ParticipantsContentProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const participants = [
        {
            id: 1,
            name: 'Алексей Иванов',
            role: 'Администратор',
            online: true,
        },
        {
            id: 2,
            name: 'Мария Петрова',
            role: 'Участник',
            online: true,
        },
        {
            id: 3,
            name: 'Дмитрий Сидоров',
            role: 'Участник',
            online: false,
        },
        {
            id: 4,
            name: 'Екатерина Смирнова',
            role: 'Участник',
            online: true,
        },
        {
            id: 5,
            name: 'Иван Кузнецов',
            role: 'Участник',
            online: false,
        },
    ]

    const displayedParticipants = isPreview
        ? participants.slice(0, 2)
        : participants

    return (
        <div
            className={cn(
                'transition-opacity duration-200',
                visible ? 'opacity-100' : 'opacity-0',
            )}
        >
            {!isPreview && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-text-black">
                        Участники группы (
                        {participants.length})
                    </h3>
                </div>
            )}

            <div className="space-y-3">
                {displayedParticipants.map((user) => (
                    <div
                        key={user.id}
                        className={cn(
                            `
                              flex items-center rounded-lg border
                              border-gray-200 bg-white
                            `,
                            isPreview ? 'p-2' : 'p-3',
                        )}
                    >
                        <div className="relative">
                            <div
                                className={cn(
                                    `
                                  flex items-center justify-center rounded-full
                                  bg-gradient-to-r from-blue-400 to-purple-500
                                `,
                                    isPreview
                                        ? 'h-8 w-8'
                                        : 'h-12 w-12',
                                )}
                            >
                                <span
                                    className={cn(
                                        'font-medium text-white',
                                        isPreview
                                            ? 'text-xs'
                                            : 'text-base',
                                    )}
                                >
                                    {user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    `
                                  absolute right-0 bottom-0 rounded-full
                                  border-2 border-white
                                `,
                                    isPreview
                                        ? 'h-2 w-2'
                                        : 'h-3 w-3',
                                    user.online
                                        ? 'bg-green-500'
                                        : 'bg-gray-400',
                                )}
                            />
                        </div>
                        <div
                            className={cn(
                                'flex-1',
                                isPreview ? 'ml-2' : 'ml-3',
                            )}
                        >
                            <h4
                                className={cn(
                                    'font-medium text-text-black',
                                    isPreview
                                        ? 'truncate text-sm'
                                        : 'text-base',
                                )}
                            >
                                {user.name}
                            </h4>
                            <p
                                className={cn(
                                    'text-text-gray',
                                    isPreview
                                        ? 'text-xs'
                                        : 'text-sm',
                                )}
                            >
                                {user.role}
                            </p>
                        </div>
                        {!isPreview &&
                            user.role ===
                                'Администратор' && (
                                <span
                                    className={`
                              rounded-full bg-blue-100 px-2 py-1 text-xs
                              text-blue-600
                            `}
                                >
                                    Админ
                                </span>
                            )}
                    </div>
                ))}
            </div>

            {isPreview && participants.length > 2 && (
                <div className="mt-2 text-center">
                    <span className="text-sm text-text-gray">
                        и ещё {participants.length - 2}{' '}
                        участников
                    </span>
                </div>
            )}

            {!isPreview && (
                <div className="mt-6 mb-8">
                    <h4 className="mb-3 text-lg font-medium text-text-black">
                        Добавить участника
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Введите имя пользователя..."
                            className={`
                              flex-1 rounded-lg border border-gray-300 px-4 py-2
                              focus:ring-2 focus:ring-blue-500
                              focus:outline-none
                            `}
                        />
                        <button
                            className={`
                          rounded-lg bg-blue-500 px-4 py-2 text-white
                          transition-colors
                          hover:bg-blue-600
                        `}
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
