'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'

/**
 * Контекстное меню сообщения — выпадающий список действий по правому клику.
 *
 * Порядок пунктов: Ответить → Переслать → Скопировать → Выбрать → Редактировать → Удалить.
 * «Редактировать» доступно только для собственных сообщений (isOwnMessage).
 * Каждый пункт условно рендерится через optional-колбэки:
 * если колбэк не передан — пункт скрыт.
 *
 * Позиционирование — через manualPosition (clientX/clientY) на компоненте Dropdown.
 */

/** Позиция контекстного меню (координаты курсора при правом клике) */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

interface MessageContextMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Абсолютная позиция меню (clientX/clientY из события contextmenu) */
    position: ContextMenuPosition
    onReply?: () => void
    onForward?: () => void
    onCopy?: () => void
    onSelect?: () => void
    /** Доступно только для собственных сообщений */
    onEdit?: () => void
    onDelete?: () => void
    /** Является ли сообщение собственным — определяет видимость «Редактировать» */
    isOwnMessage: boolean
    /** Обёртка вызова: закрывает меню после выполнения действия */
    onMenuItemClick: (handler?: () => void) => void
}

export const MessageContextMenu = ({
    open,
    onOpenChange,
    position,
    onReply,
    onForward,
    onCopy,
    onSelect,
    onEdit,
    onDelete,
    isOwnMessage,
    onMenuItemClick,
}: MessageContextMenuProps) => {
    return (
        <Dropdown
            open={open}
            onOpenChange={onOpenChange}
            closeOnSelect={true}
        >
            <Dropdown.Content
                manualPosition={position}
                width="auto"
                minWidth={200}
                maxWidth={300}
            >
                {/* Ответить */}
                {onReply && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onReply)
                        }
                        rightIcon={
                            <Image
                                src="/icons/message/Reply.svg"
                                alt="Ответить"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Ответить
                    </Dropdown.Item>
                )}

                {/* Переслать */}
                {onForward && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onForward)
                        }
                        rightIcon={
                            <Image
                                src="/icons/message/Forward.svg"
                                alt="Переслать"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Переслать
                    </Dropdown.Item>
                )}

                {/* Скопировать */}
                {onCopy && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onCopy)
                        }
                        rightIcon={
                            <Image
                                src="/icons/message/Copy.svg"
                                alt="Скопировать"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Скопировать
                    </Dropdown.Item>
                )}

                {/* Выбрать */}
                {onSelect && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onSelect)
                        }
                        rightIcon={
                            <Image
                                src="/icons/message/Select.svg"
                                alt="Выбрать"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Выбрать
                    </Dropdown.Item>
                )}

                {/* Редактировать - только для своих сообщений */}
                {isOwnMessage && onEdit && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onEdit)
                        }
                        rightIcon={
                            <Image
                                src="/icons/settings-sidebar/Edite.svg"
                                alt="Редактировать"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Редактировать
                    </Dropdown.Item>
                )}

                {/* Удалить */}
                {onDelete && (
                    <Dropdown.Item
                        danger
                        onSelect={() =>
                            onMenuItemClick(onDelete)
                        }
                        rightIcon={
                            <Image
                                src="/icons/message/Delete.svg"
                                alt="Удалить"
                                width={20}
                                height={20}
                                className="opacity-80"
                            />
                        }
                    >
                        Удалить
                    </Dropdown.Item>
                )}
            </Dropdown.Content>
        </Dropdown>
    )
}
