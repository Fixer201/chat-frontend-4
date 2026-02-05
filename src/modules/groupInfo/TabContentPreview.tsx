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
}

export default function TabContentPreview({
    activeTab,
}: TabContentPreviewProps) {
    const getPreviewComponent = () => {
        switch (activeTab) {
            case 'participants':
                return <ParticipantsContent />
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
        <div className="relative max-h-48 overflow-hidden">
            {getPreviewComponent()}
            {/* Градиент для указания на продолжение */}
            <div
                className={`
              pointer-events-none absolute right-0 bottom-0 left-0 h-12
              bg-gradient-to-t from-white-bg to-transparent
            `}
            ></div>
        </div>
    )
}
