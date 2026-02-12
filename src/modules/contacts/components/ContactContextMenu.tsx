// Контекстное меню для контакта (ПКМ, только блокировка) // Для теста чёрного списка
'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'

/** Позиция контекстного меню */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

interface ContactContextMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    position: ContextMenuPosition
    onBlock: () => void // Для теста чёрного списка
}

export function ContactContextMenu({
    open,
    onOpenChange,
    position,
    onBlock,
}: ContactContextMenuProps) {
    return (
        <Dropdown
            open={open}
            onOpenChange={onOpenChange}
            closeOnSelect
        >
            <Dropdown.Content
                manualPosition={position}
                width="auto"
                minWidth={180}
            >
                <Dropdown.Item danger onSelect={onBlock}>
                    Заблокировать
                </Dropdown.Item>
            </Dropdown.Content>
        </Dropdown>
    )
}
