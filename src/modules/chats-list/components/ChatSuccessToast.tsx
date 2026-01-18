// Тост (уведомление) об успешном добавлении в контакты
'use client'

import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'
import { useEffect } from 'react'

// Интерфейс пропсов компонента ChatSuccessToast
interface ChatSuccessToastProps {
    open: boolean // Флаг открытия тоста
    onClose: () => void // Функция закрытия тоста
    userName: string // Имя пользователя, добавленного в контакты
    autoCloseDelay?: number // Задержка автоматического закрытия (в миллисекундах)
}

// Компонент тоста (уведомления) об успешном добавлении в контакты
export default function ChatSuccessToast({
    open,
    onClose,
    userName,
    autoCloseDelay = 3000, // Значение по умолчанию - 3 секунды
}: ChatSuccessToastProps) {
    // Эффект для автоматического закрытия тоста через указанное время
    useEffect(() => {
        if (open && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, autoCloseDelay)

            return () => clearTimeout(timer) // Очистка таймера при размонтировании или изменении зависимостей
        }
    }, [open, onClose, autoCloseDelay])

    // Конфигурация кнопок модального окна (тоста)
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Понятно',
            variant: 'primary',
            onClick: onClose, // Закрытие тоста при клике
        },
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
            titleAlign="center" // Выравнивание заголовка по центру
            closeOnOverlayClick={true} // Закрытие при клике на оверлей
        />
    )
}
