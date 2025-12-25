'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { EmojiPickerWithCategories } from './EmojiPickerWithCategories'

export default function MessageComposer() {
    const handleEmojiSelect = (emoji: string) => {
        setInputValue(inputValue + emoji)
    }


    const [inputValue, setInputValue] = useState<string>('')

    useEffect(() => {
        console.log('inputValue', inputValue)

    }, [inputValue])

    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

    // Store timer ref to allow cancellation when user re-hovers before delay expires
    const timerRef = useRef<NodeJS.Timeout | null>(null)

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
            className=" px-4 py-3 flex items-center justify-between h-15 rounded-b-md border-t border-border bg-primary-background">
            {/* Attachment Icon */}
            <Image
                width="20"
                height="20"
                src="/images/messageComposer/Paperclip.svg"
                alt="paperclip icon"
                className="cursor-pointer"
                role="button"
            />

            {/* Message input field */}
            <div className="w-full flex items-center rounded-3xl px-4 py-2 mx-2 bg-white  justify-between ">
                <input
                    placeholder="Сообщение"
                    value={inputValue}
                    className="w-full focus:outline-0 placeholder:text-muted-foreground"
                    type="text"
                    onChange={(event) => setInputValue(
                        event.target.value,
                    )}
                />

                {/* Emoji picker trigger */}
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
            <button>
                <Image
                    width="20"
                    height="20"
                    src="/images/messageComposer/Microphone.svg"
                    alt="microphone icon for send voice message"
                    className="cursor-pointer"
                />
            </button>

        </div>
    )
}
