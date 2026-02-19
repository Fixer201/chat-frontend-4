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
}

export default function TabContentPreview({
    activeTab,
    chatKey
}: TabContentPreviewProps) {
    const getPreviewComponent = () => {
        switch (activeTab) {
            case 'participants':
                return <ParticipantsContent chatKey={chatKey}/>
            case 'media':
                return <MediaContent />
            case 'files':
                return <FilesContent />
            case 'voice':
                return <VoiceContent />
            case 'links':
                return <LinksContent />
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