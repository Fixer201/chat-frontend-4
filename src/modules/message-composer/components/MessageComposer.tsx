'use client'

import Image from 'next/image'
import Smile from '@public/icons/messageComposer/Smile.svg'
import { useEffect, useRef, useState } from 'react'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'
import { cn } from '@shared/lib/utils'
import { useWebSocket } from '@shared/context/websocketContext'

type MessageComposerProps = {
    chatKey: string
    toUserId: string
}

// Хук для авто-роста textarea
function useAutoResizeTextarea(value: string) {
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Сбрасываем высоту перед измерением
        el.style.height = 'auto'

        // Ограничение по maxHeight
        const maxHeight = 472 // px, как в Figma
        el.style.height =
            Math.min(el.scrollHeight, maxHeight) + 'px'
    }, [value])

    return ref
}

export default function MessageComposer({
    chatKey,
    toUserId,
}: Readonly<MessageComposerProps>) {
    // Текст сообщения в инпуте
    const [inputValue, setInputValue] = useState<string>('')

    // Флаг состояние открытия пикера эмодзи
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] =
        useState(false)

    // Store timer ref to allow cancellation when user re-hovers before delay expires
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const textareaRef = useAutoResizeTextarea(inputValue)

    // получаем данные из контекста
    const { sendMessage, status } = useWebSocket()

    // Функция отправки сообщения
    const handleSendMessage = () => {
        if (inputValue.trim().length === 0) return

        sendMessage({
            chatKey: chatKey,
            content: inputValue,
            toUserId: toUserId,
            status: 'publish',
        })

        console.log('Отправка сообщения:', inputValue)

        // Очищаем поле после отправки
        setInputValue('')
    }

    // Обработчик нажатия клавиш
    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        // Проверяем, что нажат Enter без Shift
        if (event.key === 'Enter' && !event.shiftKey) {
            // Игнорируем, если открыто окно ввода (IME), например, для иероглифов
            if (event.nativeEvent.isComposing) return

            event.preventDefault() // Предотвращаем перенос строки
            handleSendMessage()
        }
    }

    const handleEmojiSelect = (emoji: string) => {
        setInputValue(inputValue + emoji)
    }

    const handleEmojiPickerOpen = () => {
        // Cancel pending close if user re-hovers before delay
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        setIsEmojiPickerOpen(true)
    }

    const handleEmojiPickerClose = () => {
        // Delay closing to allow moving mouse to the picker itself
        timerRef.current = setTimeout(() => {
            setIsEmojiPickerOpen(false)
            timerRef.current = null
        }, 500)
    }

    return (
        <div
            className={`
              flex h-fit max-h-[472] items-end justify-between rounded-b-md
              border-t border-gray-border bg-gray-light px-2 py-3
              md:px-4
            `}
        >
            {/* Attachment Icon */}
            <button
                aria-label="Attach file"
                type="button"
                className="mb-3"
            >
                <Image
                    width={25}
                    height={25}
                    src="/icons/messageComposer/Paperclip.svg"
                    alt=""
                    className="cursor-pointer"
                />
            </button>

            {/* Message input field */}
            <div
                className={`
                  relative mx-1 flex h-full max-h-96 w-full items-center
                  justify-between rounded-3xl bg-white-bg px-2 py-3
                  md:mx-2
                `}
            >
                <textarea
                    ref={textareaRef}
                    name="message"
                    aria-label="Message input"
                    placeholder="Сообщение"
                    value={inputValue}
                    onKeyDown={handleKeyDown}
                    onChange={(event) =>
                        setInputValue(event.target.value)
                    }
                    className={`
                      h-auto max-h-80 flex-1 resize-none rounded-3xl pr-8 pl-2
                      placeholder:text-text-gray
                      focus:outline-0
                    `}
                    rows={1} // начальное количество строк
                />

                {/* Emoji picker trigger */}
                <button
                    type="button"
                    aria-label="Open emoji picker"
                    className="absolute right-4 bottom-2 mb-1.5"
                    onMouseEnter={handleEmojiPickerOpen}
                    onMouseLeave={handleEmojiPickerClose}
                    onFocus={handleEmojiPickerOpen}
                    onBlur={handleEmojiPickerClose}
                >
                    <Smile
                        width={20}
                        height={20}
                        src="/icons/messageComposer/Smile.svg"
                        alt=""
                        className={cn(
                            'cursor-pointer fill-text-gray',
                            isEmojiPickerOpen &&
                                'fill-accent-violet-primary',
                        )}
                    />
                    {isEmojiPickerOpen && (
                        <div className="absolute right-0 bottom-full z-50 mb-2">
                            <EmojiPickerWithCategories
                                onEmojiSelect={
                                    handleEmojiSelect
                                }
                                className={`
                                  h-full max-h-[50vh] min-h-[20vh] w-full
                                  rounded-lg bg-white-bg shadow-lg
                                `}
                                emojiSize={32}
                                emojisPerRow={11}
                            />
                        </div>
                    )}
                </button>
            </div>

            {/* Voice record Icon(field empty) OR Send Message Icon(mobile only) */}
            <button
                type="button"
                aria-label={
                    inputValue.length > 0
                        ? 'Send message'
                        : 'Record voice message'
                }
                onClick={
                    inputValue.length > 0
                        ? handleSendMessage
                        : undefined
                }
                className="relative mb-2 h-8 w-8"
            >
                {inputValue.length > 0 ? (
                    <Image
                        fill
                        src="/icons/messageComposer/SendMessage.svg"
                        alt=""
                        className="cursor-pointer object-contain"
                    />
                ) : (
                    <Image
                        fill
                        src="/icons/messageComposer/Microphone.svg"
                        alt=""
                        className="cursor-pointer object-contain"
                    />
                )}
            </button>
        </div>
    )
}
