'use client'

import { useCallback, useEffect, useState } from 'react'
import Cookies from 'js-cookie'

export type UserProfile = {
    uid?: string
    id?: number
    nickname?: string
    first_name?: string
    last_name?: string
    patronymic?: string
    additional_information?: string
    birthday?: string | number | null
    email?: string
    gender?: string
    country?: string
    city_id?: number | null
    phone?: string
    avatar?: string
    avatar_url?: string
    avatar_webp?: string
    avatar_webp_url?: string
}

type ProfileState = {
    profile: UserProfile | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

const UNAUTHORIZED_ERROR = 'Unauthorized'

function clearAuthArtifacts() {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem('profile_cache')
        } catch (e) {
            console.warn('Profile cache clear failed', e)
        }
    }
}

// Универсальный POST-запрос с авторизацией. Бек ожидает POST даже для чтения профиля,
// поэтому отправляем пустой JSON, чтобы не ломать контракт.
async function getWithAuth(
    path: string,
    accessToken?: string,
) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
    }

    return fetch(path, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
    })
}

// Обновляем access токен через refresh в cookies. Возвращаем строку токена или null,
// если refresh отсутствует или запрос неуспешен.
async function refreshAccessToken() {
    const refreshToken = Cookies.get('refresh_token')
    if (!refreshToken) {
        clearAuthArtifacts()
        return null
    }

    const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!res.ok) {
        clearAuthArtifacts()
        return null
    }

    const data = await res.json()
    if (data?.access) {
        Cookies.set('access_token', data.access, {
            expires: 7,
        })
        return data.access as string
    }

    return null
}

// Единая точка, которая следит за валидностью токена: шлём запрос с текущим access,
// при 401 пытаемся обновить и повторяем один раз. Возвращаем финальный Response.
async function fetchProfileWithTokenCheck() {
    const initialToken = Cookies.get('access_token')

    let response = await getWithAuth(
        '/api/auth/profile',
        initialToken,
    )

    if (response.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
            response = await getWithAuth(
                '/api/auth/profile',
                refreshed,
            )
        } else {
            clearAuthArtifacts()
            const unauthorizedError = new Error(
                UNAUTHORIZED_ERROR,
            )
            unauthorizedError.name = UNAUTHORIZED_ERROR
            throw unauthorizedError
        }
    }

    return response
}

export function useProfile(): ProfileState {
    // Контракт хука: отдаёт профиль, флаги загрузки/ошибок и refetch.
    // Стратегия: (1) мгновенно пробуем взять кеш из localStorage; (2) в фоне тянем актуальные
    // данные с бэка с обновлением токена при 401; (3) кешируем свежий ответ для следующих заходов.
    const [profile, setProfile] =
        useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Быстрая отрисовка: пробуем поднять профиль из localStorage, пока идёт сетевой запрос.
    // Не блокируем сетевой вызов, а лишь уменьшаем время до первой отрисовки.
    const hydrateFromCache = useCallback(() => {
        try {
            const cached =
                typeof window !== 'undefined'
                    ? localStorage.getItem('profile_cache')
                    : null
            if (cached) {
                const parsed = JSON.parse(
                    cached,
                ) as UserProfile
                setProfile(parsed)
                setLoading(false)
            }
        } catch (e) {
            console.warn('Profile cache read failed', e)
        }
    }, [])

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Запрашиваем профиль через helper, который сам обновит токен при 401
            const response =
                await fetchProfileWithTokenCheck()

            // Логическая ошибка (403/404/500 и т.п.) — показываем пользователю и чистим стейт.
            if (!response.ok) {
                setError('Не удалось загрузить профиль')
                setProfile(null)
                return
            }

            const data = await response.json()
            setProfile(data ?? null)

            try {
                // Кладём свежие данные в кеш, чтобы следующий заход был мгновенным.
                // В Safari в приватном режиме localStorage может бросить ошибку — поэтому try/catch.
                if (typeof window !== 'undefined' && data) {
                    localStorage.setItem(
                        'profile_cache',
                        JSON.stringify(data),
                    )
                }
            } catch (e) {
                console.warn(
                    'Profile cache write failed',
                    e,
                )
            }
        } catch (err) {
            if (
                err instanceof Error &&
                err.message === UNAUTHORIZED_ERROR
            ) {
                setError(UNAUTHORIZED_ERROR)
                setProfile(null)
                clearAuthArtifacts()
                if (typeof window !== 'undefined') {
                    window.location.href = '/auth/login'
                }
                return
            }

            // Сетевые/неожиданные ошибки. Показываем общий текст, чтобы не раскрывать детали.
            console.error('Profile fetch error', err)
            setError('Ошибка сети')
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Сначала пытаемся отрисовать из кеша, затем подтягиваем актуальные данные из сети
        hydrateFromCache()
        void fetchProfile()
    }, [fetchProfile, hydrateFromCache])

    return {
        profile,
        loading,
        error,
        refetch: fetchProfile,
    }
}
