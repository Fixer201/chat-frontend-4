import React from 'react'
import { EmojiRowProps } from '@shared/types/Emoji'
import { Emoji } from '@shared/ui/emoji/Emoji'

function EmojiRow({
    emojis,
    gridStyle,
    buttonStyle,
}: Readonly<EmojiRowProps>) {
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
                    <Emoji emoji={emoji} size={32} />
                </button>
            ))}
        </div>
    )
}

export default EmojiRow
