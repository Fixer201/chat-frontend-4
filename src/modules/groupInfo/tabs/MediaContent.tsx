'use client'

import { useState, useEffect } from 'react'

export default function MediaContent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const mediaItems = [
        { id: 1, type: 'image', date: 'Сегодня', count: 5 },
        { id: 2, type: 'image', date: 'Вчера', count: 3 },
        {
            id: 3,
            type: 'video',
            date: '2 дня назад',
            count: 2,
        },
        {
            id: 4,
            type: 'image',
            date: 'Неделю назад',
            count: 12,
        },
        {
            id: 5,
            type: 'image',
            date: '2 недели назад',
            count: 8,
        },
        {
            id: 6,
            type: 'video',
            date: 'Месяц назад',
            count: 4,
        },
        {
            id: 7,
            type: 'image',
            date: '2 месяца назад',
            count: 15,
        },
        {
            id: 8,
            type: 'image',
            date: '3 месяца назад',
            count: 7,
        },
        {
            id: 9,
            type: 'image',
            date: '4 месяца назад',
            count: 9,
        },
        {
            id: 10,
            type: 'video',
            date: '5 месяца назад',
            count: 6,
        },
    ]

    const totalMediaCount = mediaItems.reduce(
        (sum, item) => sum + item.count,
        0,
    )

    return (
        <div
            className={`
          transition-opacity duration-200
          ${visible ? `opacity-100` : `opacity-0`}
        `}
        >
            <div
                className={`
              grid grid-cols-3 gap-2
              sm:grid-cols-4
              md:grid-cols-5
            `}
            >
                {mediaItems.map((item) => (
                    <div
                        key={item.id}
                        className={`
                          group relative aspect-square cursor-pointer
                          overflow-hidden rounded-lg transition-transform
                          hover:scale-105
                        `}
                    >
                        <div
                            className={`
                          flex h-full w-full items-center justify-center
                          bg-gradient-to-br from-blue-200 to-purple-300
                        `}
                        >
                            {item.type === 'video' ? (
                                <div className="text-white">
                                    <svg
                                        className="h-8 w-8 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="text-white">
                                    <svg
                                        className="h-8 w-8 fill-current"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div
                            className={`
                          absolute inset-0 flex items-center justify-center
                          bg-black/50 opacity-0 transition-opacity
                          group-hover:opacity-100
                        `}
                        >
                            <span className="text-sm font-medium text-white">
                                {item.count} шт.
                            </span>
                        </div>
                        <div
                            className={`
                          absolute right-1 bottom-1 left-1 truncate rounded
                          bg-black/50 px-1 py-0.5 text-xs text-white
                        `}
                        >
                            {item.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
