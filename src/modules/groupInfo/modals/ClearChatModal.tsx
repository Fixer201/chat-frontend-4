// ClearChatModal.tsx
import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

interface ClearChatModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (
        deleteForEveryone: boolean,
    ) => void | Promise<void>
    groupName?: string
    loading?: boolean
}

export default function ClearChatModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: ClearChatModalProps) {
    const [isClearing, setIsClearing] = useState(false)
    const [deleteForEveryone, setDeleteForEveryone] =
        useState(false)

    const handleConfirm = async () => {
        setIsClearing(true)
        try {
            await onConfirm(deleteForEveryone)
        } finally {
            setIsClearing(false)
        }
    }

    const buttons: ModalButtonConfig[] = [
        {
            label: 'Очистить',
            variant: 'ghost',
            color: 'light-gray',
            onClick: handleConfirm,
            loading: isClearing || loading,
            disabled: isClearing || loading,
        },
        {
            label: 'Отменить',
            variant: 'solid',
            color: 'primary',
            onClick: onClose,
            disabled: isClearing || loading,
        },
    ]

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Очистить чат?"
            description="Все сообщения в этой группе будут удалены только для вас. Участники по-прежнему смогут их видеть"
            descriptionColor="muted"
            titleAlign="left"
            iconAlt="Очистить чат"
            buttons={buttons}
            closeOnOverlayClick={!isClearing && !loading}
        >
            {/* Кастомный чекбокс с галочкой */}
            <div className="mt-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    id="deleteForEveryone"
                    checked={deleteForEveryone}
                    onChange={(e) =>
                        setDeleteForEveryone(
                            e.target.checked,
                        )
                    }
                    className={`
                      relative h-6 w-6 cursor-pointer appearance-none
                      rounded-full border-2 border-accent-violet-primary
                      transition-colors
                      before:hidden
                      after:absolute after:top-[3px] after:left-[7px]
                      after:hidden after:h-[12px] after:w-[6px] after:rotate-45
                      after:border-t-0 after:border-r-2 after:border-b-2
                      after:border-l-0 after:border-white after:content-['']
                      checked:border-accent-violet-primary
                      checked:bg-accent-violet-primary checked:after:block
                      focus:ring-2 focus:ring-accent-violet-light
                      focus:outline-none
                    `}
                />
                <label
                    htmlFor="deleteForEveryone"
                    className={`
                      cursor-pointer text-base text-text-black select-none
                    `}
                >
                    Удалить для всех
                </label>
            </div>
        </Modal>
    )
}
