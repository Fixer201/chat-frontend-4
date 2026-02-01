// @modules/group-info/components/GroupInfoSidebar.tsx
'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from 'react'

import ParticipantsTab from './tabs/ParticipantsTab'
import MediaTab from './tabs/MediaTab'
import FilesTab from './tabs/FilesTab'
import VoiceTab from './tabs/VoiceTab'
import LinksTab from './tabs/LinksTab'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'
type ViewMode = 'main' | 'tab'

export default function GroupInfoSidebar() {
    const [notificationsEnabled, setNotificationsEnabled] =
        useState(true)
    const [isCopied, setIsCopied] = useState(false)
    const [activeTab, setActiveTab] =
        useState<TabId>('participants')
    const [viewMode, setViewMode] =
        useState<ViewMode>('main')
    const [isTransitioning, setIsTransitioning] =
        useState(false)
    const [isMouseOver, setIsMouseOver] = useState(false)
    const [justSwitchedToTab, setJustSwitchedToTab] =
        useState(false)

    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const mainContentRef = useRef<HTMLDivElement>(null)
    const tabsContainerRef = useRef<HTMLDivElement>(null)
    const lastTouchY = useRef(0)
    const lastWheelTime = useRef(0)

    // Для отслеживания скролла в табах
    const lastScrollY = useRef<number>(0)
    const lastScrollDirection = useRef<'up' | 'down'>(
        'down',
    )
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null) // Исправлено
    const hasScrolledDownRef = useRef<boolean>(false)
    const returningRef = useRef<boolean>(false) // Флаг чтобы избежать повторного возврата

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled)
    }

    const handleCopyLink = () => {
        console.log('Ссылка скопирована в буфер обмена')
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 700)
    }

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

    // Функция для скролла к активной кнопке
    const scrollToTab = (tabIndex: number) => {
        const tabElement = tabsRef.current[tabIndex]
        const container = containerRef.current

        if (tabElement && container) {
            tabElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            })
        }
    }

    // Обработчик клика по кнопке в главном режиме
    const handleMainTabClick = (
        tabId: TabId,
        index: number,
    ) => {
        setActiveTab(tabId)
        setIsTransitioning(true)
        setJustSwitchedToTab(true)
        lastScrollY.current = 0
        lastScrollDirection.current = 'down'
        hasScrolledDownRef.current = false
        returningRef.current = false

        // Плавный переход к табу
        setTimeout(() => {
            setViewMode('tab')
            setIsTransitioning(false)
            setTimeout(() => scrollToTab(index), 100)

            // Сбрасываем флаг через 800мс чтобы не было мгновенного возврата
            setTimeout(() => {
                setJustSwitchedToTab(false)
            }, 800)
        }, 300)
    }

    // Обработчик клика по кнопке в режиме таба
    const handleTabContentTabClick = (
        tabId: TabId,
        index: number,
    ) => {
        setActiveTab(tabId)
        setTimeout(() => scrollToTab(index), 100)
    }

    // Функция возврата из режима таба в главный режим
    const handleBackFromTab = () => {
        setViewMode('main')
    }

    // Обработчик касания в главном режиме
    const handleMainTouchStart = (e: React.TouchEvent) => {
        lastTouchY.current = e.touches[0].clientY
    }

    const handleMainTouchMove = (e: React.TouchEvent) => {
        if (isTransitioning || viewMode !== 'main') return

        const currentTouchY = e.touches[0].clientY
        const deltaY = lastTouchY.current - currentTouchY

        // Если скроллим вниз с достаточной скоростью
        if (deltaY > 20 && mainContentRef.current) {
            setIsTransitioning(true)
            setJustSwitchedToTab(true)
            lastScrollY.current = 0
            lastScrollDirection.current = 'down'
            hasScrolledDownRef.current = false
            returningRef.current = false

            setTimeout(() => {
                setViewMode('tab')
                setIsTransitioning(false)

                // Сбрасываем флаг через 800мс чтобы не было мгновенного возврата
                setTimeout(() => {
                    setJustSwitchedToTab(false)
                }, 800)
            }, 300)
        }

        lastTouchY.current = currentTouchY
        e.preventDefault()
    }

    // Обработчик колесика мыши
    const handleMainWheel = (e: React.WheelEvent) => {
        if (isTransitioning || viewMode !== 'main') return

        // Дебаунсим wheel события (максимум 1 раз в 50мс)
        const now = Date.now()
        if (now - lastWheelTime.current < 50) return
        lastWheelTime.current = now

        // Если скроллим вниз
        if (e.deltaY > 20 && mainContentRef.current) {
            e.preventDefault()
            e.stopPropagation()
            setIsTransitioning(true)
            setJustSwitchedToTab(true)
            lastScrollY.current = 0
            lastScrollDirection.current = 'down'
            hasScrolledDownRef.current = false
            returningRef.current = false

            setTimeout(() => {
                setViewMode('tab')
                setIsTransitioning(false)

                // Сбрасываем флаг через 800мс чтобы не было мгновенного возврата
                setTimeout(() => {
                    setJustSwitchedToTab(false)
                }, 800)
            }, 300)
        }
    }

    // Обработчик скролла в режиме таба
    const handleTabScrollEvent = (scrollY: number) => {
        // Игнорируем если уже в процессе возврата
        if (returningRef.current || isTransitioning) return

        // Игнорируем первые 800мс после переключения
        if (justSwitchedToTab) {
            lastScrollY.current = scrollY
            return
        }

        // Определяем направление скролла
        const direction =
            scrollY < lastScrollY.current ? 'up' : 'down'

        // Сохраняем информацию о скролле вниз
        if (direction === 'down' && scrollY > 30) {
            hasScrolledDownRef.current = true
        }

        // Сохраняем текущую позицию скролла
        lastScrollY.current = scrollY
        lastScrollDirection.current = direction

        // Очищаем предыдущий таймаут
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
        }

        // Дебаунсим проверку для избежания ложных срабатываний
        scrollTimeoutRef.current = setTimeout(() => {
            // Возврат только если:
            // 1. Скроллим ВВЕРХ
            // 2. Находимся в самом верху (scrollY <= 5)
            // 3. Пользователь уже скроллил достаточно вниз (чтобы избежать случайного возврата)
            if (
                direction === 'up' &&
                scrollY <= 5 &&
                viewMode === 'tab'
            ) {
                // Проверяем, что пользователь действительно скроллил вниз перед этим
                if (
                    hasScrolledDownRef.current &&
                    !returningRef.current
                ) {
                    returningRef.current = true
                    setIsTransitioning(true)
                    setTimeout(() => {
                        setViewMode('main')
                        setIsTransitioning(false)
                        // Сбрасываем флаг после возврата
                        hasScrolledDownRef.current = false
                        returningRef.current = false
                    }, 300)
                }
            }
        }, 50)
    }

    // Автоскролл при изменении активной вкладки в режиме таба
    useEffect(() => {
        if (viewMode === 'tab') {
            const activeIndex = tabs.findIndex(
                (tab) => tab.id === activeTab,
            )
            scrollToTab(activeIndex)
        }
    }, [activeTab, viewMode, tabs])

    // Предотвращаем браузерный скролл когда компонент активен
    useEffect(() => {
        const preventDefault = (e: TouchEvent) => {
            if (viewMode === 'main' || viewMode === 'tab') {
                e.preventDefault()
            }
        }

        const preventDefaultScroll = (e: Event) => {
            if (viewMode === 'main' || viewMode === 'tab') {
                e.preventDefault()
            }
        }

        // Блокируем все события скролла
        document.addEventListener(
            'touchmove',
            preventDefault,
            { passive: false },
        )
        document.addEventListener(
            'scroll',
            preventDefaultScroll,
            { passive: false },
        )

        return () => {
            document.removeEventListener(
                'touchmove',
                preventDefault,
            )
            document.removeEventListener(
                'scroll',
                preventDefaultScroll,
            )
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [viewMode])

    // Если мы в режиме таба, рендерим соответствующий компонент
    if (viewMode === 'tab') {
        switch (activeTab) {
            case 'participants':
                return (
                    <ParticipantsTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
            case 'media':
                return (
                    <MediaTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
            case 'files':
                return (
                    <FilesTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
            case 'voice':
                return (
                    <VoiceTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
            case 'links':
                return (
                    <LinksTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
            default:
                return (
                    <ParticipantsTab
                        activeTab={activeTab}
                        onBack={handleBackFromTab}
                        onTabClick={
                            handleTabContentTabClick
                        }
                        onScroll={handleTabScrollEvent}
                    />
                )
        }
    }

    // Главный режим - исходный интерфейс
    return (
        <div
            className={`
              relative flex h-full flex-col overflow-hidden rounded-md
              bg-white-bg
            `}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
        >
            {/* Header с кнопками и заголовком */}
            <div
                className={`
              flex items-center justify-between gap-3 rounded-t-md border-b
              border-app-divider bg-gray-main px-4 py-4
            `}
            >
                <Button
                    onClick={() => console.log('Закрыть')}
                    aria-label="Закрыть"
                    variant="ghost"
                    size="sm"
                    className={`
                      flex items-center justify-center rounded-full p-0
                      text-text-black
                      hover:bg-accent-violet-ultra-light
                    `}
                >
                    <Image
                        src="/icons/detailInfo/detailInfoClose.svg"
                        alt="Закрыть"
                        width={24}
                        height={24}
                    />
                </Button>

                <h2
                    className={`
                  ml-3 flex-1 text-left text-lg font-medium tracking-extra-tight
                  text-text-black
                `}
                >
                    Информация о группе
                </h2>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() =>
                            console.log('Настройки')
                        }
                        aria-label="Настройки"
                        variant="ghost"
                        size="sm"
                        className={`
                          flex items-center justify-center rounded-full p-0
                          text-text-black
                          hover:bg-accent-violet-ultra-light
                        `}
                    >
                        <Image
                            src="/icons/detailInfo/detailInfoDropdown.svg"
                            alt="Настройки"
                            width={24}
                            height={24}
                        />
                    </Button>

                    <Button
                        onClick={() =>
                            console.log(
                                'Дополнительные настройки',
                            )
                        }
                        aria-label="Дополнительные настройки"
                        variant="ghost"
                        size="sm"
                        className={`
                          flex items-center justify-center rounded-full p-0
                          text-text-black
                          hover:bg-accent-violet-ultra-light
                        `}
                    >
                        <Image
                            src="/icons/detailInfo/detailInfoSettings.svg"
                            alt="Детальные настройки"
                            width={24}
                            height={24}
                        />
                    </Button>
                </div>
            </div>

            {/* Основной контент */}
            <div
                ref={mainContentRef}
                className="flex-1 overflow-hidden"
                onWheel={handleMainWheel}
                onTouchStart={handleMainTouchStart}
                onTouchMove={handleMainTouchMove}
                style={{
                    height: 'calc(100% - 64px)',
                    touchAction: 'none',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'none',
                }}
            >
                <div className="relative">
                    <div className="relative h-60 w-full overflow-hidden">
                        <Image
                            src="/images/tempSIdebarInfo.png"
                            alt="Группа"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div
                        className={`
                      absolute right-0 bottom-0 left-0 rounded-b-md
                      bg-gradient-to-t from-black/70 to-transparent p-4
                    `}
                    >
                        <h3 className="text-2xl font-semibold text-white">
                            Рабочая группа
                        </h3>
                        <p className="mt-1 text-lg text-white/90">
                            5 участников
                        </p>
                    </div>
                </div>

                {/* Блок с уведомлениями и информацией */}
                <div className="bg-gray-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-text-black">
                            Уведомление
                        </span>

                        <button
                            onClick={toggleNotifications}
                            aria-label={
                                notificationsEnabled
                                    ? 'Отключить уведомления'
                                    : 'Включить уведомления'
                            }
                            className={`
                              relative inline-flex h-8 w-14 items-center
                              rounded-full transition-colors
                              hover:cursor-pointer
                              focus:outline-none
                            `}
                            style={{
                                backgroundColor:
                                    notificationsEnabled
                                        ? '#3B82F6'
                                        : '#D1D5DB',
                            }}
                        >
                            <span
                                className={cn(
                                    `
                                      inline-block h-6 w-6 transform
                                      rounded-full bg-white transition-transform
                                    `,
                                    notificationsEnabled
                                        ? 'translate-x-6'
                                        : 'translate-x-1',
                                )}
                            />
                        </button>
                    </div>

                    <div className="mx-0 my-2 rounded-md bg-white-bg p-1">
                        <div
                            className={`
                          flex flex-col justify-between p-0.5 pr-8
                        `}
                        >
                            <span
                                className={`
                                  p-0 text-xs font-medium tracking-extra-tight
                                  text-text-gray
                                `}
                            >
                                Описание
                            </span>
                            <span className="p-0 text-base text-black">
                                Группа создана для общения
                                между дизайнерами, передачи
                                знаний и опыта, помощи
                                и активного взаимодействия!
                            </span>
                        </div>
                    </div>

                    <div className="mx-0 my-1 rounded-md bg-white-bg p-1">
                        <div className="flex flex-col justify-between p-0.5">
                            <span
                                className={`
                                  mb-1 p-0 text-xs font-medium
                                  tracking-extra-tight text-text-gray
                                `}
                            >
                                Ссылка на приглашение в
                                группу
                            </span>

                            <div className="flex items-center justify-between">
                                <span
                                    className={`
                                  pr-2 text-base break-all
                                  text-accent-violet-primary
                                `}
                                >
                                    http://a-chat.su/fGHgfdYUfjsf
                                </span>

                                <Button
                                    onClick={() =>
                                        handleCopyLink()
                                    }
                                    aria-label="Копировать ссылку"
                                    variant="ghost"
                                    size="sm"
                                    className={`
                                      flex shrink-0 items-center justify-center
                                      rounded-full p-0 text-text-black
                                      hover:bg-accent-violet-ultra-light
                                    `}
                                >
                                    <Image
                                        src="/icons/detailInfo/copyLink.svg"
                                        alt="Копировать ссылку"
                                        width={24}
                                        height={24}
                                        className={cn(
                                            isCopied
                                                ? 'opacity-50'
                                                : `
                                              opacity-100
                                            `,
                                        )}
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Блок с кнопками-табами (в главном режиме) */}
                    <div
                        ref={tabsContainerRef}
                        className="mt-1"
                    >
                        <div
                            ref={containerRef}
                            className="flex overflow-x-auto"
                            style={{
                                touchAction:
                                    'pan-y pinch-zoom',
                                WebkitOverflowScrolling:
                                    'touch',
                            }}
                        >
                            <div
                                className={`
                              flex space-x-8 border-b-2 border-b-gray-200 px-4
                              pb-0
                            `}
                            >
                                {tabs.map((tab, index) => (
                                    <button
                                        key={tab.id}
                                        ref={(el) => {
                                            tabsRef.current[
                                                index
                                            ] = el
                                        }}
                                        onClick={() =>
                                            handleMainTabClick(
                                                tab.id,
                                                index,
                                            )
                                        }
                                        className={cn(
                                            `
                                              flex-shrink-0 py-2 text-base
                                              font-medium whitespace-nowrap
                                              transition-all duration-200
                                            `,
                                            `
                                              relative
                                              focus:outline-none
                                            `,
                                            'hover:text-accent-violet-hover',
                                            'hover:cursor-pointer',
                                            activeTab ===
                                                tab.id
                                                ? `
                                                  font-semibold
                                                  text-accent-violet-primary
                                                `
                                                : `
                                                  text-text-black
                                                  hover:text-text-gray
                                                `,
                                        )}
                                    >
                                        {tab.label}
                                        {activeTab ===
                                            tab.id && (
                                            <div
                                                className={`
                                              absolute right-0 bottom-0 left-0
                                              h-1.5 rounded-full
                                              bg-accent-violet-primary
                                            `}
                                            ></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Индикатор скролла */}
                    <div className="mt-2 py-4 text-center">
                        <div className="text-sm text-gray-500">
                            <span className="mb-1 inline-block animate-bounce">
                                ↓
                            </span>
                            <div>
                                Скролл вниз для перехода к
                                содержимому
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Глобальные стили для предотвращения скролла */}
            <style jsx global>{`
                * {
                    box-sizing: border-box;
                }

                /* Предотвращаем скролл страницы при наведении на этот компонент */
                body {
                    overflow: ${isMouseOver ||
                    viewMode === 'tab'
                        ? 'hidden'
                        : 'auto'} !important;
                    position: ${isMouseOver ||
                    viewMode === 'tab'
                        ? 'fixed'
                        : 'static'};
                    width: 100%;
                }

                /* Убираем все эффекты ховера для скроллбара в этом компоненте */
                .custom-scroll::-webkit-scrollbar {
                    display: none !important;
                }

                /* Убираем стандартный скроллбар в Firefox */
                * {
                    scrollbar-width: none !important;
                }

                /* Убираем стандартный скроллбар в IE/Edge */
                * {
                    -ms-overflow-style: none !important;
                }

                /* Предотвращаем выделение текста при перетаскивании */
                .no-select {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }
            `}</style>
        </div>
    )
}
