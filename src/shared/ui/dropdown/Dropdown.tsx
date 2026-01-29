/**
 * @fileoverview Компонент Dropdown (выпадающее меню).
 *
 * Реализует паттерн Compound Components для гибкой композиции:
 * - Dropdown.Trigger — элемент, по клику на который открывается меню
 * - Dropdown.Content — контейнер с пунктами меню
 * - Dropdown.Item — отдельный пункт меню
 *
 * Особенности реализации:
 * - Рендеринг через портал (createPortal) для корректного z-index
 * - Автоматическое позиционирование с учетом границ viewport
 * - Поддержка контролируемого и неконтролируемого режимов
 * - Автоматический флип при переполнении экрана
 * - Закрытие по клику вне меню и по Escape
 *
 * @example
 * <Dropdown>
 *   <Dropdown.Trigger>
 *     <Button>Открыть меню</Button>
 *   </Dropdown.Trigger>
 *   <Dropdown.Content>
 *     <Dropdown.Item onSelect={handleAction}>Действие</Dropdown.Item>
 *   </Dropdown.Content>
 * </Dropdown>
 */
'use client'

import React, {
    Children,
    cloneElement,
    createContext,
    type CSSProperties,
    type HTMLAttributes,
    isValidElement,
    type MouseEvent as ReactMouseEvent,
    type MutableRefObject,
    type ReactElement,
    type ReactNode,
    type Ref,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@shared/lib/utils'
import styles from '@shared/ui/dropdown/Dropdown.module.css'

// ============================================================================
// Типы и интерфейсы
// ============================================================================

/**
 * Варианты позиционирования меню относительно триггера.
 *
 * Формат: {вертикаль}-{горизонталь}
 * - bottom/top — меню ниже/выше триггера
 * - start/end — выравнивание по левому/правому краю триггера
 */
type Placement =
    | 'bottom-start' // Снизу, по левому краю триггера
    | 'bottom-end' // Снизу, по правому краю триггера
    | 'top-start' // Сверху, по левому краю триггера
    | 'top-end' // Сверху, по правому краю триггера

/**
 * Значение контекста Dropdown.
 *
 * Передает состояние и методы управления между compound-компонентами.
 * Использует рефы для связи триггера с меню без лишних ре-рендеров.
 */
interface DropdownContextValue {
    isOpen: boolean
    setOpen: (next: boolean) => void
    triggerRef: MutableRefObject<HTMLElement | null>
    menuRef: MutableRefObject<HTMLDivElement | null>
    placement: Placement
    offset: number
    closeOnSelect: boolean
}

// ============================================================================
// Контекст и утилиты
// ============================================================================

/**
 * Контекст для передачи состояния между compound-компонентами.
 * Значение null означает использование компонента вне Dropdown.
 */
const DropdownContext =
    createContext<DropdownContextValue | null>(null)

/**
 * Хук для доступа к контексту Dropdown.
 *
 * @throws {Error} Если вызван вне компонента Dropdown
 * @returns Значение контекста с состоянием и методами управления
 */
const useDropdownContext = () => {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error(
            'Dropdown compound components must be used within <Dropdown>',
        )
    }
    return context
}

/**
 * Объединяет несколько рефов в один callback-реф.
 *
 * Необходимо когда один элемент должен быть доступен через несколько рефов:
 * - Внутренний реф компонента для позиционирования
 * - Внешний реф пользователя для доступа к DOM-элементу
 *
 * @param refs Массив рефов (callback или object рефы)
 * @returns Callback-реф, который устанавливает значение во все переданные рефы
 *
 * @example
 * const internalRef = useRef(null)
 * const mergedRef = mergeRefs(internalRef, externalRef)
 * return <div ref={mergedRef} />
 */
const mergeRefs = <T,>(
    ...refs: Array<Ref<T> | null | undefined>
) => {
    return (value: T | null) => {
        refs.forEach((ref) => {
            if (!ref) return
            // Callback-реф: вызываем как функцию
            if (typeof ref === 'function') {
                ref(value)
            } else {
                // Object-реф: устанавливаем .current
                ref.current = value
            }
        })
    }
}

// ============================================================================
// Корневой компонент Dropdown
// ============================================================================

/**
 * Пропсы корневого компонента Dropdown.
 */
