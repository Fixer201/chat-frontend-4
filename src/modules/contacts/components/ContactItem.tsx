'use client'
// Элемент списка контактов: отвечает только за отображение и UI‑взаимодействия.
// Best practice: бизнес‑логика (блокировка/удаление) передаётся через props.
import React, {
    useCallback,
    useEffect,
    useState,
} from 'react'
import { Contact } from '@shared/types/contact'
import { ContactAvatar } from '@shared/ui/avatar/components/ContactAvatar'
import { getStatusText } from '@shared/lib/getStatusText'
import type { ReactNode } from 'react'
import { ContactContextMenu } from './ContactContextMenu'

interface ContactItemProps {
    // Данные контакта для отображения (минимально необходимые поля).
    contact: Contact
    // Режим множественного выбора для удаления.
    deleteMode: boolean
    selectedUid: string | null
    selectedContacts: string[]
    searchValue: string
    // Колбэк для выбора в deleteMode.
    onSelectContact: (uid: string) => void
    // Колбэк для выбора контакта в обычном режиме.
    onSetSelectedContact: (uid: string) => void
    // Опциональный правый элемент (кнопки/меню) для кастомизации строки.
    rightElement?: ReactNode
    // Опциональный обработчик блокировки для контекстного меню.
    onBlock?: () => void // Для теста чёрного списка
}

const STYLES = {
    container:
        'relative px-2 py-1 transition-all duration-200',
    divider:
        'absolute right-4 bottom-0 left-(--chat-list-divider-left) h-px bg-(--color-black-alpha-20)',
} as const

export const ContactItem: React.FC<ContactItemProps> = ({
    contact,
    deleteMode,
    selectedUid,
    selectedContacts,
    searchValue,
    onSelectContact,
    onSetSelectedContact,
    rightElement,
    onBlock,
}) => {
    // Вторичный текст (онлайн/последнее посещение) вычисляем на клиенте,
    // чтобы избежать SSR/CSR mismatch.
    const [secondaryText, setSecondaryText] = useState('')
    // Состояние контекстного меню (ПКМ).
    const [contextMenuOpen, setContextMenuOpen] =
        useState(false)
    // Позиция контекстного меню — сохраняем координаты курсора.
    const [contextMenuPosition, setContextMenuPosition] =
        useState({ top: 0, left: 0 })

    // Обработчик правого клика: открываем меню в точке курсора.
    const handleContextMenu = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault()
            setContextMenuPosition({
                left: e.clientX,
                top: e.clientY,
            })
            setContextMenuOpen(true)
        },
        [],
    )
    useEffect(() => {
        // Вычисляем secondaryText на клиенте после гидрации для избежания mismatch.
        // getStatusText() использует getContactWebStatus(), который зависит от new Date(),
        // поэтому значение будет разным на сервере (SSR) и клиенте.
        // useEffect гарантирует, что вычисление происходит ТОЛЬКО после гидрации.
        const text = getStatusText(contact, searchValue)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSecondaryText(text)
    }, [contact, searchValue])

    return (
        <div
            className={STYLES.container}
            // ПКМ для контекстного меню действий (например, блокировка).
            onContextMenu={handleContextMenu}
        >
            <div className={STYLES.divider} />
            <ContactAvatar
                // src={`/images/contacts/${contact?.avatarUrl}`}
                src={contact?.avatarUrl || ''}
                name={`${contact.firstName} ${contact.lastName}`}
                mode={
                    deleteMode
                        ? 'select-contact'
                        : 'contact'
                }
                isOnline={contact.isOnline}
                statusText={secondaryText}
                onClick={() =>
                    // В режиме удаления кликаем для выбора,
                    // иначе — устанавливаем активный контакт.
                    deleteMode
                        ? onSelectContact(contact.uid)
                        : onSetSelectedContact(contact.uid)
                }
                selected={
                    deleteMode
                        ? selectedContacts.includes(
                              contact.uid,
                          )
                        : contact.uid === selectedUid
                }
                onSelect={
                    // Checkbox‑поведение в deleteMode: выделяем по клику.
                    deleteMode
                        ? () => onSelectContact(contact.uid)
                        : undefined
                }
                isSelected={
                    deleteMode
                        ? selectedContacts.includes(
                              contact.uid,
                          )
                        : false
                }
                rightElement={rightElement}
            />

            <ContactContextMenu
                // Контекстное меню управляется локальным state.
                open={contextMenuOpen}
                onOpenChange={setContextMenuOpen}
                position={contextMenuPosition}
                onBlock={() => {
                    // Закрываем меню сразу после действия — улучшает UX.
                    onBlock?.()
                    setContextMenuOpen(false)
                }}
            />
        </div>
    )
}
