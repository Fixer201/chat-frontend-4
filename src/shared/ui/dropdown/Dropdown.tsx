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

type Placement =
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end'

interface DropdownContextValue {
    isOpen: boolean
    setOpen: (next: boolean) => void
    // TODO: DON'T USE MutableRefObject HE WAS DEPRECATED
    triggerRef: MutableRefObject<HTMLElement | null>
    // TODO: DON'T USE MutableRefObject HE WAS DEPRECATED
    menuRef: MutableRefObject<HTMLDivElement | null>
    placement: Placement
    offset: number
    closeOnSelect: boolean
}

const DropdownContext =
    createContext<DropdownContextValue | null>(null)

const useDropdownContext = () => {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error(
            'Dropdown compound components must be used within <Dropdown>',
        )
    }
    return context
}

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

interface DropdownProps {
    children: ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    placement?: Placement
    offset?: number
    closeOnSelect?: boolean
}

function DropdownRoot({
    children,
    open,
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    offset = 8,
    closeOnSelect = true,
}: DropdownProps) {
    const isControlled = typeof open === 'boolean'
    const [uncontrolledOpen, setUncontrolledOpen] =
        useState(defaultOpen ?? false)
    const triggerRef = useRef<HTMLElement | null>(null)
    const menuRef = useRef<HTMLDivElement | null>(null)

    const isOpen = isControlled
        ? Boolean(open)
        : uncontrolledOpen

    const setOpen = useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next)
            }
            onOpenChange?.(next)
        },
        [isControlled, onOpenChange],
    )
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

    useEffect(() => {
        if (!isOpen) return

        const handleClickAway = (event: MouseEvent) => {
            const target = event.target as Node

            // Check if click is outside both menu and trigger
            const clickedInsideMenu =
                menuRef.current?.contains(target)
            const clickedOnTrigger =
                hasTrigger &&
                triggerRef.current?.contains(target)

            if (clickedInsideMenu || clickedOnTrigger) {
                return
            }

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

interface DropdownTriggerProps {
    children: ReactElement
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

    const newProps = {
        ref: mergeRefs<HTMLElement>(
            triggerRef,
            childProps.ref,
        ),
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
            childProps.onClick?.(event)
            if (!event.defaultPrevented) {
                setOpen(!isOpen)
            }
        },
        'aria-haspopup': 'menu' as const,
        'aria-expanded': isOpen,
    }

    // Type assertion needed for cloneElement due to complex typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children, newProps as any)
}

interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
    width?: number | string
    className?: string
    children: ReactNode
    items?: DropdownItemProps[]
    manualPosition?: {
        top: number
        left: number
    } | null
    minWidth?: number | string
    maxWidth?: number | string
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
        { opacity: 0 },
    )
    const contentRef = useRef<HTMLDivElement>(null)
    const hasMeasuredRef = useRef(false)

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

    const resolvedMinWidth = (() => {
        if (typeof minWidth === 'number') return minWidth
        if (
            typeof minWidth === 'string' &&
            minWidth.endsWith('px')
        )
            return parseFloat(minWidth)
        return readCssVar('--dropdown-min-width', 180)
    })()

    const resolvedMaxWidth = (() => {
        if (typeof maxWidth === 'number') return maxWidth
        if (
            typeof maxWidth === 'string' &&
            maxWidth.endsWith('px')
        )
            return parseFloat(maxWidth)
        return readCssVar('--dropdown-max-width', 400)
    })()

    const [calculatedWidth, setCalculatedWidth] =
        useState<number>(resolvedMinWidth)

    useLayoutEffect(() => {
        if (!isOpen || manualPosition) return

        const updatePosition = () => {
            if (!triggerRef.current || !menuRef.current)
                return

            const triggerRect =
                triggerRef.current.getBoundingClientRect()
            const menuRect =
                menuRef.current.getBoundingClientRect()

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

        itemElements.forEach((item) => {
            const el = item as HTMLElement
            // Use scrollWidth to measure full content width including icons/padding
            const itemWidth =
                el.scrollWidth ||
                el.getBoundingClientRect().width
            maxItemWidth = Math.max(maxItemWidth, itemWidth)
        })

        const extra = readCssVar(
            '--dropdown-extra-padding',
            96,
        )
        const totalWidth = Math.ceil(maxItemWidth + extra)

        let finalWidth = Math.max(minW, totalWidth)
        if (maxW && finalWidth > maxW) {
            finalWidth = maxW as number
        }

        return finalWidth
    }, [width, resolvedMinWidth, resolvedMaxWidth])

    // Measure dropdown width synchronously before browser paints
    // Uses useLayoutEffect instead of useEffect because:
    // 1. DOM measurement must happen after layout calculation but before paint
    // 2. setState inside useLayoutEffect is blocked by React until after measurement
    // 3. Browser never repaints between initial render (width=0) and final render (width=measured)
    // 4. This is the official React pattern for layout measurements (https://react.dev/reference/react/useLayoutEffect)
    useLayoutEffect(() => {
        if (!isOpen || width !== 'auto') {
            return
        }

        // Measure dropdown width only once when it opens
        // Using ref flag to avoid re-measuring on every effect run
        if (!hasMeasuredRef.current) {
            // Defer measurement to allow contentRef to be populated
            const timeoutId = setTimeout(() => {
                const newWidth = measureDropdownWidth()
                // This setState inside useLayoutEffect is VALID because:
                // - It's a DOM measurement use case (documented in React docs)
                // - No cascading renders: single useLayoutEffect → single setState → done
                // - React batches this render with the layout measurement, browser doesn't paint between them
                setCalculatedWidth(newWidth)
                hasMeasuredRef.current = true
            }, 0)

            return () => clearTimeout(timeoutId)
        }

        // Cleanup: Reset measurement flag when dropdown closes so we measure again on next open
        return () => {
            hasMeasuredRef.current = false
        }
    }, [isOpen, width, measureDropdownWidth])

    if (!isOpen) {
        return null
    }

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

interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
    label?: string
    icon?: ReactNode
    rightIcon?: ReactNode
    danger?: boolean
    disabled?: boolean
    onSelect?: () => void
    closeOnSelect?: boolean
    onClick?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void
    onMouseEnter?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void
    onMouseLeave?: (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void
    hasDivider?: boolean
}

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

        if (closeOnSelect ?? contextCloseOnSelect) {
            setOpen(false)
        }
    }

    return (
        <>
            {hasDivider && (
                <div className={styles.dropdownDivider} />
            )}
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
                    {label ?? children}
                </span>
                <div className={styles.dropdownItemIcons}>
                    {icon && (
                        <span
                            className={styles.dropdownIcon}
                        >
                            {icon}
                        </span>
                    )}
                </div>
                {rightIcon && (
                    <span className={styles.dropdownIcon}>
                        {rightIcon}
                    </span>
                )}
            </button>
        </>
    )
}

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