interface DropdownProps {
    /** Дочерние compound-компоненты (Trigger, Content) */
    children: ReactNode
    /** Контролируемое состояние открытия (делает компонент controlled) */
    open?: boolean
    /** Начальное состояние для неконтролируемого режима */
    defaultOpen?: boolean
    /** Callback при изменении состояния открытия */
    onOpenChange?: (open: boolean) => void
    /** Позиционирование меню относительно триггера */
    placement?: Placement
    /** Отступ между триггером и меню в пикселях */
    offset?: number
    /** Закрывать ли меню автоматически при выборе пункта */
    closeOnSelect?: boolean
}

/**
 * Корневой компонент Dropdown.
 *
 * Управляет состоянием открытия и предоставляет контекст для дочерних компонентов.
 * Поддерживает два режима работы:
 *
 * 1. Контролируемый (controlled): состояние управляется извне через prop `open`
 *    ```tsx
 *    const [open, setOpen] = useState(false)
 *    <Dropdown open={open} onOpenChange={setOpen}>
 *    ```
 *
 * 2. Неконтролируемый (uncontrolled): состояние управляется внутри компонента
 *    ```tsx
 *    <Dropdown defaultOpen={false}>
 *    ```
 *
 * @param props Пропсы компонента
 */
function DropdownRoot({
    children,
    open,
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    offset = 8,
    closeOnSelect = true,
}: DropdownProps) {
    // Определяем режим работы по наличию prop `open`.
    // Если передан boolean — компонент controlled, иначе — uncontrolled.
    const isControlled = typeof open === 'boolean'
    const [uncontrolledOpen, setUncontrolledOpen] =
        useState(defaultOpen ?? false)

    // Рефы для связи триггера и меню без вызова ре-рендеров.
    const triggerRef = useRef<HTMLElement | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)

    // Текущее состояние открытия зависит от режима работы.
    const isOpen = isControlled
        ? Boolean(open)
        : uncontrolledOpen

    /**
     * Функция изменения состояния открытия.
     *
     * В controlled-режиме только вызывает callback, в uncontrolled — также
     * обновляет внутреннее состояние. Это позволяет родителю всегда получать
     * уведомления об изменениях.
     */
    const setOpen = useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next)
            }
            onOpenChange?.(next)
        },
        [isControlled, onOpenChange],
    )

    /**
     * Проверяем наличие Trigger среди children.
     *
     * Это необходимо для корректной обработки клика:
     * если есть Trigger — клик по нему не должен закрывать меню,
     * если нет — меню управляется через manualPosition (контекстное меню).
     */
    const hasTrigger = useMemo(() => {
        const childrenArray = Children.toArray(children)
        return childrenArray.some((child) => {
            const element = child as unknown
            return (
                typeof element === 'object' &&
                element !== null &&
                'type' in element &&
                (element as { type: unknown }).type ===
                    DropdownTrigger
            )
        })
    }, [children])

    /**
     * Эффект для закрытия меню по клику вне и по Escape.
     *
     * Используем mousedown вместо click, чтобы закрывать меню до того,
     * как событие всплывет к другим обработчикам. Это предотвращает
     * случайные клики по элементам под меню.
     */
    useEffect(() => {
        if (!isOpen) return

        const handleClickAway = (event: MouseEvent) => {
            const target = event.target as Node

            // Клик внутри меню — не закрываем (пользователь выбирает пункт).
            const clickedInsideMenu =
                menuRef.current?.contains(target)

            // Клик на триггер — не закрываем (триггер сам переключит состояние).
            const clickedOnTrigger =
                hasTrigger &&
                triggerRef.current?.contains(target)

            if (clickedInsideMenu || clickedOnTrigger) {
                return
            }

            // Клик вне меню и триггера — закрываем меню.
            setOpen(false)
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
            }
        }

        // Подписываемся на события документа.
        document.addEventListener(
            'mousedown',
            handleClickAway,
        )
        document.addEventListener('keydown', handleEscape)

        // Отписываемся при закрытии меню или размонтировании.
        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickAway,
            )
            document.removeEventListener(
                'keydown',
                handleEscape,
            )
        }
    }, [isOpen, setOpen, hasTrigger])

    // Мемоизируем значение контекста для предотвращения лишних ре-рендеров.
    // Рефы не включаем в зависимости — они стабильны между рендерами.
    const value = useMemo<DropdownContextValue>(
        () => ({
            isOpen,
            setOpen,
            triggerRef,
            menuRef,
            placement,
            offset,
            closeOnSelect,
        }),
        [closeOnSelect, isOpen, offset, placement, setOpen],
    )

    return (
        <DropdownContext.Provider value={value}>
            {children}
        </DropdownContext.Provider>
    )
}

