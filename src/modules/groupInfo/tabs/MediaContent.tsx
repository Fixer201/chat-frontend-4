// MediaContent.tsx
'use client'

import Image from 'next/image' // Компонент Next.js для оптимизированных изображений
import { useState, useEffect } from 'react'
import { transformFiles } from '@shared/lib/fileUtils' // Трансформация файлов
import type { BaseFile, MockFile } from '@shared/types/file' // Типы файлов
import {
    loadGroupMedia, // Загрузка медиа группы из localStorage
    initGroupMedia, // Инициализация медиа группы
} from '@shared/lib/localStorageGroupMedia'

// Моковые данные для инициализации (изображения)
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

// Интерфейс пропсов
interface MediaContentProps {
    chatUid: string // ID чата/группы
}

export default function MediaContent({
    chatUid,
}: MediaContentProps) {
    // Состояние для плавного появления
    const [visible, setVisible] = useState(false)
    // Состояние с медиа-файлами
    const [mediaItems, setMediaItems] = useState<
        BaseFile[]
    >([])
    // Состояние загрузки
    const [loading, setLoading] = useState(true)

    // Эффект при монтировании или смене чата
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10) // Плавное появление
        loadMedia()
        return () => clearTimeout(t) // Очистка таймера
    }, [chatUid])

    // Загрузка медиа из localStorage
    const loadMedia = async () => {
        setLoading(true)
        try {
            let mediaData = loadGroupMedia(chatUid)
            if (!mediaData) {
                // Если нет данных - инициализируем моковыми
                mediaData = initGroupMedia(
                    chatUid,
                    DEFAULT_MOCK_MEDIA,
                )
            }
            // Трансформируем все файлы
            const transformedFiles = transformFiles(
                mediaData.results,
                'mock',
            )
            // Фильтруем только изображения
            const imageFiles = transformedFiles.filter(
                (file) => file.type === 'image',
            )
            setMediaItems(imageFiles)
        } catch (error) {
            console.error('Ошибка загрузки медиа:', error)
            // При ошибке используем моковые данные
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

    // Состояние загрузки
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
            {/* Сетка изображений 3 колонки */}
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
                                // Оптимизированное изображение через Next/Image
                                <Image
                                    src={item.url}
                                    alt={`Media item ${item.id}`}
                                    width={120}
                                    height={120}
                                />
                            )}
                        {/* Заглушка, если нет URL */}
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

            {/* Сообщение, если нет изображений */}
            {mediaItems.length === 0 && (
                <div className="p-8 text-center text-text-gray">
                    Изображения не найдены
                </div>
            )}
        </div>
    )
}
