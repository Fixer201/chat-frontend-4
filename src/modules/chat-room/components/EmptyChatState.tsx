/**
 * Заглушка начального экрана — отображается в области чата,
 * когда ни один контакт не выбран. Приглашает пользователя
 * выбрать собеседника для начала переписки.
 */
export default function EmptyChatState() {
    return (
        <div
            className={`
          flex h-full cursor-default items-center justify-center select-none
        `}
        >
            <p className="text-text-gray">
                Выберите контакт для начала общения
            </p>
        </div>
    )
}