// ============================================================================
// Компонент Trigger
// ============================================================================

/**
 * Пропсы компонента DropdownTrigger.
 */
interface DropdownTriggerProps {
    /** React-элемент, который станет триггером (кнопка, ссылка и т.д.) */
    children: ReactElement
}

/**
 * Компонент-триггер для открытия меню.
 *
 * Принимает один дочерний React-элемент и добавляет к нему:
 * - Обработчик клика для переключения состояния меню
 * - Реф для позиционирования меню относительно триггера
 * - ARIA-атрибуты для доступности
 *
 * Использует паттерн "render prop" через cloneElement для сохранения
 * оригинальных пропсов дочернего элемента.
 *
 * @example
 * <Dropdown.Trigger>
 *   <Button>Открыть</Button>
 * </Dropdown.Trigger>
 */
function DropdownTrigger({
    children,
}: DropdownTriggerProps) {
    const { isOpen, setOpen, triggerRef } =
        useDropdownContext()

    // Валидация: children должен быть валидным React-элементом.
    // Текст, числа или фрагменты не поддерживаются.
    if (!isValidElement(children)) {
        throw new Error(
            'DropdownTrigger requires a valid React element as child',
        )
    }

    // Извлекаем пропсы дочернего элемента для их сохранения и расширения.
    const childProps = children.props as {
        ref?: Ref<HTMLElement>
        onClick?: (
            event: ReactMouseEvent<HTMLElement>,
        ) => void
        [key: string]: unknown
    }

    // Формируем новые пропсы, объединяя оригинальные с нашими расширениями.
    const newProps = {
        // Объединяем наш реф с внешним рефом пользователя.
        ref: mergeRefs<HTMLElement>(
            triggerRef,
            childProps.ref,
        ),
        // Обработчик клика: сначала вызываем оригинальный, затем переключаем меню.
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
            childProps.onClick?.(event)
            // Если оригинальный обработчик вызвал preventDefault — не переключаем.
            if (!event.defaultPrevented) {
                setOpen(!isOpen)
            }
        },
        // ARIA-атрибуты для скринридеров.
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen,
    }

    // cloneElement сохраняет тип элемента, но требует any для сложных типов.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children, newProps as any)
}

// Компонент содержимого выпадающего меню
interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
    width?: number | string // Ширина меню
    className?: string // Дополнительные классы
    children: ReactNode // Дочерние элементы (пункты меню)
    items?: DropdownItemProps[] // Альтернативный способ передачи пунктов меню
    manualPosition?: {
        // Ручная позиция (если не нужно автоматическое позиционирование)
        top: number
        left: number
    } | null
    minWidth?: number | string // Минимальная ширина
    maxWidth?: number | string // Максимальная ширина
}

