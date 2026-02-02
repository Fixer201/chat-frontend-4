'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * Всплывающее уведомление «Скопировано в буфер обмена» (toast).
 *
 * Двухфазная анимация исчезновения:
 * 1. При visible = true запускаются два таймера:
 *    - через 1700мс → exiting = true (начало анимации fadeOut)
 *    - через 2000мс → onHide() (полное скрытие компонента)
 * 2. Разница в 300мс даёт время на воспроизведение CSS-анимации
 *    (animate-copy-toast-out) до размонтирования элемента.
 *
 * Позиционируется абсолютно относительно ChatRoom (position: absolute),
 * pointer-events: none на внешнем контейнере предотвращает блокировку
 * кликов по элементам под тостом.
 */
interface CopyToastProps {
    /** Флаг видимости: управляется родительским компонентом */
    visible: boolean
    /** Колбэк полного скрытия: вызывается через 2 секунды после показа */
    onHide: () => void
}

export default function CopyToast({
    visible,
    onHide,
}: Readonly<CopyToastProps>) {
    /** Фаза выхода: true = анимация fadeOut активна (последние 300мс) */
    const [exiting, setExiting] = useState(false)
    const [prevVisible, setPrevVisible] = useState(false)

    // Сброс анимации при появлении тоста (derived state during render)
    if (visible !== prevVisible) {
        setPrevVisible(visible)
        if (visible) {
            setExiting(false)
        }
    }

    // Управление жизненным циклом тоста:
    // при каждом появлении (visible = true) запускаем два таймера
    // и очищаем их при размонтировании или повторном вызове
    useEffect(() => {
        if (!visible) return

        // Через 1700мс начинаем анимацию исчезновения
        const exitTimer = setTimeout(() => {
            setExiting(true)
        }, 1700)

        // Через 2000мс (1700 + 300мс на анимацию) полностью скрываем
        const hideTimer = setTimeout(onHide, 2000)

        return () => {
            clearTimeout(exitTimer)
            clearTimeout(hideTimer)
        }
    }, [visible, onHide])

    if (!visible) return null

    return (
        <div
            className={`
              pointer-events-none absolute inset-x-0 top-5 z-[9999] flex
              justify-center
            `}
        >
            <div
                className={`
                  pointer-events-auto flex max-w-[360px] items-center gap-2
                  rounded-lg bg-black-alpha-70 px-4 py-3
                  ${exiting ? 'animate-copy-toast-out' : 'animate-copy-toast-in'}
                `}
                style={{
                    width: 360,
                    height: 48,
                }}
            >
                <Image
                    src="/icons/message/Copy.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                    style={{
                        filter: 'brightness(0) saturate(100%) invert(50%) sepia(30%) saturate(700%) hue-rotate(130deg)',
                    }}
                />
                <span className="text-sm text-white-bg">
                    Скопировано в буфер обмена
                </span>
            </div>
        </div>
    )
}
