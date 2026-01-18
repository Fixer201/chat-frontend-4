// Контекстное меню для чата (более старая/простая версия)
'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'

// Интерфейс пропсов компонента ChatContextMenu
interface ChatContextMenuProps {
    open: boolean // Флаг открытия меню - контролируемое состояние от родительского компонента
    onOpenChange: (open: boolean) => void // Функция изменения состояния открытия - колбэк для обновления состояния в родителе
    position: { x: number; y: number } // Позиция меню на экране в пикселях
    onDelete?: () => void // Обработчик удаления чата - опциональный, так как не для всех чатов доступно удаление
    onPin?: () => void // Обработчик закрепления чата
    onMute?: () => void // Обработчик включения/выключения уведомлений
    onArchive?: () => void // Обработчик архивирования чата
    notificationsEnabled?: boolean // Флаг состояния уведомлений - влияет на текст пункта меню
}

// Компонент контекстного меню для чата
// Более простая версия по сравнению с ChatListItemDropdown - имеет меньше пунктов и функционала
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
            open={open} // Передаем состояние открытия из пропсов
            onOpenChange={onOpenChange} // Позволяем родителю контролировать состояние меню
            closeOnSelect={true} // Закрывать меню после выбора пункта - улучшает UX
        >
            <Dropdown.Content
                manualPosition={{
                    // Ручное позиционирование меню
                    left: position.x, // X координата от клика мыши
                    top: position.y, // Y координата от клика мыши
                }}
                width="auto" // Ширина адаптируется под содержимое
                minWidth={150} // Минимальная ширина для предотвращения слишком узкого меню
                maxWidth={350} // Максимальная ширина для предотвращения слишком широкого меню
            >
                {/* Пункт меню для закрепления чата (если передан обработчик) */}
                {/* Используем условный рендеринг && чтобы не рендерить пункт если нет обработчика */}
                {onPin && (
                    <Dropdown.Item onSelect={onPin}>
                        Закрепить чат
                    </Dropdown.Item>
                )}
                {/* Пункт меню для управления уведомлениями */}
                {onMute && (
                    <Dropdown.Item onSelect={onMute}>
                        {/* Динамический текст в зависимости от текущего состояния уведомлений */}
                        {
                            notificationsEnabled
                                ? 'Отключить уведомления' // Если уведомления включены - предлагаем отключить
                                : 'Включить уведомления' // Если выключены - предложить включить
                        }
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
                        danger // Специальный стиль для опасных действий (обычно красный цвет)
                        onSelect={onDelete}
                    >
                        Удалить чат
                    </Dropdown.Item>
                )}
            </Dropdown.Content>
        </Dropdown>
    )
}
