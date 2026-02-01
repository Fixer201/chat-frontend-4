// @modules/group-info/components/tabs/MediaTab.tsx
'use client'

import { useState } from 'react'
import TabLayout from '../TabLayout'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

interface MediaTabProps {
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

export default function MediaTab({
    activeTab,
    onBack,
    onTabClick,
    onScroll,
}: MediaTabProps) {
    const [isAtTop, setIsAtTop] = useState(true)

    const mediaItems = [
        { id: 1, type: 'image', date: 'Сегодня', count: 5 },
        { id: 2, type: 'image', date: 'Вчера', count: 3 },
        {
            id: 3,
            type: 'video',
            date: '2 дня назад',
            count: 2,
        },
        {
            id: 4,
            type: 'image',
            date: 'Неделю назад',
            count: 12,
        },
        {
            id: 5,
            type: 'image',
            date: '2 недели назад',
            count: 8,
        },
        {
            id: 6,
            type: 'video',
            date: 'Месяц назад',
            count: 4,
        },
        {
            id: 7,
            type: 'image',
            date: '2 месяца назад',
            count: 15,
        },
        {
            id: 8,
            type: 'image',
            date: '3 месяца назад',
            count: 7,
        },
        {
            id: 9,
            type: 'image',
            date: '4 месяца назад',
            count: 9,
        },
        {
            id: 10,
            type: 'video',
            date: '5 месяца назад',
            count: 6,
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
            tabTitle="Медиа"
        >
            <CustomScrollbar
                className="h-full"
                onScroll={handleCustomScroll}
                contentClassName="p-4"
                autoHeight={false}
            >
                <h3 className="mb-4 text-lg font-medium">
                    Медиафайлы группы
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {mediaItems.map((item) => (
                        <div
                            key={item.id}
                            className={`
              group relative aspect-square cursor-pointer overflow-hidden
              rounded-lg
            `}
                        >
                            <div
                                className={`
                flex h-full w-full items-center justify-center bg-gradient-to-br
                from-blue-200 to-purple-300
              `}
                            >
                                {item.type === 'video' ? (
                                    <div className="text-white">
                                        <svg
                                            className="h-8 w-8"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="text-white">
                                        <svg
                                            className="h-8 w-8"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div
                                className={`
                absolute inset-0 flex items-center justify-center bg-black/50
                opacity-0 transition-opacity
                group-hover:opacity-100
              `}
                            >
                                <span className="text-sm font-medium text-white">
                                    {item.count} шт.
                                </span>
                            </div>
                            <div
                                className={`
                absolute right-1 bottom-1 left-1 truncate rounded bg-black/50
                px-1 py-0.5 text-xs text-white
              `}
                            >
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                            Всего медиафайлов: 72
                        </h3>
                        <button
                            className={`
              text-sm font-medium text-blue-500
              hover:text-blue-600
            `}
                        >
                            Выбрать все
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className={`
              flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white
              transition-colors
              hover:bg-blue-600
            `}
                        >
                            Загрузить
                        </button>
                        <button
                            className={`
              flex-1 rounded-lg border border-gray-300 px-4 py-2
              transition-colors
              hover:bg-gray-50
            `}
                        >
                            Удалить выбранные
                        </button>
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
