// @modules/group-info/components/TabLayout.tsx
'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import { useRef, useEffect, useMemo } from 'react'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

interface TabLayoutProps {
    activeTab: TabId
    onBack: () => void
    onTabClick: (tabId: TabId, index: number) => void
    children: React.ReactNode
    tabTitle: string
    onScroll?: (scrollY: number) => void
}

export default function TabLayout({
    activeTab,
    onBack,
    onTabClick,
    children,
    tabTitle,
    onScroll,
}: TabLayoutProps) {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const isInitialMount = useRef(true) // Используем ref вместо state
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

    const tabs: Array<{ id: TabId; label: string }> =
        useMemo(
            () => [
                { id: 'participants', label: 'Участники' },
                { id: 'media', label: 'Медиа' },
                { id: 'files', label: 'Файлы' },
                { id: 'voice', label: 'Голосовые' },
                { id: 'links', label: 'Ссылки' },
            ],
            [],
        )

    // При монтировании компонента блокируем скролл страницы
    useEffect(() => {
        // Блокируем скролл страницы при открытии таба
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'

        return () => {
            // Разблокируем скролл страницы при закрытии таба
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.width = ''

            // Очищаем таймаут при размонтировании
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [])

    // При монтировании компонента скроллим к активной вкладке
    useEffect(() => {
        const activeIndex = tabs.findIndex(
            (tab) => tab.id === activeTab,
        )
        if (activeIndex >= 0) {
            // Очищаем предыдущий таймаут
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            // Используем таймаут для гарантии, что DOM обновлен
            scrollTimeoutRef.current = setTimeout(() => {
                const tabElement =
                    tabsRef.current[activeIndex]
                if (tabElement) {
                    tabElement.scrollIntoView({
                        behavior: isInitialMount.current
                            ? 'auto'
                            : 'smooth',
                        block: 'nearest',
                        inline: 'center',
                    })
                }

                // После первого монтирования сбрасываем флаг
                if (isInitialMount.current) {
                    isInitialMount.current = false
                }
            }, 100)
        }
    }, [activeTab, tabs])

    // Обработчик клика по кнопке таба
    const handleTabClick = (
        tabId: TabId,
        index: number,
    ) => {
        onTabClick(tabId, index)

        const tabElement = tabsRef.current[index]
        if (tabElement) {
            tabElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            })
        }
    }

    // Обработчик колесика для предотвращения браузерного скролла
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className={`
        flex h-(--screen-height-list) min-h-0 flex-col overflow-hidden
        rounded-md bg-white-bg
      `}
            onWheel={handleWheel}
        >
            {/* Header с кнопкой назад и заголовком */}
            <div
                className={`
        flex items-center justify-start gap-3 rounded-t-md border-b
        border-app-divider bg-gray-main px-4 py-4
      `}
            >
                <Button
                    onClick={onBack}
                    aria-label="Назад"
                    variant="ghost"
                    size="sm"
                    className={`
            flex items-center justify-center rounded-full p-0 text-text-black
            hover:bg-accent-violet-ultra-light
          `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>

                <h2 className="text-lg font-medium tracking-extra-tight text-text-black">
                    {tabTitle}
                </h2>
            </div>

            {/* Блок с кнопками-табами */}
            <div className="mt-0">
                <div
                    ref={containerRef}
                    className="scrollbar-hide flex overflow-x-auto"
                    style={{
                        touchAction: 'pan-y pinch-zoom',
                        WebkitOverflowScrolling: 'touch',
                        // Добавляем inline-стили для скрытия скроллбара
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                >
                    {/* Добавляем стили для скрытия скроллбара в WebKit браузерах */}
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            display: none;
                            width: 0;
                            height: 0;
                            background: transparent;
                        }
                    `}</style>
                    <div className="flex space-x-8 border-b-2 border-b-gray-200 px-4 pb-0">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                ref={(el) => {
                                    tabsRef.current[index] =
                                        el
                                }}
                                onClick={() =>
                                    handleTabClick(
                                        tab.id,
                                        index,
                                    )
                                }
                                className={cn(
                                    `
                    flex-shrink-0 py-2 text-base font-medium whitespace-nowrap
                    transition-all duration-200
                  `,
                                    `
                    relative
                    focus:outline-none
                  `,
                                    'hover:cursor-pointer hover:text-accent-violet-hover',
                                    'min-w-[100px] px-2',
                                    activeTab === tab.id
                                        ? 'font-semibold text-accent-violet-primary'
                                        : 'text-text-black',
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div
                                        className={`
                    absolute right-0 bottom-0 left-0 h-1.5 rounded-full
                    bg-accent-violet-primary
                  `}
                                    ></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Контент таба */}
            <div className="relative flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
