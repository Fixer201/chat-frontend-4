'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { transformFiles } from '../../../shared/lib/fileUtils'
import type { BaseFile, MockFile } from '@shared/types/file'

export default function MediaContent() {
    const [visible, setVisible] = useState(false)
    const [mediaItems, setMediaItems] = useState<
        BaseFile[]
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)

        // Загружаем медиа
        loadMedia()

        return () => clearTimeout(t)
    }, [])

    const mockMediaFiles: MockFile[] = [
        {
            url: '/images/infoMediaImages/infoMediaImage1.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage2.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage3.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage4.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage5.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage6.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage7.png',
        },
        {
            url: '/images/infoMediaImages/infoMediaImage8.png',
        },
    ]

    // Функция загрузки медиа
    const loadMedia = async () => {
        setLoading(true)

        try {
            // Преобразуем моковые файлы и фильтруем только изображения
            const transformedFiles = transformFiles(
                mockMediaFiles,
                'mock',
            )
            const imageFiles = transformedFiles.filter(
                (file) => file.type === 'image',
            )

            // Отладка: проверяем что получилось
            console.log(
                'Transformed files:',
                transformedFiles,
            )
            console.log('Image files:', imageFiles)

            setMediaItems(imageFiles)
        } catch (error) {
            console.error('Ошибка загрузки медиа:', error)
            // В случае ошибки все равно используем моковые данные
            const transformedFiles = transformFiles(
                mockMediaFiles,
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

    // Функция для обновления медиа из другого источника
    const updateMediaFromSource = (
        files: MockFile[],
        sourceType: 'backend' | 'mock' = 'mock',
    ) => {
        const transformedFiles = transformFiles(
            files,
            sourceType,
        )
        const imageFiles = transformedFiles.filter(
            (file) => file.type === 'image',
        )
        setMediaItems(imageFiles)
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
            <div className="grid grid-cols-3 gap-0.5 px-[4px] py-[8px]">
                {mediaItems.map((item) => (
                    <div
                        key={item.id}
                        className={`
                          flex h-full w-full items-center justify-center
                        `}
                    >
                        {/* Проверяем что url существует и не пустой */}
                        {item.type === 'image' &&
                            item.url && (
                                <Image
                                    src={item.url}
                                    alt={`Media item ${item.id}`}
                                    width={120}
                                    height={120}
                                />
                            )}
                        {/* Для отладки: показываем если url отсутствует */}
                        {(!item.url || item.url === '') && (
                            <div
                                className={`
                                  flex h-[120px] w-[120px] items-center
                                  justify-center bg-gray-200 text-xs
                                  text-gray-500
                                `}
                            >
                                No URL
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Отладка: показываем количество элементов */}
            {mediaItems.length === 0 && (
                <div className="p-8 text-center text-text-gray">
                    Изображения не найдены
                </div>
            )}
        </div>
    )
}
