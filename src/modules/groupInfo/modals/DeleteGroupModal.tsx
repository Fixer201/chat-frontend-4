// components/group/DeleteGroupModal.tsx
'use client'

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

interface DeleteGroupModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void | Promise<void>
    groupName?: string
    loading?: boolean
}

export default function DeleteGroupModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: DeleteGroupModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
        } finally {
            setIsDeleting(false)
        }
    }

    const buttons: ModalButtonConfig[] = [
        {
            label: 'Удалить',
            variant: 'ghost',
            color: 'danger', // для опасных действий используем danger
            onClick: handleConfirm,
            loading: isDeleting || loading,
            disabled: isDeleting || loading,
        },
        {
            label: 'Отменить',
            variant: 'solid', // первичная кнопка отмены
            onClick: onClose,
            disabled: isDeleting || loading,
        },
        
    ]

    const title = groupName
        ? `Удалить группу «${groupName}»?`
        : 'Удалить группу?'

    const description =
        'Вы точно хотите удалить эту группу и все сообщения в ней для всех участников? Это действие нельзя отменить.'

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            descriptionColor="muted"
            titleAlign="left"
            iconAlt="Удалить группу"
            buttons={buttons}
            closeOnOverlayClick={!isDeleting && !loading}
        />
    )
}