// components/group/LeaveGroupModal.tsx
'use client' // Клиентский компонент Next.js

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

// Интерфейс пропсов для модального окна выхода из группы
interface LeaveGroupModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    groupName?: string // Название группы для персонализации заголовка
    loading?: boolean // Внешний флаг загрузки
}

export default function LeaveGroupModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: LeaveGroupModalProps) {
    // Внутреннее состояние процесса выхода
    const [isLeaving, setIsLeaving] = useState(false)

    // Обработчик подтверждения выхода
    const handleConfirm = async () => {
        setIsLeaving(true) // Блокируем UI
        try {
            await onConfirm() // Выполняем внешнюю функцию выхода
        } finally {
            setIsLeaving(false) // Разблокируем UI
        }
    }

    // Конфигурация кнопок
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Покинуть', // Кнопка действия
            variant: 'ghost',
            color: 'danger', // Красный цвет, так как действие может быть опасным (выход из группы)
            onClick: handleConfirm,
            loading: isLeaving || loading,
            disabled: isLeaving || loading,
        },
        {
            label: 'Отменить', // Кнопка отмены
            variant: 'solid', // Сплошная кнопка (вероятно, основная)
            onClick: onClose,
            disabled: isLeaving || loading,
        },
    ]

    // Динамический заголовок с именем группы или общий
    const title = groupName
        ? `Покинуть группу «${groupName}»?`
        : 'Покинуть группу?'

    // Описание с объяснением последствий (можно вернуться)
    const description =
        'Это открытая группа — вы сможете вернуться в любой момент'

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            descriptionColor="muted"
            titleAlign="left"
            iconAlt="Покинуть группу"
            buttons={buttons}
            closeOnOverlayClick={!isLeaving && !loading} // Закрытие по фону разрешено, только если не в процессе загрузки
        />
        // Компонент не имеет дочерних элементов, использует только встроенное содержимое Modal
    )
}
