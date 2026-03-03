// TabLayout.tsx
'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import { useRef, useEffect, useMemo } from 'react'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import type { CustomScrollbarRef } from '@shared/ui/CustomScrollbar/CustomScrollbar'

// Типы для вкладок
type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

// Интерфейс пропсов компонента лейаута вкладок
interface TabLayoutProps {
    activeTab: TabId // Активная вкладка
    onBack: () => void // Функция возврата в основной режим
    onTabClick: (tabId: TabId, index: number) => void // Обработчик клика по табу
    children: React.ReactNode // Контент вкладки
    tabTitle: string // Заголовок вкладки по умолчанию
    onScroll?: (scrollY: number) => void // Обработчик скролла
    onAttemptReturn?: (deltaY?: number) => void // Обработчик попытки возврата (скролл выше контента)
    hideScrollbar?: boolean // Флаг для скрытия скроллбара (при анимации возврата)
    initialScrollTop?: number // Начальная позиция скролла для восстановления
    dynamicTitle?: string // Динамический заголовок (может меняться, например, "Участники (5)")
}

export default function TabLayout({
    activeTab,
    onBack,
    onTabClick,
    children,
    tabTitle,
    onScroll,
    onAttemptReturn,
    hideScrollbar,
    initialScrollTop,
    dynamicTitle,
}: TabLayoutProps) {
    // Refs для DOM-элементов
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]) // Массив ref-ов кнопок табов
    const containerRef = useRef<HTMLDivElement>(null) // Контейнер для горизонтального скролла табов
    const scrollbarRef = useRef<CustomScrollbarRef | null>(
        null,
    ) // Ref для кастомного скроллбара
    const isInitialMount = useRef(true) // Флаг первого монтирования (для отключения анимации при первом скролле)
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null) // Таймаут для debounce скролла

    // Список доступных вкладок (мемоизирован)
    const tabs = useMemo<
        Array<{ id: TabId; label: string }>
    >(
        () => [
            { id: 'participants', label: 'Участники' },
            { id: 'media', label: 'Медиа' },
            { id: 'files', label: 'Файлы' },
            { id: 'voice', label: 'Голосовые' },
            { id: 'links', label: 'Ссылки' },
        ],
        [],
    )

    // При монтировании компонента или изменении activeTab скроллим к активной вкладке
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
                        // При первом монтировании - без анимации, при последующих - с анимацией
                        behavior: isInitialMount.current
                            ? 'auto'
                            : 'smooth',
                        block: 'nearest',
                        inline: 'center', // Центрируем по горизонтали
                    })
                }

                // После первого монтирования сбрасываем флаг
                if (isInitialMount.current) {
                    isInitialMount.current = false
                }
            }, 100) // Небольшая задержка для завершения рендера
        }
    }, [activeTab, tabs])

    // Восстанавливаем позицию скролла при монтировании или изменении initialScrollTop
    useEffect(() => {
        if (
            typeof initialScrollTop === 'number' &&
            scrollbarRef.current
        ) {
            const t = setTimeout(() => {
                ;(
                    scrollbarRef.current as {
                        scrollTo?: (
                            position: number,
                        ) => void
                    }
                )?.scrollTo?.(initialScrollTop) // Прокручиваем к сохранённой позиции
            }, 40)
            return () => clearTimeout(t)
        }
    }, [initialScrollTop])

    // Обработчик клика по кнопке таба
    const handleTabClick = (
        tabId: TabId,
        index: number,
    ) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[TabLayout] handleTabClick', {
                tabId,
                index,
            })
        }

        onTabClick(tabId, index) // Вызываем внешний обработчик

        // Прокручиваем к выбранному табу
        const tabElement = tabsRef.current[index]
        if (tabElement) {
            tabElement.scrollIntoView({
                behavior: 'smooth', // Всегда с анимацией при клике
                block: 'nearest',
                inline: 'center',
            })
        }
    }

    // Обработчик колесика для предотвращения всплытия события (чтобы не конфликтовать с родительским скроллом)
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation()
    }

    return (
        <div
            className={`
              flex h-full min-h-0 flex-col overflow-hidden rounded-md
              bg-gray-main
            `}
            onWheel={handleWheel} // Блокируем всплытие колесика
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
                      flex items-center justify-center rounded-full p-0
                      text-text-black
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </Button>

                <h2
                    className={`
                      text-lg font-medium tracking-extra-tight text-text-black
                    `}
                >
                    {/* Используем динамический заголовок, если он есть, иначе заголовок по умолчанию */}
                    {dynamicTitle || tabTitle}
                </h2>
            </div>

            {/* Блок с кнопками-табами (горизонтальный скролл) */}
            <div className="shrink-0">
                {' '}
                {/* Не сжимается при скролле */}
                <div
                    ref={containerRef}
                    className="scrollbar-hide flex overflow-x-auto" // Скрываем стандартный скроллбар
                >
                    <div
                        className={`
                          flex space-x-8 border-b-2 border-b-gray-border px-4
                          pb-0
                        `}
                    >
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
                                      flex-shrink-0 py-2 text-base
                                      whitespace-nowrap transition-all
                                      duration-200
                                    `,
                                    `
                                      relative
                                      focus:outline-none
                                    `,
                                    `
                                      hover:cursor-pointer
                                      hover:text-accent-violet-primary
                                    `,
                                    'min-w-25 px-2', // Минимальная ширина 100px
                                    activeTab === tab.id
                                        ? 'text-accent-violet-primary' // Активный - фиолетовый
                                        : 'text-text-black', // Неактивный - чёрный
                                )}
                            >
                                {tab.label}
                                {/* Индикатор активного таба (полоска снизу) */}
                                {activeTab === tab.id && (
                                    <div
                                        className={`
                                          absolute right-0 bottom-0 left-0 h-1.5
                                          rounded-full bg-accent-violet-primary
                                        `}
                                    ></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Контент таба с кастомным скроллбаром */}
            <CustomScrollbar
                ref={scrollbarRef}
                className="h-full flex-1" // Занимает оставшееся пространство
                contentClassName="relative" // Относительное позиционирование для контента
                onScroll={onScroll} // Прокидываем обработчик скролла
                onAttemptScrollBeyondTop={onAttemptReturn} // Обработчик попытки скролла выше контента
                hideScrollbar={hideScrollbar} // Скрыть скроллбар (при анимации возврата)
                autoHeight={false} // Отключаем автоматическую высоту
            >
                {children}
            </CustomScrollbar>
        </div>
    )
}
