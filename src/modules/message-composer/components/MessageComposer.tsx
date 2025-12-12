'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'

export default function MessageComposer() {
    const handleEmojiSelect = (emoji: string) => {
        console.log('Selected emoji:', emoji)
        // Здесь будет логика вставки эмодзи в input
    }

    // создать стейт наведения на иконку
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const handleEmojiPickerOpen = () => {
        // если пикер уже открыт и есть запланированное закрытие, отменить его
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        // открываем пикер
        setIsEmojiPickerOpen(true)
    }

    // закрываем пикер с задержкой
    const handleEmojiPickerClose = () => {
        // создаём новый интервал
        timerRef.current = setTimeout(() => {
            setIsEmojiPickerOpen(false)
            // при закрытии пикера сбрасываем интервал
            timerRef.current = null
        }, 500)
    }

    return (
        <div
            className=" px-4 py-3 flex items-center justify-between h-[60px] rounded-b-md border-t border-border bg-primary-background">
            {/* Attachment Icon */}
            <Image
                width="20"
                height="20"
                src="/images/messageComposer/Paperclip.svg"
                alt="paperclip icon"
            />

            {/* Input field */}
            <div className="w-full flex items-center rounded-3xl px-4 py-2 mx-2 bg-white  justify-between ">
                {/* Input */}
                <input
                    placeholder="Сообщение"
                    className="w-full focus:outline-0 placeholder:text-muted-foreground"
                    type="text"
                />


                {/* Emoji Icon */}
                <div
                    className="relative h-full"
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
                        onMouseEnter={() => setIsEmojiPickerOpen(true)}
                    />
                    {isEmojiPickerOpen && (
                        <div className="absolute right-0 bottom-full mb-2 z-50">
                            <EmojiPickerWithCategories
                                onEmojiSelect={handleEmojiSelect}
                                className="w-full border border-gray-200 shadow-lg rounded-lg bg-white"
                                emojiSize={32}
                                emojisPerRow={11}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Voice record Icon(field empty) OR Send Message Icon(mobile only) */}
            <Image
                width="20"
                height="20"
                src="/images/messageComposer/Microphone.svg"
                alt="microphone icon for send voice message"
            />
        </div>
    )
}