function DropdownContent({
    width = 'auto',
    minWidth,
    maxWidth,
    className,
    children,
    items,
    style,
    manualPosition,
    ...props
}: DropdownContentProps) {
    const {
        isOpen,
        triggerRef,
        menuRef,
        placement,
        offset,
    } = useDropdownContext()
    const [position, setPosition] = useState<CSSProperties>(
        { opacity: 0 }, // Начальная позиция (скрыта)
    )
    const contentRef = useRef<HTMLDivElement>(null)
    const hasMeasuredRef = useRef(false) // Флаг измерения ширины

    // Функция чтения CSS переменных
    const readCssVar = (name: string, fallback: number) => {
        if (typeof window === 'undefined') return fallback
        try {
            const raw = getComputedStyle(
                document.documentElement,
            ).getPropertyValue(name)
            if (!raw) return fallback
            const parsed = parseFloat(
                raw.replace(/px/, '').trim(),
            )
            return Number.isFinite(parsed)
                ? parsed
                : fallback
        } catch {
            return fallback
        }
    }

    // Определяем минимальную ширину
    const resolvedMinWidth = (() => {
        if (typeof minWidth === 'number') return minWidth
        if (
            typeof minWidth === 'string' &&
            minWidth.endsWith('px')
        )
            return parseFloat(minWidth)
        return readCssVar('--dropdown-min-width', 180)
    })()

    // Определяем максимальную ширину
    const resolvedMaxWidth = (() => {
        if (typeof maxWidth === 'number') return maxWidth
        if (
            typeof maxWidth === 'string' &&
            maxWidth.endsWith('px')
        )
            return parseFloat(maxWidth)
        return readCssVar('--dropdown-max-width', 400)
    })()

    // Состояние для расчетной ширины (при auto ширине)
    const [calculatedWidth, setCalculatedWidth] =
        useState<number>(resolvedMinWidth)

    /**
     * Эффект для автоматического позиционирования меню с учетом границ viewport.
     *
     * Алгоритм работы:
     * 1. Измеряет размеры меню и viewport
     * 2. Проверяет возможность переполнения по каждому направлению
     * 3. Выполняет "флип" (разворот) в противоположную сторону при переполнении
     * 4. Применяет финальное ограничение с минимальными отступами
     *
     * Поддерживает два режима позиционирования:
     * - manualPosition: абсолютная позиция (для контекстных меню)
     * - trigger-based: позиционирование относительно триггера
     */
    useLayoutEffect(() => {
        if (!isOpen) return

        const updatePosition = () => {
            if (!menuRef.current) return

            // Получаем размеры меню и viewport для расчета позиции.
            const menuRect =
                menuRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const padding = 8 // Минимальный отступ от краев экрана

            // Режим 1: Ручное позиционирование (контекстное меню).
            // Используется для меню, открываемых по клику мыши.
            if (manualPosition) {
                let { top, left } = manualPosition

                // Проверяем, выйдет ли меню за правую или левую границу экрана.
                // Если меню открывается справа от курсора и выходит за правый край,
                // разворачиваем его влево от курсора.
                const wouldOverflowRight =
                    left + menuRect.width >
                    viewportWidth - padding
                const wouldOverflowLeft =
                    left - menuRect.width < padding

                if (
                    wouldOverflowRight &&
                    !wouldOverflowLeft
                ) {
                    // Открываем меню слева от курсора вместо справа.
                    left = left - menuRect.width
                }

                // Аналогично для вертикального направления.
                // Если меню открывается вниз от курсора и выходит за нижний край,
                // разворачиваем его вверх от курсора.
                const wouldOverflowBottom =
                    top + menuRect.height >
                    viewportHeight - padding
                const wouldOverflowTop =
                    top - menuRect.height < padding

                if (
                    wouldOverflowBottom &&
                    !wouldOverflowTop
                ) {
                    // Открываем меню вверх от курсора вместо вниз.
                    top = top - menuRect.height
                }

                // Финальная проверка: ограничиваем координаты минимальными отступами.
                // Это необходимо для крайних случаев (например, клик в углу экрана),
                // когда меню не помещается ни в одном направлении.
                if (left < padding) left = padding
                if (
                    left + menuRect.width >
                    viewportWidth - padding
                )
                    left =
                        viewportWidth -
                        menuRect.width -
                        padding

                if (top < padding) top = padding
                if (
                    top + menuRect.height >
                    viewportHeight - padding
                )
                    top =
                        viewportHeight -
                        menuRect.height -
                        padding

                // Применяем рассчитанную позицию и делаем меню видимым.
                setPosition({
                    top,
                    left,
                    opacity: 1,
                })
                return
            }

            // Режим 2: Позиционирование относительно триггера.
            // Используется для выпадающих меню кнопок.
            if (!triggerRef.current) return

            const triggerRect =
                triggerRef.current.getBoundingClientRect()

            let currentPlacement = placement

            // Рассчитываем начальную вертикальную позицию согласно placement.
            // bottom-* → меню под триггером
            // top-* → меню над триггером
            let top =
                triggerRect.bottom + offset + window.scrollY
            if (placement.startsWith('top')) {
                top =
                    triggerRect.top -
                    offset -
                    menuRect.height +
                    window.scrollY
            }

            // Проверяем возможность переполнения по вертикали.
            // Если меню не помещается снизу, но помещается сверху — разворачиваем.
            const wouldOverflowBottom =
                triggerRect.bottom +
                    offset +
                    menuRect.height >
                viewportHeight
            const wouldOverflowTop =
                triggerRect.top - offset - menuRect.height <
                0

            if (
                placement.startsWith('bottom') &&
                wouldOverflowBottom &&
                !wouldOverflowTop
            ) {
                // Флип наверх: меню было bottom, становится top.
                top =
                    triggerRect.top -
                    offset -
                    menuRect.height +
                    window.scrollY
                currentPlacement = placement.replace(
                    'bottom',
                    'top',
                ) as Placement
            } else if (
                placement.startsWith('top') &&
                wouldOverflowTop &&
                !wouldOverflowBottom
            ) {
                // Флип вниз: меню было top, становится bottom.
                top =
                    triggerRect.bottom +
                    offset +
                    window.scrollY
                currentPlacement = placement.replace(
                    'top',
                    'bottom',
                ) as Placement
            }

            // Рассчитываем начальную горизонтальную позицию согласно placement.
            // *-start → меню выравнивается по левому краю триггера
            // *-end → меню выравнивается по правому краю триггера
            let left = triggerRect.left + window.scrollX
            if (currentPlacement.endsWith('end')) {
                left =
                    triggerRect.right -
                    menuRect.width +
                    window.scrollX
            }

            // Проверяем возможность переполнения по горизонтали.
            // Если меню не помещается справа, но помещается слева — разворачиваем.
            const wouldOverflowRight =
                triggerRect.left + menuRect.width >
                viewportWidth
            const wouldOverflowLeft =
                triggerRect.right - menuRect.width < 0

            if (
                currentPlacement.endsWith('start') &&
                wouldOverflowRight &&
                !wouldOverflowLeft
            ) {
                // Флип к правому краю триггера.
                left =
                    triggerRect.right -
                    menuRect.width +
                    window.scrollX
            } else if (
                currentPlacement.endsWith('end') &&
                wouldOverflowLeft &&
                !wouldOverflowRight
            ) {
                // Флип к левому краю триггера.
                left = triggerRect.left + window.scrollX
            }

            // Финальное ограничение координат для предотвращения выхода за границы.
            // Применяется даже после флипов, чтобы гарантировать видимость меню.
            if (left < padding) left = padding
            if (
                left + menuRect.width >
                viewportWidth - padding
            )
                left =
                    viewportWidth - menuRect.width - padding
            if (top < padding + window.scrollY)
                top = padding + window.scrollY
            if (
                top + menuRect.height >
                viewportHeight + window.scrollY - padding
            )
                top =
                    viewportHeight +
                    window.scrollY -
                    menuRect.height -
                    padding

            // Применяем финальную позицию и делаем меню видимым.
            setPosition({
                top,
                left,
                opacity: 1,
            })
        }

        // Вызываем расчет позиции сразу после открытия меню.
        updatePosition()

        // Подписываемся на события ресайза и скролла для обновления позиции.
        // Это необходимо для поддержания корректной позиции при изменении viewport.
        const handle = () => updatePosition()
        window.addEventListener('resize', handle)
        window.addEventListener('scroll', handle, true)

        return () => {
            window.removeEventListener('resize', handle)
            window.removeEventListener(
                'scroll',
                handle,
                true,
            )
        }
    }, [
        isOpen,
        offset,
        placement,
        triggerRef,
        menuRef,
        manualPosition,
    ])

    // Функция измерения ширины меню на основе содержимого
    const measureDropdownWidth = useCallback(() => {
        const minW = resolvedMinWidth
        const maxW = resolvedMaxWidth
        if (!contentRef.current || width !== 'auto')
            return minW

        const itemElements =
            contentRef.current.querySelectorAll(
                '.dropdown-item',
            )
        if (itemElements.length === 0) return minW

        let maxItemWidth = 0

        // Находим максимальную ширину среди пунктов меню
        itemElements.forEach((item) => {
            const el = item as HTMLElement
            const itemWidth =
                el.scrollWidth ||
                el.getBoundingClientRect().width
            maxItemWidth = Math.max(maxItemWidth, itemWidth)
        })

        // Добавляем отступы и иконки
        const extra = readCssVar(
            '--dropdown-extra-padding',
            96,
        )
        const totalWidth = Math.ceil(maxItemWidth + extra)

        // Ограничиваем минимальной и максимальной шириной
        let finalWidth = Math.max(minW, totalWidth)
        if (maxW && finalWidth > maxW) {
            finalWidth = maxW as number
        }

        return finalWidth
    }, [width, resolvedMinWidth, resolvedMaxWidth])

    // Эффект для измерения ширины меню при открытии
    useLayoutEffect(() => {
        if (!isOpen || width !== 'auto') {
            return
        }

        // Измеряем ширину только один раз при открытии
        if (!hasMeasuredRef.current) {
            const timeoutId = setTimeout(() => {
                const newWidth = measureDropdownWidth()
                setCalculatedWidth(newWidth)
                hasMeasuredRef.current = true
            }, 0)

            return () => clearTimeout(timeoutId)
        }

        // Сбрасываем флаг при закрытии меню
        return () => {
            hasMeasuredRef.current = false
        }
    }, [isOpen, width, measureDropdownWidth])

    // Если меню не открыто - ничего не рендерим
    if (!isOpen) {
        return null
    }

    // Стили для меню
    const contentStyle: CSSProperties = {
        width: width === 'auto' ? calculatedWidth : width,
        minWidth: resolvedMinWidth,
        maxWidth: manualPosition
            ? undefined
            : resolvedMaxWidth,
        position: 'fixed' as const,
        zIndex: 1000,
        ...position,
        ...(style as CSSProperties),
    }

    // Рендерим меню через портал в body для корректного позиционирования
    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            style={contentStyle}
            className={cn(styles.dropdownMenu, className)}
            {...props}
        >
            <div
                ref={contentRef}
                className={styles.dropdownContent}
            >
                {/* Рендерим пункты меню из пропса items или children */}
                {items?.map((item, index) => (
                    <DropdownItem
                        key={`${item.label ?? index}-${index}`}
                        {...item}
                    />
                ))}
                {children}
            </div>
        </div>,
        document.body,
    )
}

