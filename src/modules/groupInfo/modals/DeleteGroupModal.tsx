// components/group/DeleteGroupModal.tsx
'use client' // Указывает, что это клиентский компонент в Next.js (App Router)

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

// Интерфейс пропсов для модального окна удаления группы
interface DeleteGroupModalProps {
    open: boolean // Открыто ли окно
    onClose: () => void // Функция закрытия
    onConfirm: () => void | Promise<void> // Функция подтверждения удаления
    groupName?: string // Название группы для персонализации заголовка
    loading?: boolean // Внешний флаг загрузки (например, от родителя)
}

export default function DeleteGroupModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: DeleteGroupModalProps) {
    // Внутреннее состояние для отслеживания процесса удаления
    const [isDeleting, setIsDeleting] = useState(false)

    // Обработчик подтверждения удаления
    const handleConfirm = async () => {
        setIsDeleting(true) // Блокируем UI
        try {
            await onConfirm() // Вызываем внешний обработчик
        } finally {
            setIsDeleting(false) // Разблокируем UI
        }
    }

    // Конфигурация кнопок
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Удалить', // Кнопка удаления
            variant: 'ghost',
            color: 'danger', // Красный цвет для опасных действий
            onClick: handleConfirm,
            loading: isDeleting || loading, // Лоадер, если удаляем
            disabled: isDeleting || loading, // Блокировка
        },
        {
            label: 'Отменить', // Кнопка отмены
            variant: 'solid', // Сплошная кнопка
            // color не указан, вероятно, у solid есть цвет по умолчанию (например, primary)
            onClick: onClose,
            disabled: isDeleting || loading,
        },
    ]

    // Динамическое формирование заголовка: с названием группы или без
    const title = groupName
        ? `Удалить группу «${groupName}»?`
        : 'Удалить группу?'

    // Текст описания
    const description =
        'Вы точно хотите удалить эту группу и все сообщения в ней для всех участников? Это действие нельзя отменить.'

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title} // Используем динамический заголовок
            description={description}
            descriptionColor="muted"
            titleAlign="left"
            iconAlt="Удалить группу"
            buttons={buttons}
            closeOnOverlayClick={!isDeleting && !loading} // Закрытие по фону только не в процессе
        />
        // У этого модального окна нет дочерних элементов (пустой), только встроенный контент Modal
    )
}
