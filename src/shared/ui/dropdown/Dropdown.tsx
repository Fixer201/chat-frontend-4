// Компонент Dropdown (выпадающее меню) с поддержкой порталов и динамическим позиционированием
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

// Тип позиционирования меню относительно триггера
type Placement =
    | 'bottom-start' // Снизу, по левому краю триггера
    | 'bottom-end' // Снизу, по правому краю триггера
    | 'top-start' // Сверху, по левому краю триггера
    | 'top-end' // Сверху, по правому краю триггера

// Контекст для передачи состояния Dropdown между компонентами
interface DropdownContextValue {
    isOpen: boolean // Флаг открытого состояния
    setOpen: (next: boolean) => void // Функция изменения состояния
    // TODO: DON'T USE MutableRefObject HE WAS DEPRECATED
    triggerRef: MutableRefObject<HTMLElement | null> // Реф на элемент-триггер
    // TODO: DON'T USE MutableRefObject HE WAS DEPRECATED
    menuRef: MutableRefObject<HTMLDivElement | null> // Реф на меню
    placement: Placement // Позиционирование меню
    offset: number // Отступ от триггера
    closeOnSelect: boolean // Закрывать ли меню при выборе пункта
}

// Создание контекста
const DropdownContext =
    createContext<DropdownContextValue | null>(null)

// Хук для использования контекста Dropdown
const useDropdownContext = () => {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error(
            'Dropdown compound components must be used within <Dropdown>',
        )
    }
    return context
}

// Утилита для объединения нескольких рефов в один
const mergeRefs = <T,>(
    ...refs: Array<Ref<T> | null | undefined>
) => {
    return (value: T | null) => {
        refs.forEach((ref) => {
            if (!ref) return
            if (typeof ref === 'function') {
                ref(value)
            } else {
                ref.current = value
            }
        })
    }
}

// Основные пропсы Dropdown компонента
interface DropdownProps {
    children: ReactNode // Дочерние компоненты
    open?: boolean // Контролируемое состояние открытия
    defaultOpen?: boolean // Начальное состояние по умолчанию
    onOpenChange?: (open: boolean) => void // Обработчик изменения состояния
    placement?: Placement // Позиционирование меню
    offset?: number // Отступ от триггера
    closeOnSelect?: boolean // Закрывать ли меню при выборе пункта
}

// Корневой компонент Dropdown
function DropdownRoot({
    children,
    open,
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    offset = 8,
    closeOnSelect = true,
}: DropdownProps) {
    // Определяем контролируемый или неконтролируемый режим
    const isControlled = typeof open === 'boolean'
    const [uncontrolledOpen, setUncontrolledOpen] =
        useState(defaultOpen ?? false)
    const triggerRef = useRef<HTMLElement | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)

    // Текущее состояние открытия
    const isOpen = isControlled
        ? Boolean(open)
        : uncontrolledOpen

    // Функция изменения состояния
    const setOpen = useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next)
            }
            onOpenChange?.(next)
        },
        [isControlled, onOpenChange],
    )

    // Проверяем, есть ли компонент Trigger среди детей
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

    // Эффект для обработки кликов вне меню и клавиши Escape
    useEffect(() => {
        if (!isOpen) return

        const handleClickAway = (event: MouseEvent) => {
            const target = event.target as Node

            // Проверяем, кликнули ли внутри меню или на триггере
            const clickedInsideMenu =
                menuRef.current?.contains(target)
            const clickedOnTrigger =
                hasTrigger &&
                triggerRef.current?.contains(target)

            if (clickedInsideMenu || clickedOnTrigger) {
                return
            }

            // Если клик был вне меню и триггера - закрываем меню
            setOpen(false)
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
            }
        }

        document.addEventListener(
            'mousedown',
            handleClickAway,
        )
        document.addEventListener('keydown', handleEscape)

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

    // Мемоизируем значение контекста
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

// Компонент-триггер для открытия меню
interface DropdownTriggerProps {
    children: ReactElement // React элемент, который будет триггером
}

function DropdownTrigger({
    children,
}: DropdownTriggerProps) {
    const { isOpen, setOpen, triggerRef } =
        useDropdownContext()

    // Type guard: validate child is a valid React element
    if (!isValidElement(children)) {
        throw new Error(
            'DropdownTrigger requires a valid React element as child',
        )
    }

    // Extract child props with proper typing
    const childProps = children.props as {
        ref?: Ref<HTMLElement>
        onClick?: (
            event: ReactMouseEvent<HTMLElement>,
        ) => void
        [key: string]: unknown
    }

    // Модифицируем пропсы дочернего элемента
    const newProps = {
        ref: mergeRefs<HTMLElement>(
            triggerRef,
            childProps.ref,
        ),
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
            childProps.onClick?.(event)
            if (!event.defaultPrevented) {
                setOpen(!isOpen) // Инвертируем состояние при клике
            }
        },
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen, // Атрибут доступности
    }

    // Type assertion needed for cloneElement due to complex typing
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

    // Эффект для автоматического позиционирования меню
    useLayoutEffect(() => {
        if (!isOpen || manualPosition) return

        const updatePosition = () => {
            if (!triggerRef.current || !menuRef.current)
                return

            const triggerRect =
                triggerRef.current.getBoundingClientRect()
            const menuRect =
                menuRef.current.getBoundingClientRect()

            // Вычисляем позицию в зависимости от placement
            let top =
                triggerRect.bottom + offset + window.scrollY
            let left = triggerRect.left + window.scrollX

            if (placement.startsWith('top')) {
                top =
                    triggerRect.top -
                    offset -
                    menuRect.height +
                    window.scrollY
            }

            if (placement.endsWith('end')) {
                left =
                    triggerRect.right -
                    menuRect.width +
                    window.scrollX
            }

            setPosition({
                top,
                left,
                opacity: 1,
            })
        }

        updatePosition()

        // Обработчики для обновления позиции при ресайзе и скролле
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
    const contentStyle: CSSProperties = manualPosition
        ? {
              width:
                  width === 'auto'
                      ? calculatedWidth
                      : width,
              minWidth: resolvedMinWidth,
              position: 'fixed' as const,
              top: manualPosition.top,
              left: manualPosition.left,
              opacity: 1,
              zIndex: 1000,
              ...(style as CSSProperties),
          }
        : {
              width:
                  width === 'auto'
                      ? calculatedWidth
                      : width,
              minWidth: resolvedMinWidth,
              maxWidth: resolvedMaxWidth,
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
