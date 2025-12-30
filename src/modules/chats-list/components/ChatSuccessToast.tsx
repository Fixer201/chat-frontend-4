'use client'

import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'
import { useEffect } from 'react'
interface ChatSuccessToastProps {
  open: boolean
  onClose: () => void
  userName: string
   autoCloseDelay?: number
}

export default function ChatSuccessToast({
  open,
  onClose,
  userName,
  autoCloseDelay = 3000,
}: ChatSuccessToastProps) {

useEffect(() => {
    if (open && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [open, onClose, autoCloseDelay])

  const buttons: ModalButtonConfig[] = [
    {
      label: "Понятно",
      variant: "primary",
      onClick: onClose,
    }
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={userName}
      description="теперь в списке ваших контактов"
      descriptionColor="muted"
      iconSrc="/images/Check.svg"
      iconAlt="Успех"
      buttons={buttons}
      titleAlign="center"
      closeOnOverlayClick={true}
    />
  )
}