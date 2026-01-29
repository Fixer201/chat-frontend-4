'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'

/** Позиция контекстного меню */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

interface MessageContextMenuProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    position: ContextMenuPosition
    onReply?: () => void
    onForward?: () => void
    onCopy?: () => void
    onSelect?: () => void
    onEdit?: () => void
    onDelete?: () => void
    isOwnMessage: boolean // Можно редактировать/удалять только свои сообщения
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
                                width={16}
                                height={16}
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
                                src="/icons/settings-sidebar/Forward.svg"
                                alt="Переслать"
                                width={16}
                                height={16}
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
                                width={16}
                                height={16}
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
                                width={16}
                                height={16}
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
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        Редактировать
                    </Dropdown.Item>
                )}

                {/* Удалить - только для своих сообщений */}
                {isOwnMessage && onDelete && (
                    <Dropdown.Item
                        danger
                        onSelect={() =>
                            onMenuItemClick(onDelete)
                        }
                        rightIcon={
                            <Image
                                src="/icons/settings-sidebar/Delete.svg"
                                alt="Удалить"
                                width={16}
                                height={16}
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
