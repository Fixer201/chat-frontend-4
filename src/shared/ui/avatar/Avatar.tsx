'use client'
import { ContactAvatar, ContactAvatarProps } from './components/ContactAvatar'
import { SelectContactAvatar, SelectContactAvatarProps } from './components/SelectContactAvatar'
import { ChatAvatar, ChatAvatarProps } from './components/ChatAvatar'
import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

export type AvatarMode =
    | 'contact'
    | 'select-contact'
    | 'chat'

export interface AvatarProps
    extends HTMLAttributes<HTMLDivElement> {
    src: string
    alt?: string
    name: string
    mode?: AvatarMode
    statusText?: string
    messagePreview?: string
    timestamp?: string
    unreadCount?: number
    isOnline?: boolean
    selected?: boolean
    rightElement?: React.ReactNode
    className?: string
    notificationsEnabled?: boolean
    messageStatus?: 'sent' | 'delivered' | 'read' | null
}

export const Avatar = forwardRef<
    HTMLDivElement,
    AvatarProps
>(
    (
        {
            mode = 'contact',
            ...props
        },
        ref,
    ) => {
        switch (mode) {
            case 'contact':
                return <ContactAvatar ref={ref} {...props as ContactAvatarProps} />
            case 'select-contact':
                return <SelectContactAvatar ref={ref} {...props as SelectContactAvatarProps} />
            case 'chat':
                return <ChatAvatar ref={ref} {...props as ChatAvatarProps} />
            default:
                return <ContactAvatar ref={ref} {...props as ContactAvatarProps} />
        }
    }
)

Avatar.displayName = 'Avatar'

// Пример использования:
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="contact" statusText="в сети" />
// <Avatar src="/images/user/image.svg" name="Влад Ляшев" mode="select-contact" statusText="был(а) только что" selected />
// <Avatar src="/images/user/image.svg" name="Алексей Митрофанов" mode="chat" messagePreview="Мурка по утрам..." timestamp="ПН" unreadCount={56} />
