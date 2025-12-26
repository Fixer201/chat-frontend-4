'use client'

import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

interface ChatDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  chatName: string
  loading?: boolean
}

export default function ChatDeleteModal({
  open,
  onClose,
  onConfirm,
  chatName,
  loading = false
}: ChatDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      // После успешного удаления модальное окно закроется через onClose в родительском компоненте
    } finally {
      setIsDeleting(false)
    }
  }

  const buttons: ModalButtonConfig[] = [
    {
      label: "Отмена",
      variant: "secondary",
      onClick: onClose,
      disabled: isDeleting || loading
    },
    {
      label: "Удалить",
      variant: "solid",
      color: "danger",
      onClick: handleConfirm,
      loading: isDeleting || loading,
      disabled: isDeleting || loading
    }
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Удалить чат"
      description={`Вы уверены, что хотите удалить чат с ${chatName}? Все сообщения будут удалены.`}
      descriptionColor="muted"
      iconAlt="Удалить чат"
      buttons={buttons}
      closeOnOverlayClick={!isDeleting && !loading}
    />
  )
}