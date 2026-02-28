// useGroupInfoSidebar.ts
'use client'

import {
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from 'react'

// Типы для вкладок и режимов отображения
type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'
type ViewMode = 'main' | 'tab' // Основной режим (инфо о группе) или режим вкладки (полноэкранный контент)

export function useGroupInfoSidebar() {
    // Состояния для управления вкладками и навигацией
    const [activeTab, setActiveTab] =
        useState<TabId>('participants') // Активная вкладка
    const [viewMode, setViewMode] =
        useState<ViewMode>('main') // Текущий режим отображения
    const [isTransitioning, setIsTransitioning] =
        useState(false) // Флаг анимации перехода
    const [isMouseOver, setIsMouseOver] = useState(false) // Наведена ли мышь на сайдбар
    const [justSwitchedToTab, setJustSwitchedToTab] =
        useState(false) // Только что переключились на вкладку (блокирует возврат)
    const [
        hideTabScrollbarDuringReturn,
        setHideTabScrollbarDuringReturn,
    ] = useState(false) // Скрыть скроллбар при возврате из вкладки
    const [hasScrolledDown, setHasScrolledDown] =
        useState(false) // Прокрутили ли вниз во вкладке (для разрешения возврата)
    const [isReturning, setIsReturning] = useState(false) // Процесс возврата из вкладки
    const [dynamicTabTitle, setDynamicTabTitle] = useState<
        string | null
    >(null) // Динамический заголовок вкладки (например, "Участники (5)")
    const [tabScrollPositions, setTabScrollPositions] =
        useState<Record<TabId, number>>({
            participants: 0,
            media: 0,
            files: 0,
            voice: 0,
            links: 0,
        }) // Сохранение позиций скролла для каждой вкладки

    // Refs для DOM-элементов
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]) // Массив ref-ов для кнопок табов
    const containerRef = useRef<HTMLDivElement>(null) // Контейнер для скролла табов
    const mainContentRef = useRef<HTMLDivElement>(null) // Основной контент в main режиме
    const tabsContainerRef = useRef<HTMLDivElement>(null) // Контейнер с табами
    const lastTouchY = useRef(0) // Последняя Y-координата касания (для touch-событий)
    const wheelDeltaRef = useRef(0) // Накопленная дельта колесика мыши
    const wheelResetTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null) // Таймер для сброса wheelDelta
    const lastWheelDirRef = useRef<'up' | 'down' | null>(
        null,
    ) // Последнее направление колесика
    const lastScrollY = useRef(0) // Последняя позиция скролла
    const lastScrollDirection = useRef<'up' | 'down'>(
        'down',
    ) // Последнее направление скролла
    const scrollTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null) // Таймер для debounce скролла

    // Список доступных вкладок с их отображаемыми названиями
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

    // Функция для скролла к выбранному табу в горизонтальном списке
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
                // Если таб не полностью видим, скроллим к нему
                if (
                    left < visibleLeft ||
                    right > visibleRight
                ) {
                    const inlineValue =
                        tabIndex === 0
                            ? 'start' // Первый таб - к началу
                            : tabIndex === tabs.length - 1
                              ? 'end' // Последний таб - к концу
                              : 'center' // Остальные - по центру
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

    // Переход в режим таба (полноэкранный режим)
    const switchToTab = useCallback(() => {
        setIsTransitioning(true) // Начинаем анимацию
        setJustSwitchedToTab(true) // Блокируем возврат на некоторое время
        lastScrollY.current = 0
        lastScrollDirection.current = 'down'
        setHasScrolledDown(false)
        setIsReturning(false)
        setTimeout(() => {
            setViewMode('tab') // Переключаем режим
            setIsTransitioning(false) // Завершаем анимацию
            setTimeout(
                () => setJustSwitchedToTab(false),
                800, // Через 800мс разрешаем возврат
            )
        }, 300) // Через 300мс переключаем режим
    }, [])

    // Обработка попытки возврата из режима таба (скролл вверх)
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
            // Условия, при которых возврат невозможен
            if (
                isReturning ||
                isTransitioning ||
                justSwitchedToTab ||
                viewMode !== 'tab'
            )
                return

            // Сильная попытка возврата (скролл вверх > 35px) или уже прокрутили вниз ранее
            const strongAttempt =
                typeof deltaY === 'number' && deltaY < -35
            if (!hasScrolledDown && !strongAttempt) return

            // Начинаем возврат
            setIsReturning(true)
            setHideTabScrollbarDuringReturn(true) // Скрываем скроллбар во время анимации
            setIsTransitioning(true)
            setTimeout(() => {
                setViewMode('main') // Возвращаемся в основной режим
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

    // Обработчик клика по табу в основном режиме
    const handleMainTabClick = useCallback(
        (tabId: TabId, index: number) => {
            scrollToTab(index) // Скроллим к табу
            setActiveTab(tabId) // Устанавливаем активный таб
            switchToTab() // Переходим в режим таба
            setTimeout(() => scrollToTab(index), 100) // Повторный скролл после перехода
        },
        [scrollToTab, switchToTab],
    )

    // Обработчик кнопки "Назад" в режиме таба
    const handleBackFromTab = useCallback(
        () => setViewMode('main'),
        [],
    )

    // Touch-события для свайпа вверх при достижении конца контента
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
            // Если свайп вверх > 50px и достигнут конец контента
            if (deltaY > 50 && mainContentRef.current) {
                const {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                } = mainContentRef.current
                if (
                    scrollTop + clientHeight >=
                    scrollHeight - 50 // Близко к концу (50px)
                ) {
                    switchToTab() // Переходим в режим таба
                }
            }
            lastTouchY.current = e.touches[0].clientY
            e.preventDefault() // Предотвращаем стандартный скролл страницы
        },
        [isTransitioning, viewMode, switchToTab],
    )

    // Обработчик колесика мыши (обычный, для React-события)
    const handleMainWheel = useCallback(
        (e: React.WheelEvent) => {
            if (isTransitioning || viewMode !== 'main')
                return
            // Если скролл вниз > 40px и достигнут конец контента
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

    // Обработчик колесика в capture-фазе (для накопления дельты)
    const handleMainWheelCapture = useCallback(
        (e: WheelEvent) => {
            if (isTransitioning || viewMode !== 'main')
                return
            // Игнорируем скролл вверх
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
            // Если не достигнут конец контента, сбрасываем накопление
            if (
                scrollTop + clientHeight <
                scrollHeight - 10
            ) {
                wheelDeltaRef.current = 0
                lastWheelDirRef.current = 'down'
                return
            }
            // Накопление дельты
            if (lastWheelDirRef.current !== 'down') {
                wheelDeltaRef.current = 0
                lastWheelDirRef.current = 'down'
            }
            wheelDeltaRef.current += e.deltaY
            // Сброс накопления через таймер
            if (wheelResetTimeoutRef.current)
                clearTimeout(wheelResetTimeoutRef.current)
            wheelResetTimeoutRef.current = setTimeout(
                () => {
                    wheelDeltaRef.current = 0
                    lastWheelDirRef.current = null
                },
                250,
            )
            // Если накопили >=25px, переключаем в режим таба
            if (wheelDeltaRef.current >= 25) {
                e.preventDefault()
                e.stopPropagation()
                switchToTab()
            }
        },
        [viewMode, isTransitioning, switchToTab],
    )

    // Обработчик скролла основного контента
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
            // Если достигнут конец контента (с запасом 10px)
            if (
                scrollTop + clientHeight >=
                scrollHeight - 10
            )
                switchToTab()
        },
        [viewMode, isTransitioning, switchToTab],
    )

    // Обработчик скролла внутри вкладки (для возврата при скролле вверх)
    const handleTabScrollEvent = useCallback(
        (scrollY: number) => {
            if (isReturning || isTransitioning) return
            if (justSwitchedToTab) {
                lastScrollY.current = scrollY
                return
            }
            // Определяем направление скролла
            const direction =
                scrollY < lastScrollY.current
                    ? 'up'
                    : 'down'
            // Если скролл вниз и прокрутили более 30px, запоминаем
            if (direction === 'down' && scrollY > 30)
                setHasScrolledDown(true)
            lastScrollY.current = scrollY
            lastScrollDirection.current = direction
            // Сохраняем позицию скролла для активной вкладки
            setTabScrollPositions((prev) => ({
                ...prev,
                [activeTab]: scrollY,
            }))

            // Debounce для возврата при скролле вверх к началу
            if (scrollTimeoutRef.current)
                clearTimeout(scrollTimeoutRef.current)
            scrollTimeoutRef.current = setTimeout(() => {
                if (
                    direction === 'up' &&
                    scrollY <= 5 &&
                    viewMode === 'tab'
                ) {
                    if (hasScrolledDown && !isReturning) {
                        // Возвращаемся в основной режим
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

    // Обработчик клика по табу внутри режима таба (переключение вкладок)
    const handleTabContentTabClick = useCallback(
        (tabId: TabId, index: number) => {
            if (tabId === activeTab || isTransitioning)
                return
            setDynamicTabTitle(null) // Сбрасываем динамический заголовок
            setActiveTab(tabId) // Меняем активную вкладку
            setJustSwitchedToTab(true) // Блокируем возврат
            setTimeout(
                () => setJustSwitchedToTab(false),
                400,
            )
            scrollToTab(index) // Скроллим к табу
        },
        [activeTab, isTransitioning, scrollToTab],
    )

    // Автоскролл к активному табу при его изменении
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
            { capture: true, passive: false }, // Перехватываем событие до стандартной обработки
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

    // Получение заголовка вкладки по ID
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
