'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'

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
        <div className=" px-4 py-3 flex items-end justify-between h-fit max-h-[472] rounded-b-md border-t border-border bg-primary-background">
            {/* Attachment Icon */}
            <Image
                width={20}
                height={20}
                src="/images/messageComposer/Paperclip.svg"
                alt="paperclip icon"
                className="cursor-pointer mb-3"
                role="button"
            />

            {/* Message input field */}
            <div className="w-full flex items-end rounded-3xl h-auto  max-h-96 px-4 py-2 mx-2 bg-white-bg justify-between ">
                <textarea
                    ref={textareaRef}
                    placeholder="Сообщение"
                    value={inputValue}
                    onChange={(event) =>
                        setInputValue(event.target.value)
                    }
                    className="flex-1 h-auto max-h-96 focus:outline-0 placeholder:text-muted-foreground resize-none overflow-auto rounded-3xl px-2 py-1"
                    rows={1} // начальное количество строк
                />

                {/* Emoji picker trigger */}
                <button
                    className="relative mb-1.5"
                    onMouseEnter={handleEmojiPickerOpen}
                    onMouseLeave={handleEmojiPickerClose}
                    role="button"
                >
                    <Image
                        width="20"
                        height="20"
                        src="/images/messageComposer/Smile.svg"
                        alt="smile icon for emojies"
                        className="cursor-pointer"
                        onMouseEnter={() =>
                            setIsEmojiPickerOpen(true)
                        }
                    />
                    {isEmojiPickerOpen && (
                        <div className="absolute right-0 bottom-full mb-2 z-50">
                            <EmojiPickerWithCategories
                                onEmojiSelect={
                                    handleEmojiSelect
                                }
                                className="shadow-lg w-full h-full max-h-[50vh] min-h-[20vh] rounded-lg bg-white-bg"
                                emojiSize={32}
                                emojisPerRow={11}
                            />
                        </div>
                    )}
                </button>
            </div>

            {/* Voice record Icon(field empty) OR Send Message Icon(mobile only) */}
            <button>
                <Image
                    width="20"
                    height="20"
                    src="/images/messageComposer/Microphone.svg"
                    alt="microphone icon for send voice message"
                    className="cursor-pointer mb-3"
                />
            </button>
        </div>
    )
}
