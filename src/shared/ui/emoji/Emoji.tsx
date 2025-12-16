import twemoji from 'twemoji'

interface EmojiProps {
    emoji: string
    size?: number // px
}

export function Emoji({
    emoji,
    size = 24,
}: Readonly<EmojiProps>) {
    const html = twemoji.parse(emoji, {
        folder: 'svg',
        ext: '.svg',
    })

    return (
        <span
            style={{
                width: size,
                height: size,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
