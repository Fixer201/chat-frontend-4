// VoiceContent.tsx
'use client'

import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
    transformFiles,
    formatAudioDuration, // Форматирует длительность аудио в читаемый вид (например, "3:45")
} from '@shared/lib/fileUtils'
import type {
    MockFile,
    AudioFile, // Тип аудиофайла с дополнительными полями (isPlaying, currentTime, totalDuration)
} from '@shared/types/file'
import {
    loadGroupAudio, // Загрузка аудио группы из localStorage
    initGroupAudio, // Инициализация аудио группы
} from '@shared/lib/localStorageGroupAudio'

// Дефолтный список аудиофайлов (из исходного кода)
const DEFAULT_AUDIO_FILES: MockFile[] = [
    { url: '/audioFiles/Виктор Цой - Группа крови.mp3' },
    {
        url: '/audioFiles/Ударные_ Polar Kit A (Dubstep Drum Sample).ogg',
    },
    {
        url: '/audioFiles/Хоровое пение (звук для фильмов)_ Alt.ogg',
    },
    {
        url: '/audioFiles/Хоровое пение (звук для фильмов)_ Choir Ensemble.ogg',
    },
    {
        url: '/audioFiles/Школьная аудитория_ ожидание начала шоу.wav',
    },
    { url: '/audioFiles/Юрий Шатунов - Седая Ночь.mp3' },
    { url: '/audioFiles/Ярмарка, парк развлечений.wav' },
    {
        url: '/audioFiles/Galibri & Mavik - Федерико Феллини.mp3',
    },
    { url: '/audioFiles/MiyaGi & Andy Panda - Minor.mp3' },
]

// Интерфейс пропсов компонента
interface VoiceContentProps {
    chatUid: string // ID чата/группы
}

