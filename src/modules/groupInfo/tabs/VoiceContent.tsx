'use client'

import { cn } from '@shared/lib/utils'
import { useState, useEffect } from 'react'

interface VoiceContentProps {
    isPreview?: boolean
}

export default function VoiceContent({
    isPreview = false,
}: VoiceContentProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const voiceMessages = [
        {
            id: 1,
            duration: '0:45',
            sender: 'Алексей Иванов',
            date: 'Сегодня, 10:30',
            listened: true,
        },
        {
            id: 2,
            duration: '1:20',
            sender: 'Мария Петрова',
            date: 'Вчера, 18:15',
            listened: true,
        },
        {
            id: 3,
            duration: '0:30',
            sender: 'Дмитрий Сидоров',
            date: '2 дня назад',
            listened: false,
        },
        {
            id: 4,
            duration: '2:15',
            sender: 'Екатерина Смирнова',
            date: '3 дня назад',
            listened: true,
        },
        {
            id: 5,
            duration: '0:55',
            sender: 'Иван Кузнецов',
            date: 'Неделю назад',
            listened: false,
        },
        {
            id: 6,
            duration: '1:45',
            sender: 'Алексей Иванов',
            date: '2 недели назад',
            listened: true,
        },
        {
            id: 7,
            duration: '3:20',
            sender: 'Мария Петрова',
            date: 'Месяц назад',
            listened: true,
        },
        {
            id: 8,
            duration: '0:40',
            sender: 'Дмитрий Сидоров',
            date: '2 месяца назад',
            listened: true,
        },
        {
            id: 9,
            duration: '1:10',
            sender: 'Екатерина Смирнова',
            date: '2 месяца назад',
            listened: true,
        },
        {
            id: 10,
            duration: '0:50',
            sender: 'Иван Кузнецов',
            date: '3 месяца назад',
            listened: false,
        },
    ]

    const displayedMessages = isPreview
        ? voiceMessages.slice(0, 1)
        : voiceMessages

    const totalDuration = '11:30'
    const listenedCount = voiceMessages.filter(
        (m) => m.listened,
    ).length

    return (
        <div
            className={cn(
                'transition-opacity duration-200',
                visible ? 'opacity-100' : 'opacity-0',
            )}
        >
            {!isPreview && (
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-black">
                            Голосовые сообщения
                        </h3>
                        <div className="text-sm text-text-gray">
                            Всего: {voiceMessages.length}{' '}
                            сообщений
                        </div>
                    </div>
                    <p className="mt-1 text-text-gray">
                        Аудио-сообщения, отправленные в
                        группе
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {displayedMessages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            `
                              rounded-lg border border-gray-200 bg-white
                              transition-colors
                              hover:border-blue-300
                            `,
                            isPreview ? 'p-2' : 'p-3',
                        )}
                    >
                        <div
                            className={cn(
                                'flex items-center justify-between',
                                isPreview
                                    ? `
                          mb-1
                        `
                                    : `mb-2`,
                            )}
                        >
                            <div className="flex items-center">
                                <div
                                    className={cn(
                                        'h-2 w-2 rounded-full',
                                        isPreview
                                            ? 'mr-1'
                                            : 'mr-2',
                                        message.listened
                                            ? 'bg-green-500'
                                            : `
                                      bg-blue-500
                                    `,
                                    )}
                                />
                                <span
                                    className={cn(
                                        'font-medium text-text-black',
                                        isPreview
                                            ? 'truncate text-sm'
                                            : '',
                                    )}
                                >
                                    {message.sender}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'text-text-gray',
                                    isPreview
                                        ? `
                              text-xs
                            `
                                        : `text-sm`,
                                )}
                            >
                                {message.date}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                className={cn(
                                    `
                                  flex items-center justify-center rounded-full
                                  bg-blue-100 text-blue-600 transition-colors
                                  hover:bg-blue-200
                                `,
                                    isPreview
                                        ? 'h-8 w-8 text-sm'
                                        : 'h-10 w-10',
                                )}
                            >
                                ▶️
                            </button>
                            <div className="flex-1">
                                <div
                                    className={cn(
                                        `
                                  flex items-center justify-between
                                `,
                                        isPreview
                                            ? `mb-0.5`
                                            : `mb-1`,
                                    )}
                                >
                                    <div
                                        className={cn(
                                            `
                                      h-2 flex-1 overflow-hidden rounded-full
                                      bg-gray-200
                                    `,
                                            isPreview
                                                ? `mr-2`
                                                : `mr-3`,
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                `
                                              h-2 rounded-full bg-blue-500
                                              transition-all duration-300
                                            `,
                                                message.listened
                                                    ? 'w-full'
                                                    : `
                                              w-[40%]
                                            `,
                                            )}
                                        ></div>
                                    </div>
                                    <span
                                        className={cn(
                                            'text-text-gray',
                                            isPreview
                                                ? `
                                      text-xs
                                    `
                                                : `text-sm`,
                                        )}
                                    >
                                        {message.duration}
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'text-text-gray',
                                        isPreview
                                            ? `
                                  text-xs
                                `
                                            : `text-sm`,
                                    )}
                                >
                                    {message.listened
                                        ? 'Прослушано'
                                        : 'Не прослушано'}
                                </div>
                            </div>
                            {!isPreview && (
                                <button
                                    className={`
                                  p-1.5 text-text-gray
                                  hover:text-text-black
                                `}
                                >
                                    ⬇️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isPreview && voiceMessages.length > 1 && (
                <div className="mt-2 text-center">
                    <span className="text-sm text-text-gray">
                        и ещё {voiceMessages.length - 1}{' '}
                        сообщений
                    </span>
                </div>
            )}

            {!isPreview && (
                <div className="mt-6 mb-8">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-text-black">
                                    Общая статистика
                                </h4>
                                <p className="text-sm text-text-gray">
                                    Голосовых сообщений
                                </p>
                            </div>
                            <div className="text-right">
                                <div
                                    className={`
                                  text-2xl font-bold text-blue-600
                                `}
                                >
                                    {totalDuration}
                                </div>
                                <div className="text-sm text-text-gray">
                                    {listenedCount}/
                                    {voiceMessages.length}{' '}
                                    прослушано
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
