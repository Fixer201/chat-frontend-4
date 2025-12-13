import React from 'react'
import { EmojiRowProps } from '@shared/types/Emoji'


function EmojiRow({ emojis, gridStyle, buttonStyle }: Readonly<EmojiRowProps>) {
    return (
        <div style={gridStyle} className="justify-center">
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    data-emoji={emoji}
                    className="flex items-center justify-center hover:bg-gray-200 rounded-md transition-colors active:scale-95 select-none"
                    style={buttonStyle}
                    type="button"
                >
                    {emoji}
                </button>
            ))}
        </div>
    )
}

export default EmojiRow

