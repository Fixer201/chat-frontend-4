'use client'

import { useState, useEffect, useRef } from 'react'
import {
    transformFiles,
    formatFileSize,
    formatFileDate,
} from '../../../shared/lib/fileUtils'
import type {
    BackendFile,
    BaseFile,
    MockFile,
} from '@shared/types/file'
import FileItem from '../../../shared/ui/FileItem'
// Импорты для поиска
import { useSearch } from '@shared/hooks/useSearch'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'

export default function FilesContent() {
    const [visible, setVisible] = useState(false)
    const [filesState, setFilesState] = useState<
        BaseFile[]
    >([])
    const [loading, setLoading] = useState(true)
    // Состояние для строки поиска
    const [searchValue, setSearchValue] = useState('')

    // Создаем ref для хранения интервалов загрузки
    const downloadIntervalsRef = useRef<{
        [key: number]: NodeJS.Timeout
    }>({})

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)

        // Загружаем файлы
        loadFiles()

        // Очистка интервалов при размонтировании компонента
        return () => {
            clearTimeout(t)
            // Очищаем все интервалы загрузки
            Object.values(
                downloadIntervalsRef.current,
            ).forEach((interval) => {
                clearInterval(interval)
            })
        }
    }, [])

    const mockFiles = [
        { url: '/mockFiles/_Info.txt' },
        { url: '/mockFiles/задача для deepseek.docx' },
        { url: '/mockFiles/CLI-COMMANDS.md' },
        { url: '/mockFiles/COMMIT-STRUCTURE.md' },
        { url: '/mockFiles/CSS-STYLING-GUIDE-DETAILED.md' },
        { url: '/mockFiles/GIT-FLOW.md' },
        { url: '/mockFiles/lorem.pdf' },
        { url: '/mockFiles/README.ru.md' },
    ]

    // Функция загрузки файлов (может загружать из разных источников)
    const loadFiles = async () => {
        setLoading(true)

        try {
            // Пример 1: Используем моковые файлы
            const transformedFiles = transformFiles(
                mockFiles,
                'mock',
            )
            setFilesState(transformedFiles)
        } catch (error) {
            console.error('Ошибка загрузки файлов:', error)
            // В случае ошибки все равно используем моковые данные
            const transformedFiles = transformFiles(
                mockFiles,
                'mock',
            )
            setFilesState(transformedFiles)
        } finally {
            setLoading(false)
        }
    }

    // Фильтрация файлов по имени с помощью хука useSearch
    const { filteredValue: filteredFiles } = useSearch(
        filesState,
        searchValue,
        [(file) => file.name.toLowerCase()], // поиск по имени файла
    )

    // Функция для имитации загрузки файла
    const simulateDownload = (id: number) => {
        const file = filesState.find((f) => f.id === id)
        if (!file) return

        // Если файл уже загружается - останавливаем загрузку
        if (file.isLoading) {
            // Останавливаем интервал
            if (downloadIntervalsRef.current[id]) {
                clearInterval(
                    downloadIntervalsRef.current[id],
                )
                delete downloadIntervalsRef.current[id]
            }

            // Сбрасываем состояние файла
            setFilesState((prev) =>
                prev.map((f) =>
                    f.id === id
                        ? {
                              ...f,
                              isLoading: false,
                              progress: 0,
                              size: `${f.originalSize.toFixed(1)} MB`,
                          }
                        : f,
                ),
            )
            return
        }

        // Начинаем загрузку
        setFilesState((prev) =>
            prev.map((f) =>
                f.id === id
                    ? { ...f, isLoading: true, progress: 1 }
                    : f,
            ),
        )

        // Имитация загрузки
        let progress = 1
        const interval = setInterval(() => {
            progress += 1

            setFilesState((prev) =>
                prev.map((f) => {
                    if (f.id === id) {
                        // Вычисляем оставшийся размер
                        const remaining =
                            file.originalSize *
                            (1 - progress / 100)

                        return {
                            ...f,
                            progress,
                            size:
                                remaining > 0
                                    ? `${remaining.toFixed(1)} MB`
                                    : '0 MB',
                        }
                    }
                    return f
                }),
            )

            // Когда загрузка завершена
            if (progress >= 100) {
                clearInterval(interval)
                delete downloadIntervalsRef.current[id]

                // Возвращаем исходное состояние через 500мс
                setTimeout(() => {
                    setFilesState((prev) =>
                        prev.map((f) =>
                            f.id === id
                                ? {
                                      ...f,
                                      isLoading: false,
                                      progress: 0,
                                      size: `${file.originalSize.toFixed(1)} MB`,
                                  }
                                : f,
                        ),
                    )
                }, 500)
            }
        }, 50)

        // Сохраняем ссылку на интервал для возможности остановки
        downloadIntervalsRef.current[id] = interval
    }

    // Функция для обновления файлов из другого источника
    const updateFilesFromSource = (
        files: BackendFile[] | MockFile[],
        sourceType: 'backend' | 'mock' = 'mock',
    ) => {
        const transformedFiles = transformFiles(
            files,
            sourceType,
        )
        setFilesState(transformedFiles)
    }

    // Вычисляем общий размер файлов
    const totalSize =
        filesState
            .reduce((sum, file) => {
                return sum + file.originalSize
            }, 0)
            .toFixed(1) + ' MB'

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка файлов...
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Поле поиска (аналогично ContactsListGroup) */}
            <div className="mt-2 flex h-1/12 items-center px-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/iconsClose.svg"
                    showClearButton={true}
                    bgColor="bg-accent-violet-ultra-light"
                />
            </div>

            <div className="space-y-0">
                {filesState.length === 0 ? (
                    <div className="p-8 text-center text-text-gray">
                        Файлы не найдены
                    </div>
                ) : filteredFiles.length === 0 ? (
                    // Показываем заглушку, если поиск не дал результатов
                    <div className="p-8">
                        <EmptySearchState />
                    </div>
                ) : (
                    filteredFiles.map((file) => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onDownload={simulateDownload}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
