import React, { memo } from 'react'
import { EmojiRowProps } from '@shared/types/Emoji'
import { Emoji } from '@shared/ui/emoji/Emoji'

const EmojiRow = memo(function EmojiRow({
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
                    className={`
                      flex items-center justify-center rounded-md
                      transition-colors select-none
                      hover:bg-gray-200
                      active:scale-95
                    `}
                    tabIndex={1}
                    style={buttonStyle}
                >
                    <Emoji emoji={emoji} size={32} />
                </button>
            ))}
        </div>
    )
})

export default EmojiRow
