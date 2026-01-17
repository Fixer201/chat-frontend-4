// Контекстное меню для чата (более старая/простая версия)
'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'

// Интерфейс пропсов компонента ChatContextMenu
interface ChatContextMenuProps {
    open: boolean // Флаг открытия меню
    onOpenChange: (open: boolean) => void // Функция изменения состояния открытия
    position: { x: number; y: number } // Позиция меню на экране
    onDelete?: () => void // Обработчик удаления чата
    onPin?: () => void // Обработчик закрепления чата
    onMute?: () => void // Обработчик включения/выключения уведомлений
    onArchive?: () => void // Обработчик архивирования чата
    notificationsEnabled?: boolean // Флаг состояния уведомлений
}

// Компонент контекстного меню для чата
export default function ChatContextMenu({
    open,
    onOpenChange,
    position,
    onDelete,
    onPin,
    onMute,
    onArchive,
    notificationsEnabled,
}: ChatContextMenuProps) {
    return (
        <Dropdown
            open={open}
            onOpenChange={onOpenChange}
            closeOnSelect={true} // Закрывать меню после выбора пункта
        >
            <Dropdown.Content
                manualPosition={{
                    left: position.x,
                    top: position.y,
                }}
                width="auto"
                minWidth={150}
                maxWidth={350}
            >
                {/* Пункт меню для закрепления чата (если передан обработчик) */}
                {onPin && (
                    <Dropdown.Item onSelect={onPin}>
                        Закрепить чат
                    </Dropdown.Item>
                )}
                {/* Пункт меню для управления уведомлениями */}
                {onMute && (
                    <Dropdown.Item onSelect={onMute}>
                        {notificationsEnabled
                            ? 'Отключить уведомления'
                            : 'Включить уведомления'}
                    </Dropdown.Item>
                )}
                {/* Пункт меню для архивирования */}
                {onArchive && (
                    <Dropdown.Item onSelect={onArchive}>
                        Архивировать
                    </Dropdown.Item>
                )}
                {/* Опасный пункт меню для удаления чата */}
                {onDelete && (
                    <Dropdown.Item
                        danger // Специальный стиль для опасных действий
                        onSelect={onDelete}
                    >
                        Удалить чат
                    </Dropdown.Item>
                )}
            </Dropdown.Content>
        </Dropdown>
    )
}
