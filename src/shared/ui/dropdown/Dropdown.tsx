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
  width?: number|string;
  className?: string;
  children: ReactNode;
  items?: DropdownItemProps[];
  manualPosition?: {
    top: number;
    left: number;
  }|null;
  minWidth?: number;
  maxWidth?:number;
}

function DropdownContent({ 
  width = 'auto', 
  minWidth=180,
  maxWidth=400,
  className, 
  children, 
  items, 
  style, 
  manualPosition,
  ...props 
}: DropdownContentProps) {
  const { isOpen, triggerRef, menuRef, placement, offset } = useDropdownContext();
  const [position, setPosition] = useState<CSSProperties>({ opacity: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState<number | 'auto' | string>(
    width === 'auto' ? 'auto' : typeof width === 'string' ? width : width
  );
  const [calculatedWidth, setCalculatedWidth] = useState<number>(minWidth);
const [isMeasuring, setIsMeasuring] = useState(false);
 // Реф для отслеживания, измерили ли мы уже ширину
  const hasMeasuredRef = useRef(false);
  useLayoutEffect(() => {
    if (!isOpen || manualPosition) return;

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      let top = triggerRect.bottom + offset + window.scrollY;
      let left = triggerRect.left + window.scrollX;

      if (placement.startsWith("top")) {
        top = triggerRect.top - offset - menuRect.height + window.scrollY;
      }

      if (placement.endsWith("end")) {
        left = triggerRect.right - menuRect.width + window.scrollX;
      }

      setPosition({
        top,
        left,
        opacity: 1,
      });
    };

    updatePosition();

    const handle = () => updatePosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [isOpen, offset, placement, triggerRef, menuRef, manualPosition]);

  const measureTextWidth = useCallback((text: string, font: string = "16px 'Roboto', sans-serif"): number => {
    if (typeof document === 'undefined') return 0;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }, []);

  const measureDropdownWidth = useCallback(() => {
    if (!contentRef.current || width !== 'auto') return minWidth;

    const itemElements = contentRef.current.querySelectorAll('.dropdown-item');
    if (itemElements.length === 0) return minWidth;

    let maxTextWidth = 0;
    
    itemElements.forEach(item => {
      const textElement = item.querySelector('.dropdown-item-text');
      if (textElement) {
        const text = textElement.textContent || '';
        const textWidth = measureTextWidth(text);
        maxTextWidth = Math.max(maxTextWidth, textWidth);
      }
    });

    const totalWidth = Math.ceil(maxTextWidth + 96);
    
    let finalWidth = Math.max(minWidth, totalWidth);
    if (maxWidth && finalWidth > maxWidth) {
      finalWidth = maxWidth;
    }
    
    return finalWidth;
  }, [width, minWidth, maxWidth, measureTextWidth]);

  useLayoutEffect(() => {
    if (!isOpen || width !== 'auto' || hasMeasuredRef.current) return;

    setIsMeasuring(true);
    
    const updateWidth = () => {
      const newWidth = measureDropdownWidth();
      setCalculatedWidth(newWidth);
      setIsMeasuring(false);
      hasMeasuredRef.current = true;
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(updateWidth);
    });

    return () => {
      hasMeasuredRef.current = false;
    };
  }, [isOpen, width, measureDropdownWidth]);

  useEffect(() => {
    if (!isOpen) {
      hasMeasuredRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const finalWidth = width === 'auto' 
    ? (isMeasuring ? minWidth : calculatedWidth)
    : width;

 const contentStyle: CSSProperties = manualPosition 
    ? { 
        width: width === 'auto' ? calculatedWidth : width,
        minWidth: minWidth,
        position: 'fixed' as const, 
        top: manualPosition.top, 
        left: manualPosition.left, 
        opacity: 1, 
        zIndex: 1000,
        ...(style as CSSProperties) 
      }
    : { 
         width: width === 'auto' ? calculatedWidth : width,
        minWidth: minWidth,
         ...position,
          ...(style as CSSProperties)
         };

  return createPortal(
    (
      <div
        ref={menuRef}
        role="menu"
        style={contentStyle}
         className={cn(
          "absolute z-60 max-h-[calc(100vh-32px)] overflow-hidden rounded-xl bg-(--color-white-bg) shadow-(--color-context-shadow)",
          "dropdown-width-auto", 
          className
        )}
        {...props}
      >
        
          <div 
          ref={contentRef}
         className="flex max-h-[inherit] flex-col overflow-auto dropdown-no-wrap" //  Добавил dropdown-no-wrap
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
  };

  return (
    <>
    {hasDivider && (
        <div className="border-t border-(--color-black-alpha-20) my-1" />
      )}
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
       onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      className={cn(
        "dropdown-item", 
        "flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-base font-normal leading-[130%] transition-colors duration-150 border-b border-(--color-black-alpha-20) last:border-b-0",
        "dropdown-no-wrap", 
        disabled
          ? "cursor-not-allowed text-[#9CA3AF]"
          : danger
            ? "cursor-pointer text-(--color-system-red) hover:bg-(--color-system-red-surface)"
            : "cursor-pointer text-(--color-text-black) hover:bg-(--color-gray-light)",
        className
      )}
      {...props}
    >
      <span className="dropdown-item-text dropdown-item-content truncate flex-1">
        {label ?? children}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {/* Иконка слева от текста (если нужна) */}
          {icon && (
            <span className="text-(--color-text-gray) w-5 h-5 flex items-center justify-center opacity-80">
              {icon}
            </span>
          )}
         
          
        </div>
       {/* Иконка справа от текста */}
        {rightIcon && (
          <span className="text-(--color-text-gray) w-5 h-5 flex items-center justify-center opacity-80">
            {rightIcon}
          </span>
        )}
    </button>
    </>
  );
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
