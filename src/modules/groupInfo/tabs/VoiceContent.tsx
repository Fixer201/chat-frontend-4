'use client'

import { useState, useEffect } from 'react'

export default function VoiceContent() {
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

    const totalDuration = '11:30'
    const listenedCount = voiceMessages.filter(
        (m) => m.listened,
    ).length

    return (
        <div
            className={`
          transition-opacity duration-200
          ${visible ? `opacity-100` : `opacity-0`}
        `}
        >
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
                    Аудио-сообщения, отправленные в группе
                </p>
            </div>

            <div className="space-y-4">
                {voiceMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`
                          rounded-lg border border-gray-200 bg-white p-3
                          transition-colors
                          hover:border-blue-300
                        `}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center">
                                <div
                                    className={`
                                  mr-2 h-2 w-2 rounded-full
                                  ${
                                      message.listened
                                          ? 'bg-green-500'
                                          : `
                                      bg-blue-500
                                    `
                                  }
                                `}
                                />
                                <span className="font-medium text-text-black">
                                    {message.sender}
                                </span>
                            </div>
                            <span className="text-sm text-text-gray">
                                {message.date}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                className={`
                              flex h-10 w-10 items-center justify-center
                              rounded-full bg-blue-100 text-blue-600
                              transition-colors
                              hover:bg-blue-200
                            `}
                            >
                                ▶️
                            </button>
                            <div className="flex-1">
                                <div
                                    className={`
                                  mb-1 flex items-center justify-between
                                `}
                                >
                                    <div
                                        className={`
                                      mr-3 h-2 flex-1 overflow-hidden
                                      rounded-full bg-gray-200
                                    `}
                                    >
                                        <div
                                            className={`
                                              h-2 rounded-full bg-blue-500
                                              transition-all duration-300
                                            `}
                                            style={{
                                                width: message.listened
                                                    ? '100%'
                                                    : '40%',
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-text-gray">
                                        {message.duration}
                                    </span>
                                </div>
                                <div className="text-sm text-text-gray">
                                    {message.listened
                                        ? 'Прослушано'
                                        : 'Не прослушано'}
                                </div>
                            </div>
                            <button
                                className={`
                              p-1.5 text-text-gray
                              hover:text-text-black
                            `}
                            >
                                ⬇️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
                            <div className="text-2xl font-bold text-blue-600">
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
        </div>
    )
}
