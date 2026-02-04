'use client'

import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button/Button'
import Image from 'next/image'
import {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from 'react'

import TabContentPreview from './TabContentPreview'
import TabLayout from './TabLayout'
import ParticipantsContent from './tabs/ParticipantsContent'
import MediaContent from './tabs/MediaContent'
import FilesContent from './tabs/FilesContent'
import VoiceContent from './tabs/VoiceContent'
import LinksContent from './tabs/LinksContent'

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
    const [
        hideTabScrollbarDuringReturn,
        setHideTabScrollbarDuringReturn,
    ] = useState(false)
    const [hasScrolledDown, setHasScrolledDown] =
        useState(false)
    const [isReturning, setIsReturning] = useState(false)
    // Добавляем состояние для хранения позиций скролла
    const [tabScrollPositions, setTabScrollPositions] =
        useState<Record<TabId, number>>({
            participants: 0,
            media: 0,
            files: 0,
            voice: 0,
            links: 0,
        })

    // Вычисляем, нужно ли блокировать скролл документа
    const preventScroll = isMouseOver || viewMode === 'tab'

    // Эффект для блокировки скролла страницы
    useEffect(() => {
        if (preventScroll) {
            document.body.classList.add(
                'group-info-sidebar-scroll-lock',
            )
        } else {
            document.body.classList.remove(
                'group-info-sidebar-scroll-lock',
            )
        }

        return () => {
            document.body.classList.remove(
                'group-info-sidebar-scroll-lock',
            )
        }
    }, [preventScroll])

    // Обработчик попытки скролла вверх в табе
    const handleAttemptReturn = useCallback(
        (deltaY?: number) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleAttemptReturn',
                    {
                        deltaY,
                        returning: isReturning,
                        isTransitioning,
                        justSwitchedToTab,
                        viewMode,
                    },
                )
            }

            if (
                isReturning ||
                isTransitioning ||
                justSwitchedToTab ||
                viewMode !== 'tab'
            )
                return

            const strongAttempt =
                typeof deltaY === 'number' && deltaY < -35

            // Если пользователь не скроллил вниз раньше и это не сильный жест — игнорируем
            if (!hasScrolledDown && !strongAttempt) return

            setIsReturning(true)
            setHideTabScrollbarDuringReturn(true)
            setIsTransitioning(true)

            setTimeout(() => {
                setViewMode('main')
                setIsTransitioning(false)
                setHideTabScrollbarDuringReturn(false)
                setHasScrolledDown(false)
                setIsReturning(false)
            }, 300)
        },
        [
            isTransitioning,
            justSwitchedToTab,
            viewMode,
            hasScrolledDown,
            isReturning,
        ],
    )

    const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const mainContentRef = useRef<HTMLDivElement>(null)
    const tabsContainerRef = useRef<HTMLDivElement>(null)
    const lastTouchY = useRef(0)
    const wheelDeltaRef = useRef(0)
    const wheelResetTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)
    const lastWheelDirRef = useRef<'up' | 'down' | null>(
        null,
    )

    // Для отслеживания скролла в табах
    const lastScrollY = useRef<number>(0)
    const lastScrollDirection = useRef<'up' | 'down'>(
        'down',
    )
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

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
    const scrollToTab = useCallback(
        (tabIndex: number) => {
            const tabElement = tabsRef.current[tabIndex]
            const container = containerRef.current

            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] scrollToTab',
                    { tabIndex },
                )
            }

            if (tabElement && container) {
                const left = tabElement.offsetLeft
                const right = left + tabElement.offsetWidth
                const visibleLeft = container.scrollLeft
                const visibleRight =
                    visibleLeft + container.clientWidth

                if (
                    left < visibleLeft ||
                    right > visibleRight
                ) {
                    if (
                        process.env.NODE_ENV !==
                        'production'
                    ) {
                        console.debug(
                            '[GroupInfoSidebar] scrollIntoView for tab',
                            {
                                left,
                                right,
                                visibleLeft,
                                visibleRight,
                            },
                        )
                    }
                    const inlineValue =
                        tabIndex === 0
                            ? 'start'
                            : tabIndex === tabs.length - 1
                              ? 'end'
                              : 'center'
                    tabElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: inlineValue,
                    })
                }
            }
        },
        [tabs.length],
    )

    // Обработчик клика по кнопке в главном режиме
    const handleMainTabClick = useCallback(
        (tabId: TabId, index: number) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleMainTabClick',
                    { tabId, index, viewMode },
                )
            }

            scrollToTab(index)

            setActiveTab(tabId)
            setIsTransitioning(true)
            setJustSwitchedToTab(true)
            lastScrollY.current = 0
            lastScrollDirection.current = 'down'
            setHasScrolledDown(false)
            setIsReturning(false)

            setTimeout(() => {
                setViewMode('tab')
                setIsTransitioning(false)
                setTimeout(() => scrollToTab(index), 100)

                setTimeout(() => {
                    setJustSwitchedToTab(false)
                }, 800)
            }, 300)
        },
        [scrollToTab, viewMode],
    )

    // Функция возврата из режима таба в главный режим
    const handleBackFromTab = useCallback(() => {
        setViewMode('main')
    }, [])

    // Обработчик касания в главном режиме
    const handleMainTouchStart = useCallback(
        (e: React.TouchEvent) => {
            lastTouchY.current = e.touches[0].clientY
        },
        [],
    )

    const handleMainTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleMainTouchMove',
                    {
                        isTransitioning,
                        viewMode,
                        touches: e.touches.length,
                    },
                )
            }
            if (isTransitioning || viewMode !== 'main')
                return

            const currentTouchY = e.touches[0].clientY
            const deltaY =
                lastTouchY.current - currentTouchY

            if (deltaY > 50 && mainContentRef.current) {
                const target = mainContentRef.current
                const scrollTop = target.scrollTop
                const scrollHeight = target.scrollHeight
                const clientHeight = target.clientHeight

                if (
                    scrollTop + clientHeight >=
                    scrollHeight - 50
                ) {
                    setIsTransitioning(true)
                    setJustSwitchedToTab(true)
                    lastScrollY.current = 0
                    lastScrollDirection.current = 'down'
                    setHasScrolledDown(false)
                    setIsReturning(false)

                    setTimeout(() => {
                        setViewMode('tab')
                        setIsTransitioning(false)

                        setTimeout(() => {
                            setJustSwitchedToTab(false)
                        }, 800)
                    }, 300)
                }
            }

            lastTouchY.current = currentTouchY
            e.preventDefault()
        },
        [isTransitioning, viewMode],
    )

    // Обработчик колесика мыши
    const handleMainWheel = useCallback(
        (e: React.WheelEvent) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleMainWheel',
                    {
                        deltaY: e.deltaY,
                        isTransitioning,
                        viewMode,
                    },
                )
            }
            if (isTransitioning || viewMode !== 'main')
                return

            if (e.deltaY > 40 && mainContentRef.current) {
                const target = mainContentRef.current
                const scrollTop = target.scrollTop
                const scrollHeight = target.scrollHeight
                const clientHeight = target.clientHeight

                if (
                    scrollTop + clientHeight >=
                    scrollHeight - 50
                ) {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsTransitioning(true)
                    setJustSwitchedToTab(true)
                    lastScrollY.current = 0
                    lastScrollDirection.current = 'down'
                    setHasScrolledDown(false)
                    setIsReturning(false)

                    setTimeout(() => {
                        setViewMode('tab')
                        setIsTransitioning(false)

                        setTimeout(() => {
                            setJustSwitchedToTab(false)
                        }, 800)
                    }, 300)
                }
            }
        },
        [isTransitioning, viewMode],
    )

    // Capture-phase wheel handler
    const handleMainWheelCapture = useCallback(
        (e: WheelEvent) => {
            if (process.env.NODE_ENV !== 'production') {
                try {
                    console.debug(
                        '[GroupInfoSidebar] handleMainWheelCapture',
                        {
                            deltaY: e.deltaY,
                            isTransitioning,
                            viewMode,
                            target: (
                                e.target as HTMLElement
                            ).tagName,
                        },
                    )
                } catch (_error) {
                    // Игнорируем ошибки
                }
            }

            if (isTransitioning || viewMode !== 'main')
                return

            if (e.deltaY <= 0) {
                if (lastWheelDirRef.current === 'down') {
                    wheelDeltaRef.current = 0
                    lastWheelDirRef.current = 'up'
                }
                return
            }

            if (!mainContentRef.current) return
            const target = mainContentRef.current
            const scrollTop = target.scrollTop
            const scrollHeight = target.scrollHeight
            const clientHeight = target.clientHeight

            const atBottom =
                scrollTop + clientHeight >=
                scrollHeight - 10
            if (!atBottom) {
                wheelDeltaRef.current = 0
                lastWheelDirRef.current = 'down'
                return
            }

            if (lastWheelDirRef.current !== 'down') {
                wheelDeltaRef.current = 0
                lastWheelDirRef.current = 'down'
            }
            wheelDeltaRef.current += e.deltaY

            if (wheelResetTimeoutRef.current)
                clearTimeout(wheelResetTimeoutRef.current)
            wheelResetTimeoutRef.current = setTimeout(
                () => {
                    wheelDeltaRef.current = 0
                    lastWheelDirRef.current = null
                },
                250,
            )

            if (wheelDeltaRef.current >= 25) {
                e.preventDefault()
                e.stopPropagation()

                setIsTransitioning(true)
                setJustSwitchedToTab(true)
                lastScrollY.current = 0
                lastScrollDirection.current = 'down'
                setHasScrolledDown(false)
                setIsReturning(false)

                setTimeout(() => {
                    setViewMode('tab')
                    setIsTransitioning(false)

                    setTimeout(() => {
                        setJustSwitchedToTab(false)
                    }, 800)
                }, 300)
            }
        },
        [viewMode, isTransitioning],
    )

    // Обработчик скролла в main режиме
    const handleMainScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (viewMode !== 'main' || isTransitioning)
                return

            const target = e.target as HTMLDivElement
            const scrollTop = target.scrollTop
            const scrollHeight = target.scrollHeight
            const clientHeight = target.clientHeight

            if (
                scrollTop + clientHeight >=
                scrollHeight - 10
            ) {
                setIsTransitioning(true)
                setJustSwitchedToTab(true)
                lastScrollY.current = 0
                lastScrollDirection.current = 'down'
                setHasScrolledDown(false)
                setIsReturning(false)

                setTimeout(() => {
                    setViewMode('tab')
                    setIsTransitioning(false)

                    setTimeout(() => {
                        setJustSwitchedToTab(false)
                    }, 800)
                }, 300)
            }
        },
        [viewMode, isTransitioning],
    )

    // Обработчик скролла в режиме таба
    const handleTabScrollEvent = useCallback(
        (scrollY: number) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleTabScrollEvent',
                    {
                        scrollY,
                        activeTab,
                        justSwitchedToTab,
                        returning: isReturning,
                    },
                )
            }

            if (isReturning || isTransitioning) return

            if (justSwitchedToTab) {
                lastScrollY.current = scrollY
                return
            }

            const direction =
                scrollY < lastScrollY.current
                    ? 'up'
                    : 'down'

            if (direction === 'down' && scrollY > 30) {
                setHasScrolledDown(true)
            }

            lastScrollY.current = scrollY
            lastScrollDirection.current = direction

            // Обновляем позицию скролла в состоянии
            setTabScrollPositions((prev) => ({
                ...prev,
                [activeTab]: scrollY,
            }))

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }

            scrollTimeoutRef.current = setTimeout(() => {
                if (
                    direction === 'up' &&
                    scrollY <= 5 &&
                    viewMode === 'tab'
                ) {
                    if (hasScrolledDown && !isReturning) {
                        setIsReturning(true)
                        setIsTransitioning(true)
                        setTimeout(() => {
                            setViewMode('main')
                            setIsTransitioning(false)
                            setHasScrolledDown(false)
                            setIsReturning(false)
                        }, 300)
                    }
                }
            }, 50)
        },
        [
            activeTab,
            isTransitioning,
            justSwitchedToTab,
            viewMode,
            hasScrolledDown,
            isReturning,
        ],
    )

    // Обработчик клика по кнопке в режиме таба
    const handleTabContentTabClick = useCallback(
        (tabId: TabId, index: number) => {
            if (process.env.NODE_ENV !== 'production') {
                console.debug(
                    '[GroupInfoSidebar] handleTabContentTabClick',
                    {
                        tabId,
                        index,
                        activeTab,
                        isTransitioning,
                    },
                )
            }

            if (tabId === activeTab || isTransitioning) {
                return
            }

            setActiveTab(tabId)

            setJustSwitchedToTab(true)
            setTimeout(() => {
                setJustSwitchedToTab(false)
            }, 400)

            scrollToTab(index)
        },
        [activeTab, isTransitioning, scrollToTab],
    )

    // Автоскролл при изменении активной вкладки в режиме таба
    useEffect(() => {
        if (viewMode === 'tab') {
            const activeIndex = tabs.findIndex(
                (tab) => tab.id === activeTab,
            )
            scrollToTab(activeIndex)
        }
    }, [activeTab, viewMode, tabs, scrollToTab])

    // Автоскролл при возврате в main режим
    useEffect(() => {
        if (viewMode === 'main') {
            const activeIndex = tabs.findIndex(
                (tab) => tab.id === activeTab,
            )
            scrollToTab(activeIndex)
        }
    }, [viewMode, activeTab, tabs, scrollToTab])

    // Attach capture-phase wheel listener
    useEffect(() => {
        const node = mainContentRef.current
        if (!node) return

        node.addEventListener(
            'wheel',
            handleMainWheelCapture as EventListener,
            {
                capture: true,
                passive: false,
            },
        )

        return () => {
            try {
                node.removeEventListener(
                    'wheel',
                    handleMainWheelCapture as EventListener,
                    {
                        capture: true,
                    } as EventListenerOptions,
                )
            } catch (_error) {
                // Игнорируем ошибки
            }
            if (wheelResetTimeoutRef.current) {
                clearTimeout(wheelResetTimeoutRef.current)
                wheelResetTimeoutRef.current = null
            }
            wheelDeltaRef.current = 0
            lastWheelDirRef.current = null
        }
    }, [viewMode, isTransitioning, handleMainWheelCapture])

    // Функция для получения заголовка таба
    const getTabTitle = (tabId: TabId) => {
        switch (tabId) {
            case 'participants':
                return 'Участники'
            case 'media':
                return 'Медиа'
            case 'files':
                return 'Файлы'
            case 'voice':
                return 'Голосовые'
            case 'links':
                return 'Ссылки'
            default:
                return ''
        }
    }

    // Функция для получения контента таба
    const getTabContent = (tabId: TabId) => {
        switch (tabId) {
            case 'participants':
                return <ParticipantsContent />
            case 'media':
                return <MediaContent />
            case 'files':
                return <FilesContent />
            case 'voice':
                return <VoiceContent />
            case 'links':
                return <LinksContent />
            default:
                return null
        }
    }

    // Если мы в режиме таба, рендерим TabLayout с нужным контентом
    if (viewMode === 'tab') {
        return (
            <TabLayout
                activeTab={activeTab}
                onBack={handleBackFromTab}
                onTabClick={handleTabContentTabClick}
                tabTitle={getTabTitle(activeTab)}
                onScroll={handleTabScrollEvent}
                onAttemptReturn={handleAttemptReturn}
                hideScrollbar={hideTabScrollbarDuringReturn}
                initialScrollTop={
                    tabScrollPositions[activeTab]
                }
            >
                {getTabContent(activeTab)}
            </TabLayout>
        )
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
                className={cn(
                    'scrollbar-hide flex-1 overflow-auto',
                    'h-[calc(100%-64px)] touch-none overscroll-none',
                )}
                onWheel={handleMainWheel}
                onTouchStart={handleMainTouchStart}
                onTouchMove={handleMainTouchMove}
                onScroll={handleMainScroll}
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
                            className={cn(
                                `
                                  relative inline-flex h-8 w-14 items-center
                                  rounded-full transition-colors
                                  hover:cursor-pointer
                                  focus:outline-none
                                `,
                                notificationsEnabled
                                    ? 'bg-blue-500'
                                    : `
                                  bg-gray-300
                                `,
                            )}
                        >
                            <span
                                className={cn(
                                    `
                                      inline-block h-6 w-6 transform
                                      rounded-full bg-white transition-transform
                                    `,
                                    notificationsEnabled
                                        ? 'translate-x-6'
                                        : `
                                      translate-x-1
                                    `,
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
                              mb-1 p-0 text-xs font-medium tracking-extra-tight
                              text-text-gray
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
                            className="scrollbar-hide flex overflow-x-auto"
                        >
                            <div
                                className={`
                              flex space-x-4 border-b-2 border-b-gray-200 px-4
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
                                            'min-w-[100px] px-2',
                                            'font-medium',
                                            activeTab ===
                                                tab.id
                                                ? 'text-accent-violet-primary'
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

                    {/* Preview контента активного таба */}
                    <div
                        className={`
                      relative mt-2 max-h-48 overflow-hidden rounded-b-md
                    `}
                    >
                        <TabContentPreview
                            activeTab={activeTab}
                        />
                        {/* Градиент для указания на продолжение */}
                        <div
                            className={`
                          pointer-events-none absolute right-0 bottom-0 left-0
                          h-12 bg-gradient-to-t from-white-bg to-transparent
                        `}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
