// src/modules/chat-room/components/CreateChannelForm.tsx
'use client'

import { useState } from 'react'

interface CreateChannelFormProps {
    onBack: () => void
    onNext: (channelName: string) => void
}

export default function CreateChannelForm({
    onBack,
    onNext,
}: CreateChannelFormProps) {
    const [channelName, setChannelName] = useState('')
    const [channelDescription, setChannelDescription] =
        useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!channelName.trim()) return

        console.log(
            'Переходим к выбору участников для канала:',
            channelName,
        )

        // Передаем название канала дальше
        onNext(channelName)
    }

    return (
        <div className="flex h-full flex-col">
            <div
                className={`
                  flex items-center gap-4 border-b border-gray-200 p-4
                `}
            >
                <button
                    onClick={onBack}
                    className={`rounded bg-gray-200 px-4 py-2`}
                >
                    ← Назад к чатам
                </button>
                <h1 className="text-xl font-semibold">
                    Создать канал
                </h1>
            </div>

            <div className="flex-1 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="set-channel-name"
                            className={`block text-sm font-medium`}
                        >
                            Название канала *
                        </label>
                        <input
                            id="set-channel-name"
                            type="text"
                            value={channelName}
                            onChange={(e) =>
                                setChannelName(
                                    e.target.value,
                                )
                            }
                            className={`
                              w-full rounded-lg border border-gray-300 p-3
                            `}
                            placeholder="Введите название канала"
                            required
                            autoFocus
                        />
                        <p
                            className={`text-sm text-text-gray`}
                        >
                            Например: `Новости компании,
                            Техподдержка, Объявления`
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="set-channel-description"
                            className="block text-sm font-medium"
                        >
                            Описание канала (необязательно)
                        </label>
                        <textarea
                            id="set-channel-description"
                            value={channelDescription}
                            onChange={(e) =>
                                setChannelDescription(
                                    e.target.value,
                                )
                            }
                            className={`
                              w-full rounded-lg border border-gray-300 p-3
                            `}
                            placeholder="Опишите, о чем этот канал"
                            rows={3}
                        />
                    </div>

                    <div
                        className={`rounded-lg bg-gray-50 p-4`}
                    >
                        <h3 className={`mb-2 font-medium`}>
                            Что такое канал?
                        </h3>
                        <p
                            className={`text-sm text-text-gray`}
                        >
                            Каналы предназначены для
                            публичных обсуждений и
                            объявлений. Сообщения в каналах
                            видят все участники.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <button
                            type="submit"
                            disabled={!channelName.trim()}
                            className={`
                              w-full rounded bg-purple-500 px-4 py-2 text-white
                              disabled:cursor-not-allowed disabled:opacity-50
                            `}
                        >
                            Далее
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
