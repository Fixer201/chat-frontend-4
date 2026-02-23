'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { transformFiles } from '@shared/lib/fileUtils'
import type { BaseFile, MockFile } from '@shared/types/file'
import {
    loadGroupMedia,
    initGroupMedia,
} from '@shared/lib/localStorageGroupMedia'

// Моковые данные для инициализации
const DEFAULT_MOCK_MEDIA: MockFile[] = [
    { url: '/images/infoMediaImages/infoMediaImage1.png' },
    { url: '/images/infoMediaImages/infoMediaImage2.png' },
    { url: '/images/infoMediaImages/infoMediaImage3.png' },
    { url: '/images/infoMediaImages/infoMediaImage4.png' },
    { url: '/images/infoMediaImages/infoMediaImage5.png' },
    { url: '/images/infoMediaImages/infoMediaImage6.png' },
    { url: '/images/infoMediaImages/infoMediaImage7.png' },
    { url: '/images/infoMediaImages/infoMediaImage8.png' },
]

interface MediaContentProps {
    chatUid: string
}

export default function MediaContent({
    chatUid,
}: MediaContentProps) {
    const [visible, setVisible] = useState(false)
    const [mediaItems, setMediaItems] = useState<
        BaseFile[]
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        loadMedia()
        return () => clearTimeout(t)
    }, [chatUid])

    const loadMedia = async () => {
        setLoading(true)
        try {
            let mediaData = loadGroupMedia(chatUid)
            if (!mediaData) {
                mediaData = initGroupMedia(
                    chatUid,
                    DEFAULT_MOCK_MEDIA,
                )
            }
            const transformedFiles = transformFiles(
                mediaData.results,
                'mock',
            )
            const imageFiles = transformedFiles.filter(
                (file) => file.type === 'image',
            )
            setMediaItems(imageFiles)
        } catch (error) {
            console.error('Ошибка загрузки медиа:', error)
            const transformedFiles = transformFiles(
                DEFAULT_MOCK_MEDIA,
                'mock',
            )
            const imageFiles = transformedFiles.filter(
                (file) => file.type === 'image',
            )
            setMediaItems(imageFiles)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка медиа...
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
            <div className="grid grid-cols-3 gap-0.5 px-1 py-2">
                {mediaItems.map((item) => (
                    <div
                        key={item.id}
                        className={`
                          flex h-full w-full items-center justify-center
                        `}
                    >
                        {item.type === 'image' &&
                            item.url && (
                                <Image
                                    src={item.url}
                                    alt={`Media item ${item.id}`}
                                    width={120}
                                    height={120}
                                />
                            )}
                        {(!item.url || item.url === '') && (
                            <div
                                className={`
                                  flex h-30 w-30 items-center justify-center
                                  bg-gray-main text-xs text-text-gray
                                `}
                            >
                                No URL
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {mediaItems.length === 0 && (
                <div className="p-8 text-center text-text-gray">
                    Изображения не найдены
                </div>
            )}
        </div>
    )
}