// Пропсы для пункта меню
interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
    label?: string // Текст пункта меню
    icon?: ReactNode // Иконка слева
    rightIcon?: ReactNode // Иконка справа
    danger?: boolean // Опасный пункт (красный цвет)
    disabled?: boolean // Заблокированный пункт
    onSelect?: () => void // Обработчик выбора пункта
    closeOnSelect?: boolean // Закрывать ли меню при выборе этого пункта
    onClick?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void // Обработчик клика
    onMouseEnter?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void // Обработчик наведения мыши
    onMouseLeave?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void // Обработчик ухода мыши
    hasDivider?: boolean // Разделитель перед пунктом
}

// Компонент пункта меню
function DropdownItem({
    label,
    icon,
    rightIcon,
    danger,
    disabled,
    onClick,
    onSelect,
    className,
    closeOnSelect,
    children,
    onMouseEnter,
    onMouseLeave,
    hasDivider = false,
    ...props
}: Readonly<DropdownItemProps>) {
    const { setOpen, closeOnSelect: contextCloseOnSelect } =
        useDropdownContext()

    // Обработчик клика по пункту меню
    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        if (disabled) {
            event.preventDefault()
            return
        }

        onClick?.(event)
        if (event.defaultPrevented) return

        onSelect?.()

        // Закрываем меню если нужно
        if (closeOnSelect ?? contextCloseOnSelect) {
            setOpen(false)
        }
    }

    return (
        <>
            {/* Разделитель перед пунктом */}
            {hasDivider && (
                <div className={styles.dropdownDivider} />
            )}
            {/* Кнопка пункта меню */}
            <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={handleClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={cn(
                    'dropdown-item',
                    styles.dropdownItem,
                    {
                        [styles.danger]: danger,
                        [styles.default]:
                            !disabled && !danger,
                    },
                    className,
                )}
                {...props}
            >
                <span className={styles.dropdownItemText}>
                    {label ?? children} {/* Текст пункта */}
                </span>
                <div className={styles.dropdownItemIcons}>
                    {/* Иконка слева */}
                    {icon && (
                        <span
                            className={styles.dropdownIcon}
                        >
                            {icon}
                        </span>
                    )}
                </div>
                {/* Иконка справа */}
                {rightIcon && (
                    <span className={styles.dropdownIcon}>
                        {rightIcon}
                    </span>
                )}
            </button>
        </>
    )
}

// Собираем compound компонент
const Dropdown = DropdownRoot as typeof DropdownRoot & {
    Trigger: typeof DropdownTrigger
    Content: typeof DropdownContent
    Item: typeof DropdownItem
}

Dropdown.Trigger = DropdownTrigger
Dropdown.Content = DropdownContent
Dropdown.Item = DropdownItem

export type { DropdownProps, DropdownItemProps }
export default Dropdown

/**
 * Example usage:
 * <Dropdown>
 *   <Dropdown.Trigger>
 *     <Button variant="ghost">Menu</Button>
 *   </Dropdown.Trigger>
 *   <Dropdown.Content width={220}>
 *     <Dropdown.Item onSelect={() => console.log("Reply")}>
 *       Reply
 *     </Dropdown.Item>
 *     <Dropdown.Item icon={<CheckIcon />}>Select</Dropdown.Item>
 *     <Dropdown.Item danger icon={<TrashIcon />}>
 *       Delete
 *     </Dropdown.Item>
 *   </Dropdown.Content>
 * </Dropdown>
 */
