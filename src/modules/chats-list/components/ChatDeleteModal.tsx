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
    // Используем useState вместо использования пропса loading напрямую,
    // чтобы управлять состоянием загрузки внутри компонента во время асинхронной операции
    const [isDeleting, setIsDeleting] = useState(false)

    // Обработчик подтверждения удаления
    // Асинхронная функция для обработки удаления с индикацией загрузки
    const handleConfirm = async () => {
        setIsDeleting(true) // Устанавливаем состояние загрузки
        try {
            // Вызываем внешнюю функцию подтверждения (обычно это API запрос)
            // await используется для ожидания завершения асинхронной операции
            await onConfirm()
        } finally {
            // Блок finally выполняется в любом случае - успех или ошибка
            // Сбрасываем состояние загрузки независимо от результата операции
            setIsDeleting(false)
        }
    }

    // Конфигурация кнопок модального окна
    // Массив объектов, описывающих кнопки и их поведение
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Отмена',
            variant: 'secondary', // Вторичный стиль кнопки
            onClick: onClose, // Закрывает модальное окно
            disabled: isDeleting || loading, // Блокируем кнопку во время удаления
        },
        {
            label: 'Удалить',
            variant: 'solid', // Основной стиль кнопки
            color: 'primary', // Основной цвет (обычно для опасных действий)
            onClick: handleConfirm, // Вызывает обработчик удаления
            loading: isDeleting || loading, // Показываем индикатор загрузки на кнопке
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
            // Запрещаем закрытие по клику на оверлей во время удаления
            // Это предотвращает случайное закрытие модалки во время выполнения операции
            closeOnOverlayClick={!isDeleting && !loading}
        />
    )
}
