// @modules/group-info/components/tabs/VoiceTab.tsx
'use client'

import { useState } from 'react'
import TabLayout from '../TabLayout'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

interface VoiceTabProps {
    activeTab:
        | 'participants'
        | 'media'
        | 'files'
        | 'voice'
        | 'links'
    onBack: () => void
    onTabClick: (
        tabId:
            | 'participants'
            | 'media'
            | 'files'
            | 'voice'
            | 'links',
        index: number,
    ) => void
    onScroll?: (scrollY: number) => void
}

export default function VoiceTab({
    activeTab,
    onBack,
    onTabClick,
    onScroll,
}: VoiceTabProps) {
    const [isAtTop, setIsAtTop] = useState(true)

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

    const handleCustomScroll = (scrollTop: number) => {
        setIsAtTop(scrollTop <= 10)

        if (onScroll) {
            onScroll(scrollTop)
        }
    }

    return (
        <TabLayout
            activeTab={activeTab}
            onBack={onBack}
            onTabClick={onTabClick}
            tabTitle="Голосовые"
        >
            <CustomScrollbar
                className="h-full"
                onScroll={handleCustomScroll}
                contentClassName="p-4"
                autoHeight={false}
            >
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
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

                <div className="space-y-4">
                    {voiceMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`
              rounded-lg border border-gray-200 bg-white p-3 transition-colors
              hover:border-blue-300
            `}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div
                                        className={`
                    mr-2 h-3 w-3 rounded-full
                    ${message.listened ? `bg-green-500` : `bg-blue-500`}
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
                  flex h-10 w-10 items-center justify-center rounded-full
                  bg-blue-100 text-blue-600 transition-colors
                  hover:bg-blue-200
                `}
                                >
                                    ▶️
                                </button>
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center justify-between">
                                        <div className="mr-3 h-2 flex-1 rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{
                                                    width: message.listened
                                                        ? '100%'
                                                        : '40%',
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-text-gray">
                                            {
                                                message.duration
                                            }
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
                    <div className="rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">
                                    Общая длительность
                                </h4>
                                <p className="text-sm text-text-gray">
                                    Всех голосовых сообщений
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                                11:30
                            </div>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>

            {isAtTop && (
                <div
                    className={`
          pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t
          from-white to-transparent py-4 text-center
        `}
                >
                    <div className="animate-pulse text-sm text-gray-500">
                        <span className="mr-2 inline-block">
                            ↑
                        </span>{' '}
                        Скролл вверх для возврата
                    </div>
                </div>
            )}
        </TabLayout>
    )
}
