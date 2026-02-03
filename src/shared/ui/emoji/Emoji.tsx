import { memo, useMemo } from 'react'
import twemoji from 'twemoji'

interface EmojiProps {
    emoji: string
    size?: number // px
}

export const Emoji = memo(function Emoji({
    emoji,
    size = 24,
}: Readonly<EmojiProps>) {
    const html = useMemo(
        () =>
            twemoji.parse(emoji, {
                base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
                folder: 'svg',
                ext: '.svg',
            }),
        [emoji],
    )

    const style = useMemo(
        () => ({
            width: size,
            height: size,
            display: 'inline-flex' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flexShrink: 0,
        }),
        [size],
    )

    return (
        <span
            style={style}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
})
