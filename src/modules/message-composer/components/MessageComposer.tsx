'use client'

import Image from 'next/image'
import Smile from '@public/icons/messageComposer/Smile.svg'
import { useEffect, useRef, useState } from 'react'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'
import { cn } from '@lib/utils'

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

export default function MessageComposer() {
    const [inputValue, setInputValue] = useState<string>('')
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] =
        useState(false)
    // Store timer ref to allow cancellation when user re-hovers before delay expires
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const textareaRef = useAutoResizeTextarea(inputValue)

    // Функция отправки сообщения
    const handleSendMessage = () => {
        if (inputValue.trim().length === 0) return

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
              border-t border-gray-border bg-gray-light px-4 py-3
            `}
        >
            {/* Attachment Icon */}
            <Image
                width={25}
                height={25}
                src="/icons/messageComposer/Paperclip.svg"
                alt="paperclip icon"
                className="mb-3 cursor-pointer"
                role="button"
            />

            {/* Message input field */}
            <div
                className={`
                  relative mx-2 flex h-full max-h-96 w-full items-center
                  justify-between rounded-3xl bg-white-bg px-2 py-3
                `}
            >
                <textarea
                    ref={textareaRef}
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
                    className="absolute right-4 bottom-2 mb-1.5"
                    onMouseEnter={handleEmojiPickerOpen}
                    onMouseLeave={handleEmojiPickerClose}
                >
                    <Smile
                        width={20}
                        height={20}
                        src="/icons/messageComposer/Smile.svg"
                        alt="smile icon for emojies"
                        className={cn(
                            'cursor-pointer fill-text-gray',
                            isEmojiPickerOpen &&
                                'fill-accent-violet-primary',
                        )}
                        onMouseEnter={() =>
                            setIsEmojiPickerOpen(true)
                        }
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
            <button className="relative mb-2 h-8 w-8">
                {inputValue.length > 0 ? (
                    <Image
                        onClick={handleSendMessage}
                        fill
                        src="/icons/messageComposer/SendMessage.svg"
                        alt="send message button"
                        className="cursor-pointer object-contain"
                    />
                ) : (
                    <Image
                        fill
                        src="/icons/messageComposer/Microphone.svg"
                        alt="microphone icon for send voice message"
                        className="cursor-pointer object-contain"
                    />
                )}
            </button>
        </div>
    )
}
