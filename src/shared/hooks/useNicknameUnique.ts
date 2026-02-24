import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react'

interface UseNicknameUniqueProps {
    nickname: string
    debounceMs?: number
    validationRegex?: RegExp
    onError?: (error: string) => void
}

/**
 * Хук для проверки уникальности никнейма с debounce и отменой предыдущих запросов.
 * @param nickname - текущее значение никнейма
 * @param debounceMs - задержка перед отправкой запроса (мс)
 * @param validationRegex - регулярка для предварительной валидации (запрос не отправляется, если не проходит)
 * @param onError - колбэк при возникновении ошибки (опционально)
 */
export const useNicknameUnique = ({
    nickname,
    debounceMs = 500,
    validationRegex = /^[a-zA-Z0-9._]*$/,
    onError,
}: UseNicknameUniqueProps) => {
    const [uniqueError, setUniqueError] = useState('')
    const [isChecking, setIsChecking] = useState(false)
    const [lastCheckedNickname, setLastCheckedNickname] =
        useState('')
    const abortControllerRef =
        useRef<AbortController | null>(null)

    const checkUnique = useCallback(
        async (value: string) => {
            if (!validationRegex.test(value)) return

            setIsChecking(true)
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            const controller = new AbortController()
            abortControllerRef.current = controller

            try {
                const response = await fetch(
                    `/api/auth/unique_nickname_check/${encodeURIComponent(value)}`,
                    { signal: controller.signal },
                )

                if (
                    response.ok ||
                    response.status === 400
                ) {
                    const data = await response.json()
                    if (
                        data.nickname &&
                        Array.isArray(data.nickname) &&
                        data.nickname.length > 0
                    ) {
                        setUniqueError(
                            'Этот никнейм занят другим пользователем',
                        )
                    } else {
                        setUniqueError('')
                    }
                    setLastCheckedNickname(value)
                } else {
                    setUniqueError(
                        'Не удалось проверить уникальность никнейма',
                    )
                    setLastCheckedNickname(value)
                }
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === 'AbortError'
                )
                    return
                console.error(
                    'Ошибка проверки уникальности:',
                    error,
                )
                setUniqueError(
                    'Не удалось проверить уникальность никнейма',
                )
                setLastCheckedNickname(value)
                onError?.(
                    'Не удалось проверить уникальность никнейма',
                )
            } finally {
                setIsChecking(false)
                abortControllerRef.current = null
            }
        },
        [validationRegex, onError],
    )

    useEffect(() => {
        if (!nickname || nickname !== lastCheckedNickname) {
            const timer = setTimeout(() => {
                if (nickname) checkUnique(nickname)
            }, debounceMs)
            return () => clearTimeout(timer)
        }
    }, [
        nickname,
        debounceMs,
        checkUnique,
        lastCheckedNickname,
    ])

    const validateUniqueNow =
        useCallback(async (): Promise<boolean> => {
            if (!nickname) {
                setUniqueError('Заполните поле')
                return false
            }
            if (!validationRegex.test(nickname)) {
                setUniqueError(
                    'Используйте только буквы, цифры, точку или подчеркивание',
                )
                return false
            }
            if (
                nickname === lastCheckedNickname &&
                uniqueError === ''
            ) {
                return true
            }
            await checkUnique(nickname)
            return uniqueError === ''
        }, [
            nickname,
            validationRegex,
            lastCheckedNickname,
            uniqueError,
            checkUnique,
        ])

    const resetUniqueError = useCallback(
        () => setUniqueError(''),
        [],
    )

    return {
        uniqueError,
        isChecking,
        validateUniqueNow,
        resetUniqueError,
    }
}
