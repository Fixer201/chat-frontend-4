// src/modules/groupInfo/tabs/VoiceContent.tsx
'use client'

import { cn } from '@shared/lib/utils'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
    transformFiles,
    formatAudioDuration,
} from '@shared/lib/fileUtils'
import type {
    MockFile,
    AudioFile,
} from '@shared/types/file'
import {
    loadGroupAudio,
    initGroupAudio,
} from '@shared/lib/localStorageGroupAudio'

// Дефолтный список аудио (из исходного кода)
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

interface VoiceContentProps {
    chatUid: string
}

export default function VoiceContent({
    chatUid,
}: VoiceContentProps) {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [audioMessages, setAudioMessages] = useState<
        AudioFile[]
    >([])
    const [currentPlayingId, setCurrentPlayingId] =
        useState<number | null>(null)

    const audioRefs = useRef<{
        [key: number]: HTMLAudioElement
    }>({})

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10)
        loadAudio()
        return () => {
            clearTimeout(t)
            Object.values(audioRefs.current).forEach(
                (audio) => {
                    audio.pause()
                    audio.src = ''
                },
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatUid])

    const loadAudio = async () => {
        setLoading(true)
        try {
            let audioData = loadGroupAudio(chatUid)
            if (!audioData) {
                audioData = initGroupAudio(
                    chatUid,
                    DEFAULT_AUDIO_FILES,
                )
            }
            const transformedFiles = transformFiles(
                audioData.results,
                'mock',
            )
            const audioFiles = transformedFiles.filter(
                (file) => file.type === 'audio',
            )

            const audioMessagesData: AudioFile[] =
                audioFiles.map((file) => {
                    const randomDuration = Math.floor(
                        Math.random() * (240 - 30) + 30,
                    )
                    return {
                        ...file,
                        duration:
                            formatAudioDuration(
                                randomDuration,
                            ),
                        isPlaying: false,
                        currentTime: 0,
                        totalDuration: randomDuration,
                    }
                })

            setAudioMessages(audioMessagesData)
        } catch (error) {
            console.error('Ошибка загрузки аудио:', error)
        } finally {
            setLoading(false)
        }
    }

    const initAudio = (id: number, url: string) => {
        if (!audioRefs.current[id]) {
            const audio = new Audio(url)

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

    const togglePlay = (id: number, url: string) => {
        const audio = initAudio(id, url)
        const message = audioMessages.find(
            (msg) => msg.id === id,
        )
        if (!message) return

        if (message.isPlaying) {
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
            Object.entries(audioRefs.current).forEach(
                ([audioId, audioElement]) => {
                    if (Number(audioId) !== id) {
                        audioElement.pause()
                    }
                },
            )

            audio.play()
            setAudioMessages((prev) =>
                prev.map((msg) => ({
                    ...msg,
                    isPlaying: msg.id === id,
                })),
            )
            setCurrentPlayingId(id)
        }
    }

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
                    const remainingTime =
                        message.totalDuration -
                        message.currentTime
                    const displayTime = message.isPlaying
                        ? formatAudioDuration(remainingTime)
                        : message.duration

                    const progress =
                        message.totalDuration > 0
                            ? (message.currentTime /
                                  message.totalDuration) *
                              100
                            : 0

                    return (
                        <div
                            key={message.id}
                            className="border-b border-gray-200 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        togglePlay(
                                            message.id,
                                            message.url,
                                        )
                                    }
                                    className={`
                    flex h-10 w-10 items-center justify-center rounded-full
                    transition-colors
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

                                <div className="flex-1">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="font-medium text-text-black">
                                            {message.name}
                                        </span>
                                    </div>

                                    <div
                                        className={cn(
                                            'flex items-center gap-2 text-sm text-text-gray',
                                        )}
                                    >
                                        <span className="text-sm text-text-gray">
                                            {displayTime}
                                        </span>
                                        <span>•</span>
                                        <span className="text-sm text-text-gray">
                                            {message.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {audioMessages.length === 0 && (
                <div className="p-8 text-center text-text-gray">
                    Аудиосообщения не найдены
                </div>
            )}
        </div>
    )
}
