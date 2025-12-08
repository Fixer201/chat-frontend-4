'use client'

import Image from 'next/image'

export default function MessageComposer() {
    return (
        <div className=" px-4 py-3 flex items-center justify-between h-[60px] rounded-b-md border-t border-border bg-primary-background">
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
                <Image
                    width="20"
                    height="20"
                    src="/images/messageComposer/Smile.svg"
                    alt="smile icon for emojies"
                />
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
