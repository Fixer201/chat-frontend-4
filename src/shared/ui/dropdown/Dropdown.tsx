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
    minWidth?: number
}

function DropdownContent({
    width = 250,
    minWidth = 120,
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
    const [contentWidth, setContentWidth] = useState<
        number | string
    >(width)

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

        window.addEventListener('resize', updatePosition)
        window.addEventListener(
            'scroll',
            updatePosition,
            true,
        )

        return () => {
            window.removeEventListener(
                'resize',
                updatePosition,
            )
            window.removeEventListener(
                'scroll',
                updatePosition,
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

    useEffect(() => {
        if (!isOpen) return

        const measureWidth = () => {
            // If width is 'auto', measure content and set max width
            if (width === 'auto' && contentRef.current) {
                const contentElement = contentRef.current
                const itemsElements =
                    contentElement.querySelectorAll(
                        '.dropdown-item-content',
                    )

                let maxWidth = minWidth
                itemsElements.forEach((item) => {
                    const itemWidth = item.scrollWidth
                    if (itemWidth > maxWidth) {
                        maxWidth = itemWidth
                    }
                })

                // Use requestAnimationFrame for async state update
                requestAnimationFrame(() => {
                    setContentWidth(maxWidth + 48) // 24px padding on each side
                })
            } else {
                // Use provided width value
                setContentWidth(width)
            }
        }

        measureWidth()
    }, [width, isOpen, minWidth])

    if (!isOpen) {
        return null
    }

    const getContentWidth = () =>
        contentWidth === 'auto' ? 'auto' : contentWidth

    const contentStyle: CSSProperties = manualPosition
        ? {
              width: getContentWidth(),
              minWidth: minWidth,
              position: 'fixed' as const,
              top: manualPosition.top,
              left: manualPosition.left,
              opacity: 1,
              zIndex: 1000,
              ...(style as CSSProperties),
          }
        : {
              width: getContentWidth(),
              minWidth: minWidth,
              ...position,
              ...(style as CSSProperties),
          }

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            style={contentStyle}
            className={cn(
                `
                  absolute z-[60] max-h-[calc(100vh-32px)] overflow-hidden
                  rounded-xl bg-white-bg shadow-context-shadow
                `,
                className,
            )}
            {...props}
        >
            <div
                ref={contentRef}
                className={`flex max-h-[inherit] flex-col overflow-auto`}
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
}: DropdownItemProps) {
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
                <div className="my-1 border-t border-(--color-black-alpha-20)" />
            )}
            <button
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={handleClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={cn(
                    `
                      flex w-full items-center justify-between gap-4 border-b
                      border-(--color-black-alpha-20) px-4 py-[10px] text-left
                      text-base leading-[130%] font-normal transition-colors
                      duration-150
                      last:border-b-0
                    `,
                    disabled
                        ? 'cursor-not-allowed text-text-gray'
                        : danger
                          ? `
                            cursor-pointer text-system-red
                            hover:bg-system-red-surface
                          `
                          : `
                            cursor-pointer text-text-black
                            hover:bg-gray-light
                          `,
                    className,
                )}
                {...props}
            >
                <span className="dropdown-item-content">
                    {label ?? children}
                </span>
                <div className="flex flex-shrink-0 items-center gap-2">
                    {icon && (
                        <span
                            className={`
                              flex h-5 w-5 items-center justify-center
                              text-text-gray opacity-80
                            `}
                        >
                            {icon}
                        </span>
                    )}
                    {rightIcon && (
                        <span
                            className={`
                              flex h-5 w-5 items-center justify-center
                              text-text-gray opacity-80
                            `}
                        >
                            {rightIcon}
                        </span>
                    )}
                </div>
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
