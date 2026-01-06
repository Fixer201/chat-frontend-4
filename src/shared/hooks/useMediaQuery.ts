import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (listener) => {
            // Subscribe: добавляем listener для изменений media query
            const media = globalThis.matchMedia(query)
            media.addEventListener('change', listener)

            // Cleanup: удаляем listener при размонтировании
            return () =>
                media.removeEventListener(
                    'change',
                    listener,
                )
        },
        () => {
            // getSnapshot: возвращаем текущее значение
            if (typeof globalThis === 'undefined')
                return false
            return globalThis.matchMedia(query).matches
        },
        () => {
            // getServerSnapshot: для SSR (всегда false, т.к. на сервере нет окна)
            return false
        },
    )
}
