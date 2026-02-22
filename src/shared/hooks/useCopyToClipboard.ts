import { useState, useCallback } from 'react'

type CopyFn = (text: string) => Promise<boolean>

/**
 * Хук для копирования текста в буфер обмена
 * @param resetDelay - время в мс, через которое сбрасывается состояние copied (по умолчанию 2000)
 * @returns [copied, copy] - состояние (скопировано ли) и функция копирования
 */
export function useCopyToClipboard(
    resetDelay: number = 2000,
): [boolean, CopyFn] {
    const [copied, setCopied] = useState(false)

    const copy: CopyFn = useCallback(
        async (text) => {
            if (!navigator?.clipboard) {
                console.warn('Clipboard not supported')
                return false
            }

            try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                const timer = setTimeout(
                    () => setCopied(false),
                    resetDelay,
                )
                return true
            } catch (error) {
                console.warn('Copy failed', error)
                setCopied(false)
                return false
            }
        },
        [resetDelay],
    )

    return [copied, copy]
}
