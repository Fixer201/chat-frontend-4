'use client'

import React from 'react'
import ParticipantsContent from './tabs/ParticipantsContent'
import MediaContent from './tabs/MediaContent'
import FilesContent from './tabs/FilesContent'
import VoiceContent from './tabs/VoiceContent'
import LinksContent from './tabs/LinksContent'

type TabId =
    | 'participants'
    | 'media'
    | 'files'
    | 'voice'
    | 'links'

interface TabContentPreviewProps {
    activeTab: TabId
    chatKey: string
    chatUid: string
    onParticipantsChange?: (count: number) => void
}

export default function TabContentPreview({
    activeTab,
    chatKey,
    chatUid,
    onParticipantsChange,
}: TabContentPreviewProps) {
    const getPreviewComponent = () => {
        switch (activeTab) {
            case 'participants':
                return (
                    <ParticipantsContent
                        chatKey={chatKey}
                        onParticipantsChange={
                            onParticipantsChange
                        }
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
        <div className="relative h-full max-h-full overflow-hidden">
            {getPreviewComponent()}
        </div>
    )
}
