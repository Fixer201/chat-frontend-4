// TabContentPreview.tsx
'use client'

import React from 'react'
import ParticipantsContent from './tabs/ParticipantsContent' // Контент вкладки "Участники"
import MediaContent from './tabs/MediaContent' // Контент вкладки "Медиа"
import FilesContent from './tabs/FilesContent' // Контент вкладки "Файлы"
import VoiceContent from './tabs/VoiceContent' // Контент вкладки "Голосовые"
import LinksContent from './tabs/LinksContent' // Контент вкладки "Ссылки"

// Типы для вкладок (аналогично основным компонентам)
type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

// Интерфейс пропсов компонента предпросмотра
interface TabContentPreviewProps {
    activeTab: TabId // Активная вкладка
    chatKey: string // Ключ чата (для участников)
    chatUid: string // UID чата (для медиа, файлов и т.д.)
    onParticipantsChange?: (count: number) => void // Колбэк при изменении количества участников
    onOwnerChanged?: () => void
}

export default function TabContentPreview({
    activeTab,
    chatKey,
    chatUid,
    onParticipantsChange,
    onOwnerChanged,
}: TabContentPreviewProps) {
    // Функция, возвращающая соответствующий компонент в зависимости от activeTab
    const getPreviewComponent = () => {
        switch (activeTab) {
            case 'participants':
                return (
                    <ParticipantsContent
                        chatKey={chatKey}
                        onParticipantsChange={
                            onParticipantsChange // Пробрасываем колбэк для обновления счётчика
                        }
                        // Не передаём onTitleChange и isCurrentUserOwner, так как это предпросмотр
                        onOwnerChanged={onOwnerChanged}
                    />
                )
            case 'media':
                return <MediaContent chatUid={chatUid} />
            case 'files':
                return <FilesContent chatUid={chatUid} />
            case 'voice':
                return <VoiceContent chatUid={chatUid} />
            case 'links':
                return <LinksContent chatUid={chatUid} />
            default:
                return null
        }
    }

    return (
        // Контейнер с ограничением по высоте и скрытием переполнения
        <div className="relative h-full max-h-full overflow-hidden">
            {getPreviewComponent()}
        </div>
    )
}
