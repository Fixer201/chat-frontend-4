'use client'

import {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from 'react'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'
type ViewMode = 'main' | 'tab'

export function useGroupInfoSidebar() {
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
    const [dynamicTabTitle, setDynamicTabTitle] = useState<
        string | null
    >(null)
    const [tabScrollPositions, setTabScrollPositions] =
        useState<Record<TabId, number>>({
            participants: 0,
            media: 0,
            files: 0,
            voice: 0,
            links: 0,
        })

    // Refs
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
    const lastScrollY = useRef(0)
    const lastScrollDirection = useRef<'up' | 'down'>(
        'down',
    )
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)

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

    // Блокировка скролла страницы при наведении или в режиме таба
    const preventScroll = isMouseOver || viewMode === 'tab'
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
        return () =>
            document.body.classList.remove(
                'group-info-sidebar-scroll-lock',
            )
    }, [preventScroll])

    const scrollToTab = useCallback(
        (tabIndex: number) => {
            const tabElement = tabsRef.current[tabIndex]
            const container = containerRef.current
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

    // Переход в режим таба
    const switchToTab = useCallback(() => {
        setIsTransitioning(true)
        setJustSwitchedToTab(true)
        lastScrollY.current = 0
        lastScrollDirection.current = 'down'
        setHasScrolledDown(false)
        setIsReturning(false)
        setTimeout(() => {
            setViewMode('tab')
            setIsTransitioning(false)
            setTimeout(
                () => setJustSwitchedToTab(false),
                800,
            )
        }, 300)
    }, [])

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

    const handleMainTabClick = useCallback(
        (tabId: TabId, index: number) => {
            scrollToTab(index)
            setActiveTab(tabId)
            switchToTab()
            setTimeout(() => scrollToTab(index), 100)
        },
        [scrollToTab, switchToTab],
    )

    const handleBackFromTab = useCallback(
        () => setViewMode('main'),
        [],
    )

    const handleMainTouchStart = useCallback(
        (e: React.TouchEvent) => {
            lastTouchY.current = e.touches[0].clientY
        },
        [],
    )

    const handleMainTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (isTransitioning || viewMode !== 'main')
                return
            const deltaY =
                lastTouchY.current - e.touches[0].clientY
            if (deltaY > 50 && mainContentRef.current) {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                } = mainContentRef.current
                if (
                    scrollTop + clientHeight >=
                    scrollHeight - 50
                ) {
                    switchToTab()
                }
            }
            lastTouchY.current = e.touches[0].clientY
            e.preventDefault()
        },
        [isTransitioning, viewMode, switchToTab],
    )

    const handleMainWheel = useCallback(
        (e: React.WheelEvent) => {
            if (isTransitioning || viewMode !== 'main')
                return
            if (e.deltaY > 40 && mainContentRef.current) {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                } = mainContentRef.current
                if (
                    scrollTop + clientHeight >=
                    scrollHeight - 50
                ) {
                    e.preventDefault()
                    e.stopPropagation()
                    switchToTab()
                }
            }
        },
        [isTransitioning, viewMode, switchToTab],
    )

    const handleMainWheelCapture = useCallback(
        (e: WheelEvent) => {
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
            const {
                scrollTop,
                scrollHeight,
                clientHeight,
            } = mainContentRef.current
            if (
                scrollTop + clientHeight <
                scrollHeight - 10
            ) {
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
                switchToTab()
            }
        },
        [viewMode, isTransitioning, switchToTab],
    )

    const handleMainScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (viewMode !== 'main' || isTransitioning)
                return
            const target = e.target as HTMLDivElement
            const {
                scrollTop,
                scrollHeight,
                clientHeight,
            } = target
            if (
                scrollTop + clientHeight >=
                scrollHeight - 10
            )
                switchToTab()
        },
        [viewMode, isTransitioning, switchToTab],
    )

    const handleTabScrollEvent = useCallback(
        (scrollY: number) => {
            if (isReturning || isTransitioning) return
            if (justSwitchedToTab) {
                lastScrollY.current = scrollY
                return
            }
            const direction =
                scrollY < lastScrollY.current
                    ? 'up'
                    : 'down'
            if (direction === 'down' && scrollY > 30)
                setHasScrolledDown(true)
            lastScrollY.current = scrollY
            lastScrollDirection.current = direction
            setTabScrollPositions((prev) => ({
                ...prev,
                [activeTab]: scrollY,
            }))

            if (scrollTimeoutRef.current)
                clearTimeout(scrollTimeoutRef.current)
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

    const handleTabContentTabClick = useCallback(
        (tabId: TabId, index: number) => {
            if (tabId === activeTab || isTransitioning)
                return
            setDynamicTabTitle(null)
            setActiveTab(tabId)
            setJustSwitchedToTab(true)
            setTimeout(
                () => setJustSwitchedToTab(false),
                400,
            )
            scrollToTab(index)
        },
        [activeTab, isTransitioning, scrollToTab],
    )

    // Автоскролл при изменении активного таба
    useEffect(() => {
        const activeIndex = tabs.findIndex(
            (tab) => tab.id === activeTab,
        )
        scrollToTab(activeIndex)
    }, [activeTab, viewMode, tabs, scrollToTab])

    // Capture-phase wheel listener для main режима
    useEffect(() => {
        const node = mainContentRef.current
        if (!node) return
        node.addEventListener(
            'wheel',
            handleMainWheelCapture as EventListener,
            { capture: true, passive: false },
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
            } catch (_) {
                /* ignore */
            }
            if (wheelResetTimeoutRef.current)
                clearTimeout(wheelResetTimeoutRef.current)
            wheelDeltaRef.current = 0
            lastWheelDirRef.current = null
        }
    }, [viewMode, isTransitioning, handleMainWheelCapture])

    const getTabTitle = (tabId: TabId): string => {
        const map: Record<TabId, string> = {
            participants: 'Участники',
            media: 'Медиа',
            files: 'Файлы',
            voice: 'Голосовые',
            links: 'Ссылки',
        }
        return map[tabId] ?? ''
    }

    return {
        // state
        activeTab,
        viewMode,
        isTransitioning,
        isMouseOver,
        setIsMouseOver,
        dynamicTabTitle,
        setDynamicTabTitle,
        hideTabScrollbarDuringReturn,
        tabScrollPositions,
        // refs
        tabsRef,
        containerRef,
        mainContentRef,
        tabsContainerRef,
        // data
        tabs,
        // handlers
        handleMainTabClick,
        handleBackFromTab,
        handleMainTouchStart,
        handleMainTouchMove,
        handleMainWheel,
        handleMainScroll,
        handleTabScrollEvent,
        handleTabContentTabClick,
        handleAttemptReturn,
        // utils
        getTabTitle,
    }
}