export default function VoiceContent({
    chatUid,
}: VoiceContentProps) {
    const [visible, setVisible] = useState(false) // Для плавного появления
    const [loading, setLoading] = useState(true) // Состояние загрузки
    const [audioMessages, setAudioMessages] = useState<
        AudioFile[]
    >([]) // Список аудиосообщений
    const [currentPlayingId, setCurrentPlayingId] =
        useState<number | null>(null) // ID текущего воспроизводимого аудио

    // Реф для хранения объектов Audio по ID сообщения
    const audioRefs = useRef<{
        [key: number]: HTMLAudioElement
    }>({})

    // Эффект при монтировании или смене чата
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10) // Плавное появление
        loadAudio()
        return () => {
            clearTimeout(t)
            // Очистка: останавливаем все аудио и освобождаем ресурсы
            Object.values(audioRefs.current).forEach(
                (audio) => {
                    audio.pause()
                    audio.src = ''
                },
            )
        }
    }, [chatUid])

    // Загрузка аудио из localStorage
    const loadAudio = async () => {
        setLoading(true)
        try {
            let audioData = loadGroupAudio(chatUid)
            if (!audioData) {
                // Если данных нет - инициализируем моковыми
                audioData = initGroupAudio(
                    chatUid,
                    DEFAULT_AUDIO_FILES,
                )
            }
            // Трансформируем в формат BaseFile
            const transformedFiles = transformFiles(
                audioData.results,
                'mock',
            )
            // Фильтруем только аудиофайлы
            const audioFiles = transformedFiles.filter(
                (file) => file.type === 'audio',
            )

            // Преобразуем в AudioFile с дополнительными полями для плеера
            const audioMessagesData: AudioFile[] =
                audioFiles.map((file) => {
                    // Генерируем случайную длительность от 30 до 240 секунд (для моков)
                    const randomDuration = Math.floor(
                        Math.random() * (240 - 30) + 30,
                    )
                    return {
                        ...file,
                        duration:
                            formatAudioDuration(
                                randomDuration,
                            ), // Форматированная длительность
                        isPlaying: false, // Не воспроизводится
                        currentTime: 0, // Текущее время 0
                        totalDuration: randomDuration, // Общая длительность в секундах
                    }
                })

            setAudioMessages(audioMessagesData)
        } catch (error) {
            console.error('Ошибка загрузки аудио:', error)
        } finally {
            setLoading(false)
        }
    }

    // Инициализация аудиоэлемента для конкретного сообщения
    const initAudio = (id: number, url: string) => {
        if (!audioRefs.current[id]) {
            const audio = new Audio(url)

            // Событие: загружены метаданные (узнаём реальную длительность)
            audio.addEventListener('loadedmetadata', () => {
                setAudioMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === id
                            ? {
                                  ...msg,
                                  totalDuration:
                                      audio.duration,
                                  duration:
                                      formatAudioDuration(
                                          audio.duration,
                                      ),
                              }
                            : msg,
                    ),
                )
            })

            // Событие: обновление времени воспроизведения
            audio.addEventListener('timeupdate', () => {
                setAudioMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === id
                            ? {
                                  ...msg,
                                  currentTime:
                                      audio.currentTime,
                              }
                            : msg,
                    ),
                )
            })

            // Событие: окончание воспроизведения
            audio.addEventListener('ended', () => {
                setAudioMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === id
                            ? {
                                  ...msg,
                                  isPlaying: false,
                                  currentTime: 0,
                              }
                            : msg,
                    ),
                )
                setCurrentPlayingId(null)
            })

            audioRefs.current[id] = audio
        }
        return audioRefs.current[id]
    }

    // Переключение воспроизведения (play/pause)
    const togglePlay = (id: number, url: string) => {
        const audio = initAudio(id, url)
        const message = audioMessages.find(
            (msg) => msg.id === id,
        )
        if (!message) return

        if (message.isPlaying) {
            // Если уже играет - ставим на паузу
            audio.pause()
            setAudioMessages((prev) =>
                prev.map((msg) =>
                    msg.id === id
                        ? { ...msg, isPlaying: false }
                        : msg,
                ),
            )
            setCurrentPlayingId(null)
        } else {
            // Останавливаем все другие аудио
            Object.entries(audioRefs.current).forEach(
                ([audioId, audioElement]) => {
                    if (Number(audioId) !== id) {
                        audioElement.pause()
                    }
                },
            )

            // Запускаем текущее
            audio.play()
            setAudioMessages((prev) =>
                prev.map((msg) => ({
                    ...msg,
                    isPlaying: msg.id === id, // Только текущее играет
                })),
            )
            setCurrentPlayingId(id)
        }
    }

    // Состояние загрузки
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка аудио...
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
                {audioMessages.map((message) => {
                    // Оставшееся время (для отображения при воспроизведении)
                    const remainingTime =
                        message.totalDuration -
                        message.currentTime
                    const displayTime = message.isPlaying
                        ? formatAudioDuration(remainingTime) // Если играет - показываем оставшееся
                        : message.duration // Если нет - общую длительность

                    // Прогресс воспроизведения в процентах
                    const progress =
                        message.totalDuration > 0
                            ? (message.currentTime /
                                  message.totalDuration) *
                              100
                            : 0

                    return (
                        <div
                            key={message.id}
                            className={`
                          border-b border-app-divider p-3
                        `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Кнопка play/pause */}
                                <button
                                    onClick={() =>
                                        togglePlay(
                                            message.id,
                                            message.url,
                                        )
                                    }
                                    className={`
                                      flex h-10 w-10 items-center justify-center
                                      rounded-full transition-colors
                                      ${
                                          message.isPlaying
                                              ? `
                                                bg-blue-600
                                                hover:bg-blue-700
                                              `
                                              : `
                                                bg-blue-100
                                                hover:bg-blue-200
                                              `
                                      }
                                    `}
                                >
                                    {message.isPlaying ? (
                                        <Image
                                            src="/icons/PauseButton.svg"
                                            alt="Pause"
                                            width={10}
                                            height={10}
                                            className="h-full w-full"
                                        />
                                    ) : (
                                        <Image
                                            src="/icons/PlayButton.svg"
                                            alt="Play"
                                            width={10}
                                            height={10}
                                            className="h-full w-full"
                                        />
                                    )}
                                </button>

                                {/* Информация об аудио */}
                                <div className="flex-1">
                                    <div
                                        className={`
                                      mb-1 flex items-center justify-between
                                    `}
                                    >
                                        <span
                                            className={`
                                          font-medium text-text-black
                                        `}
                                        >
                                            {message.name}{' '}
                                            {/* Название файла */}
                                        </span>
                                    </div>

                                    {/* Метаданные: длительность и дата */}
                                    <div
                                        className={cn(`
                                      flex items-center gap-2 text-sm
                                      text-text-gray
                                    `)}
                                    >
                                        <span className="text-sm text-text-gray">
                                            {displayTime}{' '}
                                            {/* Отображаемое время */}
                                        </span>
                                        <span>•</span>
                                        <span className="text-sm text-text-gray">
                                            {message.date}{' '}
                                            {/* Дата сообщения */}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Сообщение, если нет аудио */}
            {audioMessages.length === 0 && (
                <div className="p-8 text-center text-text-gray">
                    Аудиосообщения не найдены
                </div>
            )}
        </div>
    )
}
