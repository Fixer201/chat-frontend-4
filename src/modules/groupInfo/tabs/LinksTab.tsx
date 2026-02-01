// @modules/group-info/components/tabs/LinksTab.tsx
'use client'

import { useState } from 'react'
import TabLayout from '../TabLayout'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

interface LinksTabProps {
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

export default function LinksTab({
    activeTab,
    onBack,
    onTabClick,
    onScroll,
}: LinksTabProps) {
    const [isAtTop, setIsAtTop] = useState(true)

    const links = [
        {
            id: 1,
            title: 'Дизайн система проекта',
            url: 'https://figma.com/file/project-design',
            sender: 'Алексей Иванов',
            date: 'Сегодня',
        },
        {
            id: 2,
            title: 'Документация API',
            url: 'https://docs.api.example.com',
            sender: 'Мария Петрова',
            date: 'Вчера',
        },
        {
            id: 3,
            title: 'Полезная статья по UI/UX',
            url: 'https://medium.com/ui-ux-tips',
            sender: 'Дмитрий Сидоров',
            date: '3 дня назад',
        },
        {
            id: 4,
            title: 'Гитхаб репозиторий',
            url: 'https://github.com/project-repo',
            sender: 'Екатерина Смирнова',
            date: 'Неделю назад',
        },
        {
            id: 5,
            title: 'Google Диск с материалами',
            url: 'https://drive.google.com/folder',
            sender: 'Иван Кузнецов',
            date: '2 недели назад',
        },
        {
            id: 6,
            title: 'Jira доска проекта',
            url: 'https://jira.company.com/board',
            sender: 'Алексей Иванов',
            date: 'Месяц назад',
        },
        {
            id: 7,
            title: 'Таблица с данными',
            url: 'https://docs.google.com/spreadsheets',
            sender: 'Мария Петрова',
            date: 'Месяц назад',
        },
        {
            id: 8,
            title: 'Онлайн встреча Zoom',
            url: 'https://zoom.us/j/meeting-id',
            sender: 'Дмитрий Сидоров',
            date: '2 месяца назад',
        },
        {
            id: 9,
            title: 'Мокапы проекта',
            url: 'https://mockup.com/project',
            sender: 'Екатерина Смирнова',
            date: '2 месяца назад',
        },
        {
            id: 10,
            title: 'Чек-лист тестирования',
            url: 'https://trello.com/b/project-checklist',
            sender: 'Иван Кузнецов',
            date: '3 месяца назад',
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
            tabTitle="Ссылки"
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
                            Ссылки в группе
                        </h3>
                        <div className="text-sm text-text-gray">
                            Всего: {links.length} ссылок
                        </div>
                    </div>
                    <p className="mt-1 text-text-gray">
                        Все ссылки, которыми делились
                        участники
                    </p>
                </div>

                <div className="space-y-4">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className={`
              group rounded-lg border border-gray-200 bg-white p-3
              transition-colors
              hover:border-blue-300
            `}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`
                  flex h-12 w-12 items-center justify-center rounded-lg
                  bg-blue-100 text-blue-600
                `}
                                >
                                    🔗
                                </div>
                                <div className="flex-1">
                                    <h4 className="mb-1 font-medium text-text-black">
                                        {link.title}
                                    </h4>
                                    <p className="mb-2 truncate text-sm text-blue-500">
                                        {link.url}
                                    </p>
                                    <div className="flex items-center text-sm text-text-gray">
                                        <span>
                                            {link.sender}
                                        </span>
                                        <span className="mx-2">
                                            •
                                        </span>
                                        <span>
                                            {link.date}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={`
                  flex items-center gap-1 opacity-0 transition-opacity
                  group-hover:opacity-100
                `}
                                >
                                    <button
                                        className={`
                      rounded p-1.5
                      hover:bg-gray-100
                    `}
                                        title="Открыть"
                                        onClick={() =>
                                            window.open(
                                                link.url,
                                                '_blank',
                                            )
                                        }
                                    >
                                        ↗️
                                    </button>
                                    <button
                                        className={`
                      rounded p-1.5
                      hover:bg-gray-100
                    `}
                                        title="Копировать"
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                link.url,
                                            )
                                        }
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 mb-8">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-2 font-medium">
                            Добавить новую ссылку
                        </h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Заголовок ссылки..."
                                className={`
                  w-full rounded-lg border border-gray-300 px-3 py-2
                  focus:ring-2 focus:ring-blue-500 focus:outline-none
                `}
                            />
                            <input
                                type="text"
                                placeholder="URL ссылки..."
                                className={`
                  w-full rounded-lg border border-gray-300 px-3 py-2
                  focus:ring-2 focus:ring-blue-500 focus:outline-none
                `}
                            />
                            <button
                                className={`
                w-full rounded-lg bg-blue-500 py-2 text-white transition-colors
                hover:bg-blue-600
              `}
                            >
                                Добавить ссылку
                            </button>
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
