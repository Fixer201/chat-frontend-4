'use client'

export default function EmptyContactsState() {
    return (
        <div
            className={`
              flex h-full items-center justify-center rounded-lg border-2
              border-gray-light bg-gray-light shadow-sm
            `}
        >
            <p className="text-text-gray">
                Выберите контакт для начала общения
            </p>
        </div>
    )
}
