// src/modules/chat-room/components/ChannelMembersList.tsx
'use client'

interface ChannelMembersListProps {
    channelName: string
    onBack: () => void
    onFinish: () => void
}

export default function ChannelMembersList({
    channelName,
    onBack,
    onFinish,
}: ChannelMembersListProps) {
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
                    ← Назад к форме
                </button>
                <h1 className={`text-xl font-semibold`}>
                    Выбор участников канала
                </h1>
            </div>

            <div className="flex-1 p-4">
                <div
                    className={`mb-6 rounded-lg bg-purple-50 p-4`}
                >
                    <p className="font-medium">
                        Создаем канал:
                    </p>
                    <p className="text-lg font-semibold">
                        `{channelName}`
                    </p>
                </div>

                <p className="mb-4">
                    Выберите участников для канала:
                </p>

                <div className="mb-6 space-y-2">
                    <div
                        className={`
                          flex items-center justify-between rounded border p-3
                        `}
                    >
                        <span>Участник 1</span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                    </div>
                    <div
                        className={`
                          flex items-center justify-between rounded border p-3
                        `}
                    >
                        <span>Участник 2</span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                    </div>
                    <div
                        className={`
                          flex items-center justify-between rounded border p-3
                        `}
                    >
                        <span>Участник 3</span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                    </div>
                    <div
                        className={`
                          flex items-center justify-between rounded border p-3
                        `}
                    >
                        <span>Участник 4</span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                    </div>
                    <div
                        className={`
                          flex items-center justify-between rounded border p-3
                        `}
                    >
                        <span>Участник 5</span>
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">
                        Информация о каналах
                    </h3>
                    <p className="text-sm text-text-gray">
                        Все выбранные участники получат
                        уведомление о подписке на канал `
                        {channelName}`. В каналах могут
                        публиковать сообщения только
                        администраторы.
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={onFinish}
                    className={`
                      w-full rounded bg-purple-600 px-4 py-2 text-white
                    `}
                >
                    Создать канал `{channelName}`
                </button>
            </div>
        </div>
    )
}
