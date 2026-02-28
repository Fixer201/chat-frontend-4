// Выпадающее меню для элемента списка чатов (расширенная версия)
'use client'

import Dropdown from '@shared/ui/dropdown/Dropdown'
import Image from 'next/image'

/** Позиция контекстного меню */
type ContextMenuPosition = Readonly<{
    top: number
    left: number
}>

// Интерфейс пропсов компонента ChatListItemDropdown
interface ChatListItemDropdownProps {
    open: boolean // Флаг открытия меню
    onOpenChange: (open: boolean) => void // Обработчик изменения состояния открытия
    position: ContextMenuPosition // Позиция меню на экране
    onMuteChat?: () => void // Обработчик включения/выключения уведомлений
    onFavoriteChat?: () => void // Обработчик добавления/удаления из избранного
    onMarkAsRead?: () => void // Обработчик пометки как прочитанного
    onMarkAsUnread?: () => void // Обработчик пометки как непрочитанного
    onDeleteChat?: () => void // Обработчик удаления чата
    onAddToContacts?: () => void // Обработчик добавления в контакты
    onOpenInfoPanel?: () => void
    notificationsEnabled: boolean // Флаг состояния уведомлений
    isFavorite: boolean // Флаг избранного чата
    isChatRead: boolean // Флаг прочитанности чата
    isInContacts: boolean // Флаг нахождения в контактах
    onMenuItemClick: (handler?: () => void) => void // Обработчик клика по пункту меню
    hoveredItem?: string | null // На какой элемент наведен курсор
    setHoveredItem?: (item: string | null) => void // Функция установки наведенного элемента
}

// Компонент выпадающего меню с действиями для элемента списка чатов
export const ChatListItemDropdown = ({
    open,
    onOpenChange,
    position,
    onMuteChat,
    onFavoriteChat,
    onMarkAsRead,
    onMarkAsUnread,
    onDeleteChat,
    onAddToContacts,
    onOpenInfoPanel,
    notificationsEnabled,
    isFavorite,
    isChatRead,
    isInContacts,
    onMenuItemClick,
    setHoveredItem,
}: ChatListItemDropdownProps) => {
    return (
        <Dropdown
            open={open}
            onOpenChange={onOpenChange}
            closeOnSelect={true} // Закрывать меню после выбора пункта
        >
            <Dropdown.Content
                manualPosition={position} // Ручная установка позиции
                width="auto"
                minWidth={200} // Минимальная ширина меню
                maxWidth={350} // Максимальная ширина меню
            >
                {/* Пункт "Подробная информация" */}
                {onOpenInfoPanel && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onOpenInfoPanel)
                        }
                        rightIcon={
                            <Image
                                src="/icons/info.svg"
                                alt="Подробная информация"
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                        onMouseEnter={() =>
                            setHoveredItem?.('info')
                        }
                        onMouseLeave={() =>
                            setHoveredItem?.(null)
                        }
                    >
                        Подробная информация
                    </Dropdown.Item>
                )}

                {/* Пункт "Добавить в контакты" - показывается только если контакт еще не в списке контактов */}
                {/* Используем условный рендеринг && для предотвращения рендера при отсутствии обработчика */}
                {!isInContacts && onAddToContacts && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onAddToContacts)
                        }
                        rightIcon={
                            <Image
                                src="/images/chatList/addContact.svg"
                                alt="Добавить в контакты"
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                        onMouseEnter={() =>
                            setHoveredItem?.(
                                'addToContacts',
                            )
                        }
                        onMouseLeave={() =>
                            setHoveredItem?.(null)
                        }
                    >
                        Добавить в контакты
                    </Dropdown.Item>
                )}

                {/* Пункт управления уведомлениями */}
                {onMuteChat && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onMuteChat)
                        }
                        rightIcon={
                            // Динамически меняем иконку в зависимости от состояния уведомлений
                            <Image
                                src={
                                    notificationsEnabled
                                        ? '/images/chatList/mute.svg'
                                        : '/images/chatList/unMute.svg'
                                }
                                alt={
                                    notificationsEnabled
                                        ? 'Отключить уведомления'
                                        : 'Включить уведомления'
                                }
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        {/* Динамически меняем текст в зависимости от состояния уведомлений */}
                        {notificationsEnabled
                            ? 'Отключить уведомления'
                            : 'Включить уведомления'}
                    </Dropdown.Item>
                )}

                {/* Пункт добавления/удаления из избранного */}
                {onFavoriteChat && (
                    <Dropdown.Item
                        onSelect={() =>
                            onMenuItemClick(onFavoriteChat)
                        }
                        rightIcon={
                            // Динамически меняем иконку в зависимости от состояния избранного
                            <Image
                                src={
                                    isFavorite
                                        ? '/images/chatList/unpin.svg'
                                        : '/images/chatList/pin.svg'
                                }
                                alt={
                                    isFavorite
                                        ? 'Открепить'
                                        : 'Закрепить'
                                }
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        {/* Динамически меняем текст в зависимости от состояния избранного */}
                        {isFavorite
                            ? 'Открепить чат'
                            : 'Закрепить чат'}
                    </Dropdown.Item>
                )}

                {/* Условный рендеринг: пункт "Пометить непрочитанным" или "Пометить прочитанным" в зависимости от состояния */}
                {/* Используем тернарный оператор для выбора между двумя вариантами */}
                {isChatRead
                    ? onMarkAsUnread && (
                          <Dropdown.Item
                              onSelect={() =>
                                  onMenuItemClick(
                                      onMarkAsUnread,
                                  )
                              }
                              rightIcon={
                                  <Image
                                      src="/images/chatList/markAsUnread.svg"
                                      alt="Пометить непрочитанным"
                                      width={16}
                                      height={16}
                                      className="opacity-80"
                                  />
                              }
                              onMouseEnter={() =>
                                  setHoveredItem?.('unread')
                              }
                              onMouseLeave={() =>
                                  setHoveredItem?.(null)
                              }
                          >
                              Пометить непрочитанным
                          </Dropdown.Item>
                      )
                    : onMarkAsRead && (
                          <Dropdown.Item
                              onSelect={() =>
                                  onMenuItemClick(
                                      onMarkAsRead,
                                  )
                              }
                              rightIcon={
                                  <Image
                                      src="/images/chatList/markAsRead.svg"
                                      alt="Пометить прочитанным"
                                      width={16}
                                      height={16}
                                      className="opacity-80"
                                  />
                              }
                              onMouseEnter={() =>
                                  setHoveredItem?.('read')
                              }
                              onMouseLeave={() =>
                                  setHoveredItem?.(null)
                              }
                          >
                              Пометить прочитанным
                          </Dropdown.Item>
                      )}

                {/* Опасный пункт "Удалить чат" */}
                {onDeleteChat && (
                    <Dropdown.Item
                        danger // Специальный стиль для опасных действий (обычно красный цвет)
                        onSelect={() =>
                            onMenuItemClick(onDeleteChat)
                        }
                        rightIcon={
                            <Image
                                src="/images/chatList/deleteChat.svg"
                                alt="Удалить"
                                width={16}
                                height={16}
                                className="opacity-80"
                            />
                        }
                    >
                        Удалить чат
                    </Dropdown.Item>
                )}
            </Dropdown.Content>
        </Dropdown>
    )
}
