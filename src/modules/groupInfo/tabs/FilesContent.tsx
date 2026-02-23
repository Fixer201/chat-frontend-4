// FilesContent.tsx
'use client' // Клиентский компонент Next.js

import { useState, useEffect, useRef } from 'react'
import {
    transformFiles, // Преобразует сырые данные файлов в формат BaseFile
    formatFileSize, // Форматирует размер файла в читаемый вид (например, "2.5 MB")
    formatFileDate, // Форматирует дату файла
} from '@shared/lib/fileUtils'
import { downloadFileFromUrl } from '@shared/lib/downloadFile' // Утилита для скачивания файлов
import type {
    BackendFile,
    BaseFile, // Базовый интерфейс файла после трансформации
    MockFile, // Интерфейс для моковых файлов (простой объект с url)
} from '@shared/types/file'
import FileItem from '@shared/ui/FileItem' // Компонент отображения одного файла
import { useSearch } from '@shared/hooks/useSearch' // Хук для поиска/фильтрации
import Search from '@shared/ui/Search' // Компонент поиска
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState' // Состояние "ничего не найдено"
import {
    loadGroupFiles, // Загружает файлы группы из localStorage
    initGroupFiles, // Инициализирует файлы группы в localStorage (если их нет)
} from '@shared/lib/localStorageGroupFiles'

// Дефолтные моковые файлы для инициализации
const DEFAULT_MOCK_FILES: MockFile[] = [
    { url: '/mockFiles/_Info.txt' },
    { url: '/mockFiles/задача для deepseek.docx' },
    { url: '/mockFiles/CLI-COMMANDS.md' },
    { url: '/mockFiles/COMMIT-STRUCTURE.md' },
    { url: '/mockFiles/CSS-STYLING-GUIDE-DETAILED.md' },
    { url: '/mockFiles/GIT-FLOW.md' },
    { url: '/mockFiles/lorem.pdf' },
    { url: '/mockFiles/README.ru.md' },
]

// Интерфейс пропсов компонента
interface FilesContentProps {
    chatUid: string // Уникальный идентификатор чата/группы
}

export default function FilesContent({
    chatUid,
}: FilesContentProps) {
    // Состояние для плавного появления контента
    const [visible, setVisible] = useState(false)
    // Состояние со списком файлов после трансформации
    const [filesState, setFilesState] = useState<
        BaseFile[]
    >([])
    // Состояние загрузки
    const [loading, setLoading] = useState(true)
    // Значение поискового запроса
    const [searchValue, setSearchValue] = useState('')

    // Реф для хранения интервалов скачивания (чтобы можно было их очистить)
    const downloadIntervalsRef = useRef<{
        [key: number]: NodeJS.Timeout
    }>({})

    // Эффект при монтировании или изменении chatUid
    useEffect(() => {
        // Небольшая задержка для плавного появления
        const t = setTimeout(() => setVisible(true), 10)
        loadFiles() // Загружаем файлы

        // Cleanup функция
        return () => {
            clearTimeout(t)
            // Очищаем все интервалы скачивания при размонтировании
            Object.values(
                downloadIntervalsRef.current,
            ).forEach(clearInterval)
        }
    }, [chatUid]) // Перезапускаем при смене чата

    // Асинхронная загрузка файлов из localStorage
    const loadFiles = async () => {
        setLoading(true)
        try {
            // Пытаемся загрузить файлы для данного чата
            let filesData = loadGroupFiles(chatUid)
            if (!filesData) {
                // Если файлов нет - инициализируем моковыми
                filesData = initGroupFiles(
                    chatUid,
                    DEFAULT_MOCK_FILES,
                )
            }
            // Трансформируем сырые данные в формат для отображения
            const transformedFiles = transformFiles(
                filesData.results,
                'mock', // Тип источника данных
            )
            setFilesState(transformedFiles)
        } catch (error) {
            console.error('Ошибка загрузки файлов:', error)
            // При ошибке используем моковые данные
            const transformedFiles = transformFiles(
                DEFAULT_MOCK_FILES,
                'mock',
            )
            setFilesState(transformedFiles)
        } finally {
            setLoading(false)
        }
    }

    // Хук для фильтрации файлов по поисковому запросу
    const { filteredValue: filteredFiles } = useSearch(
        filesState,
        searchValue,
        [(file) => file.name.toLowerCase()], // Ищем по имени файла (в нижнем регистре)
    )

    // Имитация загрузки с реальным скачиванием по завершению
    const simulateDownload = (id: number) => {
        const file = filesState.find((f) => f.id === id)
        if (!file) return

        // Если файл уже загружается - останавливаем загрузку
        if (file.isLoading) {
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

        // Начинаем имитацию загрузки
        setFilesState((prev) =>
            prev.map((f) =>
                f.id === id
                    ? { ...f, isLoading: true, progress: 1 } // progress от 1 до 100
                    : f,
            ),
        )

        let progress = 1
        // Каждые 50мс увеличиваем прогресс на 1%
        const interval = setInterval(() => {
            progress += 1
            setFilesState((prev) =>
                prev.map((f) => {
                    if (f.id === id) {
                        const remaining =
                            file.originalSize *
                            (1 - progress / 100) // Оставшийся размер
                        return {
                            ...f,
                            progress,
                            size:
                                remaining > 0
                                    ? `${remaining.toFixed(1)} MB` // Показываем оставшийся размер
                                    : '0 MB',
                        }
                    }
                    return f
                }),
            )

            // Когда загрузка завершена (100%)
            if (progress >= 100) {
                clearInterval(interval)
                delete downloadIntervalsRef.current[id]

                // Реальное скачивание файла после завершения имитации
                downloadFileFromUrl(file.url, file.name)

                // Сброс состояния после небольшой задержки
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
        }, 50) // Интервал обновления 50мс

        downloadIntervalsRef.current[id] = interval
    }

    // Общий размер всех файлов
    const totalSize =
        filesState
            .reduce(
                (sum, file) => sum + file.originalSize,
                0,
            )
            .toFixed(1) + ' MB'

    // Состояние загрузки
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
            {/* Поисковая строка */}
            {/* Заменено h-1/12 на h-8 (32px) для соответствия шкале Tailwind */}
            <div className="mt-2 flex h-1/12 items-center px-4">
                <Search
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Поиск"
                    clearIconSrc="/images/search/iconsClose.svg" // Иконка очистки
                    showClearButton={true}
                    bgColor="bg-accent-violet-ultra-light" // Фон поиска
                />
            </div>

            {/* Список файлов */}
            <div className="space-y-0">
                {filesState.length === 0 ? (
                    <div className="p-8 text-center text-text-gray">
                        Файлы не найдены
                    </div>
                ) : filteredFiles.length === 0 ? (
                    // Ничего не найдено по поиску
                    <div className="p-8">
                        <EmptySearchState />
                    </div>
                ) : (
                    // Отображаем отфильтрованные файлы
                    filteredFiles.map((file) => (
                        <FileItem
                            key={file.id}
                            file={file}
                            onDownload={
                                () =>
                                    simulateDownload(
                                        file.id,
                                    ) // Обработчик скачивания
                            }
                        />
                    ))
                )}
            </div>
        </div>
    )
}
