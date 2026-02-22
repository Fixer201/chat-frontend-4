'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'
import Modal from '@shared/ui/modal/Modal'

/**
 * Модальное окно подтверждения удаления сообщения.
 *
 * Для собственных сообщений (isOwnMessage) отображает чекбокс «Удалить для всех» —
 * это позволяет выбрать между локальным и глобальным удалением.
 * Для чужих сообщений чекбокс скрыт — удаление только у себя.
 *
 * Блокирует закрытие по оверлею во время выполнения запроса,
 * чтобы предотвратить двойное удаление.
 */
interface DeleteMessageModalProps {
    open: boolean
    onClose: () => void
    /** Колбэк подтверждения: forAll = true — удалить для всех участников чата */
    onConfirm: (forAll: boolean) => void
    /** Является ли сообщение собственным — влияет на отображение чекбокса «для всех» */
    isOwnMessage: boolean
    /** Имя собеседника для персонализации текста: «Удалить у меня и у {chatName}» */
    chatName?: string
    /** Внешний индикатор загрузки (например, от родительского компонента) */
    loading?: boolean
}

export default function DeleteMessageModal({
    open,
    onClose,
    onConfirm,
    isOwnMessage,
    chatName,
    loading = false,
}: Readonly<DeleteMessageModalProps>) {
    /** Локальное состояние процесса удаления — блокирует кнопки и оверлей */
    const [isDeleting, setIsDeleting] = useState(false)
    /** Флаг «Удалить для всех»: передаётся в onConfirm при подтверждении */
    const [deleteForAll, setDeleteForAll] = useState(false)

    // Обработчик подтверждения: оборачивает onConfirm в try/finally
    // для гарантированного сброса состояния загрузки даже при ошибке
    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm(deleteForAll)
            onClose()
        } finally {
            setIsDeleting(false)
            setDeleteForAll(false)
        }
    }

    // При закрытии без подтверждения сбрасываем чекбокс «для всех»,
    // чтобы при повторном открытии он не был в предыдущем состоянии
    const handleClose = () => {
        setDeleteForAll(false)
        onClose()
    }

    // Конфигурация кнопок модалки в формате ModalButtonConfig[]
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Отмена',
            variant: 'ghost',
            color: 'primary',
            onClick: handleClose,
            disabled: isDeleting || loading,
        },
        {
            label: 'Удалить',
            variant: 'solid',
            color: 'primary',
            onClick: handleConfirm,
            loading: isDeleting || loading,
            disabled: isDeleting || loading,
        },
    ]

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Удалить сообщение"
            description="Вы действительно хотите удалить сообщение?"
            descriptionColor="muted"
            titleAlign="left"
            buttons={buttons}
            closeOnOverlayClick={!isDeleting && !loading}
        >
            {/* Чекбокс «Удалить для всех» — виден только для собственных сообщений.
                Кастомная реализация чекбокса через Image (selected/not_selected SVG)
                вместо нативного <input type="checkbox"> для соответствия дизайну.
                transition для плавной смены состояния,
                disabled:cursor-not-allowed блокирует визуальную интерактивность */}
            {isOwnMessage && (
                <button
                    type="button"
                    onClick={() =>
                        setDeleteForAll(!deleteForAll)
                    }
                    disabled={isDeleting || loading}
                    className={`
                      flex cursor-pointer items-center gap-3 py-1
                      transition-opacity
                      hover:opacity-80
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-[0.98]
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                >
                    <Image
                        src={
                            deleteForAll
                                ? '/icons/message/selected.svg'
                                : '/icons/message/not_selected.svg'
                        }
                        alt=""
                        width={22}
                        height={22}
                    />
                    <span className="text-base text-text-black">
                        {chatName
                            ? `Удалить у меня и у ${chatName}`
                            : 'Удалить для всех'}
                    </span>
                </button>
            )}
        </Modal>
    )
}
