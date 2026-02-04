// TabContentPreview.tsx - упрощенная версия
'use client'

import React, { useState, useEffect } from 'react'
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
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const getPreviewComponent = () => {
        const commonProps = { isPreview: true }

        switch (activeTab) {
            case 'participants':
                return (
                    <ParticipantsContent {...commonProps} />
                )
            case 'media':
                return <MediaContent {...commonProps} />
            case 'files':
                return <FilesContent {...commonProps} />
            case 'voice':
                return <VoiceContent {...commonProps} />
            case 'links':
                return <LinksContent {...commonProps} />
            default:
                return null
        }
    }

    return (
        <div
            className={`
          transition-opacity duration-200
          ${visible ? `opacity-100` : `opacity-0`}
        `}
        >
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
        </div>
    )
}
