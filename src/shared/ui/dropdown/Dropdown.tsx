"use client";

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@shared/lib/utils";

type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

interface DropdownContextValue {
  isOpen: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  placement: Placement;
  offset: number;
  closeOnSelect: boolean;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown compound components must be used within <Dropdown>");
  }
  return context;
};

const mergeRefs = <T,>(...refs: Array<Ref<T> | null | undefined>) => {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    });
  };
};

interface DropdownProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  closeOnSelect?: boolean;
}

function DropdownRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  placement = "bottom-start",
  offset = 8,
  closeOnSelect = true,
}: DropdownProps) {
  const isControlled = typeof open === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setOpen]);

  const value = useMemo<DropdownContextValue>(
    () => ({ isOpen, setOpen, triggerRef, menuRef, placement, offset, closeOnSelect }),
    [closeOnSelect, isOpen, offset, placement, setOpen]
  );

  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>;
}

interface DropdownTriggerProps {
  children: ReactElement;
}

function DropdownTrigger({ children }: DropdownTriggerProps) {
  const { isOpen, setOpen, triggerRef } = useDropdownContext();

  const child = Children.only(children) as ReactElement<any>;
  const existingRef = (child as any).ref as Ref<HTMLElement> | undefined;
  const existingOnClick = child.props?.onClick as
    | ((event: ReactMouseEvent<HTMLElement>) => void)
    | undefined;

  return cloneElement(child, {
    ref: mergeRefs<HTMLElement>(triggerRef, existingRef),
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      existingOnClick?.(event);
      if (event.defaultPrevented) return;
      setOpen(!isOpen);
    },
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
  });
}

interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
  width?: number;
  className?: string;
  children: ReactNode;
  items?: DropdownItemProps[];
}

function DropdownContent({ width = 250, className, children, items, style, ...props }: DropdownContentProps) {
  const { isOpen, triggerRef, menuRef, placement, offset } = useDropdownContext();
  const [position, setPosition] = useState<CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, offset, placement, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    (
      <div
        ref={menuRef}
        role="menu"
        style={{ width, ...position, ...style }}
        className={cn(
          "absolute z-[60] max-h-[calc(100vh-32px)] overflow-hidden rounded-xl bg-white shadow-[0px_12px_32px_rgba(19,22,31,0.12)]",
          className
        )}
        {...props}
      >
        <div className="flex max-h-[inherit] flex-col overflow-auto">
          {items?.map((item, index) => (
            <DropdownItem key={`${item.label ?? index}-${index}`} {...item} />
          ))}
          {children}
        </div>
      </div>
    ),
    document.body
  );
}

interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  closeOnSelect?: boolean;
}

function DropdownItem({
  label,
  icon,
  danger,
  disabled,
  onClick,
  onSelect,
  className,
  closeOnSelect,
  children,
  ...props
}: DropdownItemProps) {
  const { setOpen, closeOnSelect: contextCloseOnSelect } = useDropdownContext();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (event.defaultPrevented) return;
    onSelect?.();
    if (closeOnSelect ?? contextCloseOnSelect) {
      setOpen(false);
    }
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-between gap-4 border-b border-[#E5E7EB] px-4 py-[10px] text-left text-base font-normal leading-[130%] transition-colors duration-150 last:border-b-0",
        disabled
          ? "cursor-not-allowed text-[#9CA3AF]"
          : danger
            ? "cursor-pointer text-[var(--color-system-red)] hover:bg-[var(--color-system-red-surface)]"
            : "cursor-pointer text-[#1C1C1E] hover:bg-[rgba(28,28,30,0.06)]",
        className
      )}
      {...props}
    >
      <span className="truncate">{label ?? children}</span>
      {icon && <span className="flex-shrink-0 text-[#6B7280]">{icon}</span>}
    </button>
  );
}

const Dropdown = DropdownRoot as typeof DropdownRoot & {
  Trigger: typeof DropdownTrigger;
  Content: typeof DropdownContent;
  Item: typeof DropdownItem;
};

Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;

export type { DropdownProps, DropdownItemProps };
export default Dropdown;

// Пример использования:
// <Dropdown>
//   <Dropdown.Trigger>
//     <Button variant="ghost">Меню</Button>
//   </Dropdown.Trigger>
//   <Dropdown.Content width={220}>
//     <Dropdown.Item onSelect={() => console.log("Ответить")}>
//       Ответить
//     </Dropdown.Item>
//     <Dropdown.Item icon={<CheckIcon />}>Выбрать</Dropdown.Item>
//     <Dropdown.Item danger icon={<TrashIcon />}>
//       Удалить
//     </Dropdown.Item>
//   </Dropdown.Content>
// </Dropdown>
