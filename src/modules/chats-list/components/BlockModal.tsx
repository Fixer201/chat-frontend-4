// Модальное окно подтверждения блокировки // Для теста чёрного списка
'use client'

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

interface BlockModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    contactName: string
}

export default function BlockModal({
    open,
    onClose,
    onConfirm,
    contactName,
}: BlockModalProps) {
    const [isBlocking, setIsBlocking] = useState(false)

    const handleConfirm = async () => {
        setIsBlocking(true)
        try {
            await onConfirm()
        } finally {
            setIsBlocking(false)
        }
    }

    const buttons: ModalButtonConfig[] = [
        {
            label: 'Заблокировать',
            variant: 'ghost',
            color: 'danger',
            onClick: handleConfirm,
            loading: isBlocking,
            disabled: isBlocking,
        },
        {
            label: 'Отмена',
            variant: 'primary',
            onClick: onClose,
            disabled: isBlocking,
        },
    ]

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Заблокировать ${contactName}?`}
            description="Пользователь не сможет писать Вам личные сообщения, звонить и приглашать Вас в группы и каналы"
            descriptionColor="muted"
            titleAlign="left"
            buttons={buttons}
            closeOnOverlayClick={!isBlocking}
        />
    )
}
