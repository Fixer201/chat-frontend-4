// @modules/group-info/components/tabs/ParticipantsTab.tsx
'use client'

import { useState } from 'react'
import TabLayout from '../TabLayout'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

interface ParticipantsTabProps {
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

export default function ParticipantsTab({
    activeTab,
    onBack,
    onTabClick,
    onScroll,
}: ParticipantsTabProps) {
    const [isAtTop, setIsAtTop] = useState(true)

    const handleCustomScroll = (scrollTop: number) => {
        // Проверяем, достигли ли верха
        setIsAtTop(scrollTop <= 10)

        // Передаем позицию скролла родителю
        if (onScroll) {
            onScroll(scrollTop)
        }
    }

    return (
        <TabLayout
            activeTab={activeTab}
            onBack={onBack}
            onTabClick={onTabClick}
            tabTitle="Участники"
        >
            <CustomScrollbar
                className="h-10"
                onScroll={handleCustomScroll}
                contentClassName="p-4"
                autoHeight={false}
            >
                <h3 className="mb-4 text-lg font-medium">
                    Участники группы (5)
                </h3>
                <div className="space-y-3">
                    {[
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
                    ].map((user) => (
                        <div
                            key={user.id}
                            className={`
              flex items-center rounded-lg border border-gray-200 bg-white p-3
            `}
                        >
                            <div className="relative">
                                <div
                                    className={`
                  flex h-12 w-12 items-center justify-center rounded-full
                  bg-gradient-to-r from-blue-400 to-purple-500
                `}
                                >
                                    <span className="font-medium text-white">
                                        {user.name
                                            .split(' ')
                                            .map(
                                                (n) => n[0],
                                            )
                                            .join('')}
                                    </span>
                                </div>
                                <div
                                    className={`
                  absolute right-0 bottom-0 h-3 w-3 rounded-full border-2
                  border-white
                  ${user.online ? `bg-green-500` : `bg-gray-400`}
                `}
                                />
                            </div>
                            <div className="ml-3 flex-1">
                                <h4 className="font-medium text-text-black">
                                    {user.name}
                                </h4>
                                <p className="text-sm text-text-gray">
                                    {user.role}
                                </p>
                            </div>
                            {user.role ===
                                'Администратор' && (
                                <span
                                    className={`
                  rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600
                `}
                                >
                                    Админ
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 mb-8">
                    <h4 className="mb-3 text-lg font-medium">
                        Добавить участника
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Введите имя пользователя..."
                            className={`
                flex-1 rounded-lg border border-gray-300 px-4 py-2
                focus:ring-2 focus:ring-blue-500 focus:outline-none
              `}
                        />
                        <button
                            className={`
              rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors
              hover:bg-blue-600
            `}
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            </CustomScrollbar>

            {/* Индикатор скролла вверх для возврата */}
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
