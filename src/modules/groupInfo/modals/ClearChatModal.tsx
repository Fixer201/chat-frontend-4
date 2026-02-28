// ClearChatModal.tsx
import { useState } from 'react'
import Modal from '@shared/ui/modal/Modal'
import type { ModalButtonConfig } from '@shared/ui/modal/Modal'

// Интерфейс пропсов для модального окна очистки чата
interface ClearChatModalProps {
    open: boolean // Флаг, открыто ли модальное окно
    onClose: () => void // Функция для закрытия модального окна
    onConfirm: (
        deleteForEveryone: boolean, // Параметр: удалять для всех или только для себя
    ) => void | Promise<void> // Функция, вызываемая при подтверждении
    groupName?: string // Название группы (не используется в этом компоненте, возможно, задел на будущее)
    loading?: boolean // Внешнее состояние загрузки (например, когда запрос уже идет от родителя)
}

export default function ClearChatModal({
    open,
    onClose,
    onConfirm,
    groupName = '',
    loading = false,
}: ClearChatModalProps) {
    // Внутреннее состояние для отслеживания процесса очистки, чтобы блокировать двойные нажатия
    const [isClearing, setIsClearing] = useState(false)
    // Состояние чекбокса "Удалить для всех"
    const [deleteForEveryone, setDeleteForEveryone] =
        useState(false) // По умолчанию false (удаляем только у себя)

    // Асинхронный обработчик подтверждения действия
    const handleConfirm = async () => {
        setIsClearing(true) // Блокируем кнопки на время выполнения
        try {
            // Вызываем переданную функцию подтверждения с текущим состоянием чекбокса
            await onConfirm(deleteForEveryone)
        } finally {
            // В любом случае (даже если была ошибка) снимаем блокировку
            setIsClearing(false)
        }
    }

    // Конфигурация кнопок для модального окна в формате, понятном компоненту Modal
    const buttons: ModalButtonConfig[] = [
        {
            label: 'Очистить', // Кнопка действия
            variant: 'ghost', // Стиль кнопки (возможно, прозрачная/контурная)
            color: 'light-gray', // Цвет кнопки (вероятно, серый для второстепенных действий)
            onClick: handleConfirm, // Обработчик клика
            loading: isClearing || loading, // Показывать лоадер, если идет внутренняя или внешняя загрузка
            disabled: isClearing || loading, // Блокировать в том же состоянии
        },
        {
            label: 'Отменить', // Кнопка отмены
            variant: 'solid', // Сплошная заливка (главная кнопка для отмены здесь)
            color: 'primary', // Основной цвет бренда
            onClick: onClose, // Просто закрываем окно
            disabled: isClearing || loading, // Блокируется, если идет процесс очистки
        },
    ]

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Очистить чат?" // Заголовок модального окна
            description="Все сообщения в этой группе будут удалены только для вас. Участники по-прежнему смогут их видеть" // Основной текст (дефолтный, для удаления только у себя)
            descriptionColor="muted" // Цвет описания (приглушенный)
            titleAlign="left" // Выравнивание заголовка
            iconAlt="Очистить чат" // Альтернативный текст для иконки (если есть)
            buttons={buttons} // Массив кнопок
            closeOnOverlayClick={!isClearing && !loading} // Можно ли закрыть кликом по фону (нельзя во время загрузки)
        >
            {/* Дочерние элементы Modal. Здесь размещается дополнительный UI */}
            {/* Кастомный чекбокс с галочкой */}
            <div className="mt-2 flex items-center gap-2">
                <input
                    type="checkbox"
                    id="deleteForEveryone"
                    checked={deleteForEveryone}
                    onChange={(e) =>
                        setDeleteForEveryone(
                            e.target.checked, // Обновляем состояние при изменении
                        )
                    }
                    // Кастомные стили для чекбокса в виде круглого переключателя с галочкой
                    className={`
                      relative h-6 w-6 cursor-pointer appearance-none
                      rounded-full border-2 border-accent-violet-primary
                      transition-colors
                      before:hidden
                      after:absolute after:top-0.75 after:left-1.75 after:hidden
                      after:h-3 after:w-1.5 after:rotate-45 after:border-t-0
                      after:border-r-2 after:border-b-2 after:border-l-0
                      after:border-white after:content-['']
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
