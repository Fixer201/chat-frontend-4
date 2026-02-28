// LinksContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { transformLinks } from '@shared/lib/linkUtils' // Трансформация ссылок в BaseLink
import type { BaseLink, MockLink } from '@shared/types/link' // Типы ссылок
import {
    loadGroupLinks, // Загрузка ссылок группы из localStorage
    initGroupLinks, // Инициализация ссылок группы
} from '@shared/lib/localStorageGroupLinks'

// Дефолтные моковые ссылки
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

// Интерфейс пропсов
interface LinksContentProps {
    chatUid: string // ID чата/группы
}

export default function LinksContent({
    chatUid,
}: LinksContentProps) {
    // Состояние для плавного появления
    const [visible, setVisible] = useState(false)
    // Состояние со списком ссылок
    const [linksState, setLinksState] = useState<
        BaseLink[]
    >([])
    // Состояние загрузки
    const [loading, setLoading] = useState(true)

    // Эффект при монтировании или смене чата
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10) // Плавное появление
        loadLinks()
        return () => clearTimeout(t) // Очистка таймера
    }, [chatUid])

    // Загрузка ссылок из localStorage
    const loadLinks = async () => {
        setLoading(true)
        try {
            let linksData = loadGroupLinks(chatUid)
            if (!linksData) {
                // Если нет данных - инициализируем моковыми
                linksData = initGroupLinks(
                    chatUid,
                    DEFAULT_MOCK_LINKS,
                )
            }
            // Трансформируем в формат для отображения
            const transformedLinks = transformLinks(
                linksData.results,
                'mock',
            )
            setLinksState(transformedLinks)
        } catch (error) {
            console.error('Ошибка загрузки ссылок:', error)
            // При ошибке используем моковые данные
            const transformedLinks = transformLinks(
                DEFAULT_MOCK_LINKS,
                'mock',
            )
            setLinksState(transformedLinks)
        } finally {
            setLoading(false)
        }
    }

    // Открытие ссылки в новой вкладке
    const handleOpenLink = (url: string) => {
        window.open(url, '_blank')
    }

    // Копирование ссылки в буфер обмена
    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    // Состояние загрузки
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
                        className={`
                          group border-b border-gray-border p-1
                          transition-colors
                        `}
                    >
                        <div className="flex items-center gap-3">
                            {/* Аватар отправителя с инициалами */}
                            <div
                                className={`
                                  flex h-12 w-12 items-center justify-center
                                  rounded-lg bg-accent-violet-primary text-3xl
                                  font-bold text-white
                                `}
                            >
                                {link.senderInitials ||
                                    link.sender
                                        .charAt(0)
                                        .toUpperCase()}{' '}
                                {/* Инициалы или первая буква имени */}
                            </div>

                            {/* Информация о ссылке */}
                            <div
                                className={`
                                  min-w-0 flex-1 flex-col justify-between
                                `}
                            >
                                {/* Заголовок ссылки */}
                                <h4
                                    className={`
                                      mb-0.5 font-medium text-text-black
                                    `}
                                >
                                    {link.title}
                                </h4>
                                {/* URL ссылки (синий цвет) */}
                                <p
                                    className={`
                                      mb-0.5 truncate text-sm text-system-blue
                                    `}
                                >
                                    {link.url}
                                </p>
                                {/* Метаданные: отправитель и дата */}
                                <div
                                    className={`
                                      flex items-center text-sm text-text-gray
                                    `}
                                >
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
