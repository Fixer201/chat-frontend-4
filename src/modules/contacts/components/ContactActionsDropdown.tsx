// Дропдаун действий по контакту (блокировка) // Для теста чёрного списка
// Best practice: компонент отвечает только за UI и события,
// а бизнес‑логика блокировки находится выше (родительский контейнер).
'use client'

import { useState, useRef, useEffect } from 'react'

interface ContactActionsDropdownProps {
    // Колбэк наверх — единый источник правды для блокировки.
    onBlock: () => void // Для теста чёрного списка
}

export default function ContactActionsDropdown({
    onBlock,
}: ContactActionsDropdownProps) {
    // Управляем локальным состоянием раскрытия меню.
    const [open, setOpen] = useState(false)
    // Реф для проверки кликов вне компонента.
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Закрываем меню по клику вне (best practice для dropdown UX).
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false)
            }
        }
        if (open) {
            // Подписываемся только пока меню открыто,
            // чтобы избежать лишних слушателей.
            document.addEventListener(
                'mousedown',
                handleClickOutside,
            )
        }
        return () => {
            // Всегда снимаем слушатель при unmount/закрытии.
            document.removeEventListener(
                'mousedown',
                handleClickOutside,
            )
        }
    }, [open])

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                // Переключаем видимость меню по клику.
                onClick={() => setOpen((prev) => !prev)}
                className={`
                  flex h-8 w-8 items-center justify-center rounded
                  hover:bg-accent-violet-ultra-light
                `}
                aria-label="Действия с контактом"
            >
                <span className="text-xl leading-none text-text-gray">
                    ⋯
                </span>
            </button>

            {open && (
                <div
                    className={`
                      absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-md
                      border border-app-divider bg-white shadow-context-shadow
                    `}
                    role="menu"
                >
                    <button
                        type="button"
                        // Сначала выполняем действие, затем закрываем меню.
                        // Это делает UX предсказуемым и упрощает повторные клики.
                        onClick={() => {
                            onBlock()
                            setOpen(false)
                        }}
                        className={`
                          block w-full px-3 py-2 text-left text-red-500
                          hover:bg-accent-violet-ultra-light
                        `}
                    >
                        Заблокировать
                    </button>
                </div>
            )}
        </div>
    )
}
