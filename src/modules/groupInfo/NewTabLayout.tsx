'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import { useRef, useEffect, useMemo } from 'react'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

interface NewTabLayoutProps {
    activeTab: TabId
    onBack: () => void
    onTabClick: (tabId: TabId, index: number) => void
    children: React.ReactNode
    tabTitle: string
    onScroll?: (scrollY: number) => void
    onAttemptReturn?: (deltaY?: number) => void
    hideScrollbar?: boolean
    initialScrollTop?: number
}

export default function NewTabLayout({
    activeTab,
    onBack,
    onTabClick,
    children,
    tabTitle,
    onScroll,
    onAttemptReturn,
    hideScrollbar,
    initialScrollTop,
}: NewTabLayoutProps) {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollbarRef = useRef<unknown>(null)

    const tabs = useMemo<Array<{ id: TabId; label: string }>>(() => [
        { id: 'participants', label: 'Участники' },
        { id: 'media', label: 'Медиа' },
        { id: 'files', label: 'Файлы' },
        { id: 'voice', label: 'Голосовые' },
        { id: 'links', label: 'Ссылки' },
    ], [])

    // Восстанавливаем позицию скролла
    useEffect(() => {
        if (typeof initialScrollTop === 'number' && scrollbarRef.current) {
            const t = setTimeout(() => {
                (scrollbarRef.current as { scrollTo?: (position: number) => void })?.scrollTo?.(initialScrollTop)
            }, 40)
            return () => clearTimeout(t)
        }
    }, [initialScrollTop])

    // Скроллим к активному табу
    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
        if (activeIndex >= 0) {
            const tabElement = tabsRef.current[activeIndex]
            if (tabElement) {
                setTimeout(() => {
                    tabElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center',
                    })
                }, 100)
            }
        }
    }, [activeTab, tabs])

    const handleTabClick = (tabId: TabId, index: number) => {
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

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className={`
              flex max-h-[calc(100vh-112px)] min-h-0 flex-col overflow-hidden
              rounded-md bg-gray-main
            `}
            onWheel={handleWheel}
        >
            {/* Header с кнопкой назад и заголовком */}
            <div className={`
              flex items-center justify-start gap-3 rounded-t-md border-b
              border-app-divider bg-gray-main px-4 py-4
            `}>
                <Button
                    onClick={onBack}
                    aria-label="Назад"
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center justify-center rounded-full p-0
                      text-text-black
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>

                <h2 className={`
                  text-lg font-medium tracking-extra-tight text-text-black
                `}>
                    {tabTitle}
                </h2>
            </div>

            {/* Блок с кнопками-табами */}
            <div className="shrink-0">
                <div
                    ref={containerRef}
                    className="scrollbar-hide flex overflow-x-auto"
                >
                    <div className={`
                      flex space-x-8 border-b-2 border-b-gray-200 px-4 pb-0
                    `}>
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                ref={(el) => {
                                    tabsRef.current[index] = el
                                }}
                                onClick={() => handleTabClick(tab.id, index)}
                                className={cn(
                                    `
                                      flex-shrink-0 py-2 text-base font-medium
                                      whitespace-nowrap transition-all
                                      duration-200
                                    `,
                                    `
                                      relative
                                      focus:outline-none
                                    `,
                                    `
                                      hover:cursor-pointer
                                      hover:text-accent-violet-hover
                                    `,
                                    'min-w-[100px] px-2',
                                    'font-medium',
                                    activeTab === tab.id
                                        ? 'text-accent-violet-primary'
                                        : 'text-text-black'
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className={`
                                      absolute right-0 bottom-0 left-0 h-1.5
                                      rounded-full bg-accent-violet-primary
                                    `}></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Контент таба с CustomScrollbar */}
            <CustomScrollbar
                ref={scrollbarRef}
                className="h-full flex-1"
                contentClassName="p-4"
                onScroll={onScroll}
                onAttemptScrollBeyondTop={onAttemptReturn}
                hideScrollbar={hideScrollbar}
                autoHeight={false}
            >
                {children}
            </CustomScrollbar>
        </div>
    )
}