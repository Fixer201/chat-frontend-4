'use client'

import { useState, useEffect } from 'react'

export default function FilesContent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        return () => clearTimeout(t)
    }, [])

    const files = [
        {
            id: 1,
            name: 'Проект_дизайн.pdf',
            size: '2.4 MB',
            date: 'Сегодня, 14:30',
            type: 'pdf',
        },
        {
            id: 2,
            name: 'Отчет_за_месяц.docx',
            size: '1.8 MB',
            date: 'Вчера, 11:15',
            type: 'doc',
        },
        {
            id: 3,
            name: 'Презентация.pptx',
            size: '4.2 MB',
            date: '3 дня назад',
            type: 'ppt',
        },
        {
            id: 4,
            name: 'Изображение_проекта.jpg',
            size: '3.1 MB',
            date: 'Неделю назад',
            type: 'image',
        },
        {
            id: 5,
            name: 'Архив_материалов.zip',
            size: '15.7 MB',
            date: '2 недели назад',
            type: 'archive',
        },
        {
            id: 6,
            name: 'Таблица_данных.xlsx',
            size: '0.9 MB',
            date: 'Месяц назад',
            type: 'excel',
        },
        {
            id: 7,
            name: 'Видео_презентация.mp4',
            size: '42.5 MB',
            date: 'Месяц назад',
            type: 'video',
        },
        {
            id: 8,
            name: 'Аудио_заметки.mp3',
            size: '5.3 MB',
            date: '2 месяца назад',
            type: 'audio',
        },
        {
            id: 9,
            name: 'Бриф_проекта.txt',
            size: '0.2 MB',
            date: '2 месяца назад',
            type: 'text',
        },
        {
            id: 10,
            name: 'Дизайн_система.sketch',
            size: '8.9 MB',
            date: '3 месяца назад',
            type: 'sketch',
        },
    ]

    const totalSize = '93.0 MB'

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return '📄'
            case 'doc':
                return '📝'
            case 'ppt':
                return '📊'
            case 'image':
                return '🖼️'
            case 'archive':
                return '📦'
            case 'excel':
                return '📈'
            case 'video':
                return '🎬'
            case 'audio':
                return '🎵'
            case 'text':
                return '📃'
            case 'sketch':
                return '✏️'
            default:
                return '📎'
        }
    }

    return (
        <div
            className={`
          transition-opacity duration-200
          ${visible ? `opacity-100` : `opacity-0`}
        `}
        >
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-text-black">
                        Файлы группы
                    </h3>
                    <div className="text-sm text-text-gray">
                        Всего: {files.length} файлов
                    </div>
                </div>
                <p className="mt-1 text-text-gray">
                    Здесь хранятся все файлы, отправленные в
                    группе
                </p>
            </div>

            <div className="space-y-3">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`
                          group flex items-center rounded-lg border
                          border-gray-200 bg-white p-3
                        `}
                    >
                        <div
                            className={`
                          flex items-center justify-center text-2xl
                        `}
                        >
                            <div
                                className={`
                              flex h-10 w-10 items-center justify-center
                            `}
                            >
                                {getFileIcon(file.type)}
                            </div>
                        </div>
                        <div className="ml-3 flex-1">
                            <h4 className="truncate font-medium text-text-black">
                                {file.name}
                            </h4>
                            <div
                                className={`
                              flex items-center gap-2 text-sm text-text-gray
                            `}
                            >
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                            </div>
                        </div>
                        <div
                            className={`
                          flex items-center gap-2 opacity-0 transition-opacity
                          group-hover:opacity-100
                        `}
                        >
                            <button
                                className={`
                                  rounded p-1.5
                                  hover:bg-gray-100
                                `}
                                title="Скачать"
                            >
                                ⬇️
                            </button>
                            <button
                                className={`
                                  rounded p-1.5
                                  hover:bg-gray-100
                                `}
                                title="Поделиться"
                            >
                                ↗️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div
                className={`
              mt-6 mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4
            `}
            >
                <h4 className="mb-2 font-medium text-blue-800">
                    Хранилище группы
                </h4>
                <div
                    className={`
                  mb-2 h-2 w-full overflow-hidden rounded-full bg-blue-100
                `}
                >
                    <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: '65%' }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm text-blue-700">
                    <span>Использовано 65%</span>
                    <span>15.2 GB / 25 GB</span>
                </div>
                <div className="mt-3 text-sm text-blue-700">
                    Общий размер файлов: {totalSize}
                </div>
            </div>
        </div>
    )
}
