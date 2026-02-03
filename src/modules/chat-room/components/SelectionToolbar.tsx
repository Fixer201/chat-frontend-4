'use client'

import Image from 'next/image'
import { Message } from '@shared/types/message'

/**
 * Панель инструментов режима выбора — заменяет MessageComposer
 * в нижней части ChatRoom, когда выбрано одно или более сообщений.
 *
 * Отображает количество выбранных сообщений и кнопки действий:
 * Переслать, Скопировать, Удалить. Кнопка «×» сбрасывает выделение
 * и возвращает обычный режим работы с полем ввода.
 */
interface SelectionToolbarProps {
    selectedMessages: Message[]
    /** Сброс выделения: возврат к обычному режиму */
    onClose: () => void
    onForward: () => void
    onCopy: () => void
    onDelete: () => void
}

/**
 * Склонение слова «сообщение» по правилам русского языка.
 * Учитывает особые случаи: 11-14 → «сообщений» (не «сообщение/сообщения»),
 * так как числительные 11-14 не подчиняются стандартному правилу mod10.
 */
function pluralizeMessages(count: number): string {
    const mod10 = count % 10
    const mod100 = count % 100

    // Числа 11-14 — исключение: всегда «сообщений» (одиннадцать сообщений)
    if (mod100 >= 11 && mod100 <= 14) return 'сообщений'
    if (mod10 === 1) return 'сообщение'
    if (mod10 >= 2 && mod10 <= 4) return 'сообщения'
    return 'сообщений'
}

export default function SelectionToolbar({
    selectedMessages,
    onClose,
    onForward,
    onCopy,
    onDelete,
}: SelectionToolbarProps) {
    if (selectedMessages.length === 0) return null

    const count = selectedMessages.length

    return (
        <div
            className={`
              flex items-center justify-between border-t border-gray-border
              bg-gray-light px-4 py-3
            `}
        >
            <div className="flex items-center gap-3">
                {/* Кнопка сброса выделения: cursor-pointer + hover для визуальной обратной связи */}
                <button
                    type="button"
                    onClick={onClose}
                    className={`
                      cursor-pointer rounded-lg p-1 text-text-gray
                      transition-colors
                      hover:bg-gray-main hover:text-text-black
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-95
                    `}
                >
                    <Image
                        src="/images/search/iconsClose.svg"
                        alt="Закрыть"
                        width={20}
                        height={20}
                    />
                </button>
                <span className="text-sm font-medium text-text-black">
                    Выбрано {count}{' '}
                    {pluralizeMessages(count)}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Кнопка пересылки: cursor-pointer + hover-подсветка + scale при нажатии */}
                <button
                    type="button"
                    onClick={onForward}
                    className={`
                      relative h-6 w-6 cursor-pointer rounded-md
                      transition-transform
                      hover:opacity-70
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-90
                    `}
                >
                    <Image
                        src="/icons/message/Forward.svg"
                        alt="Переслать"
                        fill
                        className="object-contain"
                    />
                </button>
                {/* Кнопка копирования */}
                <button
                    type="button"
                    onClick={onCopy}
                    className={`
                      relative h-6 w-6 cursor-pointer rounded-md
                      transition-transform
                      hover:opacity-70
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-90
                    `}
                >
                    <Image
                        src="/icons/message/Copy.svg"
                        alt="Скопировать"
                        fill
                        className="object-contain"
                    />
                </button>
                {/* Кнопка удаления */}
                <button
                    type="button"
                    onClick={onDelete}
                    className={`
                      relative h-6 w-6 cursor-pointer rounded-md
                      transition-transform
                      hover:opacity-70
                      focus-visible:outline-2
                      focus-visible:outline-accent-violet-primary
                      active:scale-90
                    `}
                >
                    <Image
                        src="/icons/message/Delete.svg"
                        alt="Удалить"
                        fill
                        className="object-contain"
                    />
                </button>
            </div>
        </div>
    )
}
