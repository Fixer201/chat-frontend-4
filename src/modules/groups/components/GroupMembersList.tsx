// src/modules/chat-room/components/GroupMembersList.tsx
'use client'

interface GroupMembersListProps {
    groupName: string // Теперь принимаем название группы вместо ID
    onBack: () => void
    onFinish: () => void
}

export default function GroupMembersList({
    groupName,
    onBack,
    onFinish,
}: GroupMembersListProps) {
    return (
        <div className="flex h-full flex-col">
            <div
                className={`
                  flex items-center gap-4 border-b border-gray-200 p-4
                `}
            >
                <button
                    onClick={onBack}
                    className="rounded bg-gray-200 px-4 py-2"
                >
                    ← Назад к форме
                </button>
                <h1 className="text-xl font-semibold">
                    Выбор участников
                </h1>
            </div>

            <div className="flex-1 p-4">
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <p className="font-medium">
                        Создаем группу:
                    </p>
                    <p className="text-lg font-semibold">
                        `{groupName}`
                    </p>
                </div>

                <p className="mb-4">
                    Выберите участников для группы:
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
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">
                        Информация
                    </h3>
                    <p className="text-sm text-text-gray">
                        Все выбранные участники получат
                        уведомление о добавлении в группу `
                        {groupName}`.
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={onFinish}
                    className="w-full rounded bg-green-500 px-4 py-2 text-white"
                >
                    Создать
                </button>
            </div>
        </div>
    )
}
