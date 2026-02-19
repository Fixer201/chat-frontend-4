// components/group/LeaveGroupModal.tsx (путь может отличаться в зависимости от структуры проекта)
'use client'

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

interface LeaveGroupModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    groupName?: string // название группы для персонализации сообщения
    loading?: boolean // внешнее состояние загрузки (опционально)
}

export default function LeaveGroupModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: LeaveGroupModalProps) {
    const [isLeaving, setIsLeaving] = useState(false)

    const handleConfirm = async () => {
        setIsLeaving(true)
        try {
            await onConfirm()
        } finally {
            setIsLeaving(false)
        }
    }

    const buttons: ModalButtonConfig[] = [
        {
            label: 'Покинуть',
            variant: 'ghost',
            color: 'danger', // соответствует исходной стилистике
            onClick: handleConfirm,
            loading: isLeaving || loading,
            disabled: isLeaving || loading,
        },
        {
            label: 'Отменить',
            variant: 'solid', // первичная кнопка отмены (можно 'secondary' по дизайну)
            onClick: onClose,
            disabled: isLeaving || loading,
        },
    ]

    const title = groupName
        ? `Покинуть группу «${groupName}»?`
        : 'Покинуть группу?'

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
            closeOnOverlayClick={!isLeaving && !loading}
        />
    )
}