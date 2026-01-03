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
      color: "primary",
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
      description={`Удалить чат с ${chatName} без возможности восстановления? `}
      descriptionColor="muted"
      titleAlign ='left'
      iconAlt="Удалить чат"
      buttons={buttons}
      closeOnOverlayClick={!isDeleting && !loading}
    />
  )
}