'use client'

import { useState, useEffect } from 'react'
import { transformLinks } from '@shared/lib/linkUtils'
import type { BaseLink, MockLink } from '@shared/types/link'
import {
    loadGroupLinks,
    initGroupLinks,
} from '@shared/lib/localStorageGroupLinks'

const DEFAULT_MOCK_LINKS: MockLink[] = [
    { url: 'https://figma.com/file/project-design' },
    { url: 'https://docs.api.example.com' },
    { url: 'https://medium.com/ui-ux-tips' },
    { url: 'https://github.com/project-repo' },
    { url: 'https://drive.google.com/folder' },
    { url: 'https://jira.company.com/board' },
    { url: 'https://docs.google.com/spreadsheets' },
    { url: 'https://zoom.us/j/meeting-id' },
    { url: 'https://mockup.com/project' },
    { url: 'https://trello.com/b/project-checklist' },
]

interface LinksContentProps {
    chatUid: string
}

export default function LinksContent({
    chatUid,
}: LinksContentProps) {
    const [visible, setVisible] = useState(false)
    const [linksState, setLinksState] = useState<
        BaseLink[]
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        loadLinks()
        return () => clearTimeout(t)
    }, [chatUid])

    const loadLinks = async () => {
        setLoading(true)
        try {
            let linksData = loadGroupLinks(chatUid)
            if (!linksData) {
                linksData = initGroupLinks(
                    chatUid,
                    DEFAULT_MOCK_LINKS,
                )
            }
            const transformedLinks = transformLinks(
                linksData.results,
                'mock',
            )
            setLinksState(transformedLinks)
        } catch (error) {
            console.error('Ошибка загрузки ссылок:', error)
            const transformedLinks = transformLinks(
                DEFAULT_MOCK_LINKS,
                'mock',
            )
            setLinksState(transformedLinks)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank')
    }

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка ссылок...
                </div>
            </div>
        )
    }

    return (
        <div
            className={`
      transition-opacity duration-200
      ${visible ? 'opacity-100' : 'opacity-0'}
    `}
        >
            <div className="space-y-0">
                {linksState.map((link) => (
                    <div
                        key={link.id}
                        className="group border-b border-gray-border p-1 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`
                flex h-12 w-12 items-center justify-center rounded-lg
                bg-accent-violet-primary text-3xl font-bold text-white
              `}
                            >
                                {link.senderInitials ||
                                    link.sender
                                        .charAt(0)
                                        .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 flex-col justify-between">
                                <h4 className="mb-0.5 font-medium text-text-black">
                                    {link.title}
                                </h4>
                                <p className="mb-0.5 truncate text-sm text-blue-500">
                                    {link.url}
                                </p>
                                <div className="flex items-center text-sm text-text-gray">
                                    <span className="truncate">
                                        {link.sender}
                                    </span>
                                    <span className="mx-2">
                                        •
                                    </span>
                                    <span>{link.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
