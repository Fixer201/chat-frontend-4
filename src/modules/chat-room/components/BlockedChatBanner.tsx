/**
 * Баннер блокировки чата — отображается вместо поля ввода,
 * когда текущий пользователь или собеседник заблокированы.
 *
 * TODO: Реализовать верстку согласно дизайну (текст + кнопка «Разблокировать»).
 */
export default function BlockedChatBanner() {
    return (
        <div
            className={`
      cursor-default px-4 py-3 text-center text-sm text-text-gray select-none
    `}
        >
            This chat is blocked
        </div>
    )
}
