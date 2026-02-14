// shared/ui/dropdown/DropdownMenuButton.tsx
'use client'

import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import Dropdown from './Dropdown'

export interface MenuItem {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    className?: string
    hasDivider?: boolean // 👈 разделитель перед этим пунктом
    isDanger?: boolean // 👈 для пунктов, которые выполняют опасные действия (например, удаление)
}

interface DropdownMenuButtonProps {
    triggerIcon: React.ReactNode
    triggerClassName?: string
    items: MenuItem[]
    menuWidth?: number
    offsetY?: number
    placement?: 'bottom-right' | 'bottom-left'
    ariaLabel?: string
}

export default function DropdownMenuButton({
    triggerIcon,
    triggerClassName = '',
    items,
    menuWidth = 200,
    offsetY = 4,
    placement = 'bottom-right',
    ariaLabel = 'Меню',
}: DropdownMenuButtonProps) {
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
    })
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleOpen = useCallback(
        (e: React.MouseEvent) => {
            if (!buttonRef.current) return
            const rect =
                buttonRef.current.getBoundingClientRect()

            let left = 0
            if (placement === 'bottom-right') {
                left = rect.right - menuWidth
            } else {
                left = rect.left
            }

            setMenuPosition({
                left,
                top: rect.bottom + offsetY,
            })
        },
        [menuWidth, placement, offsetY],
    )

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleOpen}
                    aria-label={ariaLabel}
                    className={triggerClassName}
                >
                    {triggerIcon}
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content
                width="auto"
                minWidth={menuWidth}
                maxWidth={menuWidth}
                manualPosition={menuPosition}
            >
                {items.map((item, index) => (
                    <Dropdown.Item
                        key={index}
                        label={item.label}
                        onSelect={item.onClick}
                        className={item.className}
                        rightIcon={item.icon}
                        hasDivider={item.hasDivider} // 👈 разделитель сверху
                        danger={item.isDanger} // 👈 стили для опасных действий
                    />
                ))}
            </Dropdown.Content>
        </Dropdown>
    )
}
