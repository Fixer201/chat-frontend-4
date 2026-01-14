// src/modules/chat-room/components/CreateGroupForm.tsx
'use client'

import { useState } from 'react'

interface CreateGroupFormProps {
    onBack: () => void
    onNext: (groupName: string) => void // Теперь передаем название группы
}

export default function CreateGroupForm({
    onBack,
    onNext,
}: CreateGroupFormProps) {
    const [groupName, setGroupName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!groupName.trim()) return

        console.log(
            'Переходим к выбору участников для группы:',
            groupName,
        )

        // Передаем название группы дальше
        onNext(groupName)
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
                    className="rounded bg-gray-200 px-4 py-2"
                >
                    ← Назад к чатам
                </button>
                <h1 className="text-xl font-semibold">
                    Создать группу
                </h1>
            </div>

            <div className="flex-1 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="set-group-name"
                            className={`block text-sm font-medium`}
                        >
                            Название группы *
                        </label>
                        <input
                            id="set-group-name"
                            type="text"
                            value={groupName}
                            onChange={(e) =>
                                setGroupName(e.target.value)
                            }
                            className={`
                              w-full rounded-lg border border-gray-300 p-3
                            `}
                            placeholder="Введите название группы"
                            required
                            autoFocus
                        />
                        <p className="text-sm text-text-gray">
                            Например: `Рабочая команда,
                            Семья, Друзья`
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium">
                            Совет
                        </h3>
                        <p className="text-sm text-text-gray">
                            Выберите понятное название, по
                            которому участники смогут легко
                            найти группу.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <button
                            type="submit"
                            disabled={!groupName.trim()}
                            className={`
                              w-full rounded bg-blue-500 px-4 py-2 text-white
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
