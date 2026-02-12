// Дропдаун действий по контакту (блокировка) // Для теста чёрного списка
'use client'

import { useState, useRef, useEffect } from 'react'

interface ContactActionsDropdownProps {
    onBlock: () => void // Для теста чёрного списка
}

export default function ContactActionsDropdown({
    onBlock,
}: ContactActionsDropdownProps) {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
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
            document.addEventListener(
                'mousedown',
                handleClickOutside,
            )
        }
        return () => {
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
