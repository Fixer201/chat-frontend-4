import React, { memo } from 'react'
import { EmojiRowProps } from '@shared/types/Emoji'
import { Emoji } from '@shared/ui/emoji/Emoji'

/**
 * Одна строка эмодзи в виртуализированном списке.
 *
 * Обёрнута в React.memo — перерисовывается только при изменении массива emojis
 * или стилей. Атрибут data-emoji на кнопке используется для делегирования
 * событий: обработчик клика находится на контейнере EmojiPickerWithCategories,
 * а не на каждой кнопке (снижает кол-во подписок с ~1800 до 1).
 */
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
                      flex cursor-pointer items-center justify-center rounded-md
                      transition-colors select-none
                      hover:bg-gray-main
                      active:scale-95
                    `}
                    tabIndex={-1}
                    style={buttonStyle}
                >
                    <Emoji emoji={emoji} size={32} />
                </button>
            ))}
        </div>
    )
})

export default EmojiRow
