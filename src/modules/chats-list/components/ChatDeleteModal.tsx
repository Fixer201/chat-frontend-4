// Модальное окно подтверждения удаления чата
'use client'

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

// Интерфейс пропсов компонента ChatDeleteModal
interface ChatDeleteModalProps {
    open: boolean // Флаг открытия модального окна
    onClose: () => void // Функция закрытия модального окна
    onConfirm: () => void // Функция подтверждения удаления
    chatName: string // Имя чата для отображения в сообщении
    loading?: boolean // Флаг загрузки (из внешнего состояния)
}

// Компонент модального окна подтверждения удаления чата
export default function ChatDeleteModal({
    open,
    onClose,
    onConfirm,
    chatName,
    loading = false,
}: ChatDeleteModalProps) {
    // Локальное состояние для отслеживания процесса удаления
    const [isDeleting, setIsDeleting] = useState(false)

    // Обработчик подтверждения удаления
    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm() // Вызываем внешнюю функцию подтверждения
        } finally {
            setIsDeleting(false) // Сбрасываем состояние независимо от результата
        }
    }

    // Конфигурация кнопок модального окна
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Отмена',
            variant: 'secondary',
            onClick: onClose,
            disabled: isDeleting || loading, // Блокируем кнопку во время удаления
        },
        {
            label: 'Удалить',
            variant: 'solid',
            color: 'primary',
            onClick: handleConfirm,
            loading: isDeleting || loading, // Показываем индикатор загрузки
            disabled: isDeleting || loading, // Блокируем кнопку во время удаления
        },
    ]

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Удалить чат"
            description={`Удалить чат с ${chatName} без возможности восстановления? `}
            descriptionColor="muted"
            titleAlign="left"
            iconAlt="Удалить чат"
            buttons={buttons}
            closeOnOverlayClick={!isDeleting && !loading} // Запрещаем закрытие по клику на оверлей во время удаления
        />
    )
}
