import { useEffect, useState, useCallback } from 'react'
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

async function refreshAccessToken() {
    const refreshToken = Cookies.get('refresh_token')
    if (!refreshToken) return null

    const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (data?.access) {
        Cookies.set('access_token', data.access, {
            expires: 7,
        })
        return data.access as string
    }

    return null
}

export function useProfile(): ProfileState {
    const [profile, setProfile] =
        useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Быстрая отрисовка: пробуем поднять профиль из localStorage, пока идёт сетевой запрос
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
            const accessToken = Cookies.get('access_token')
            let response = await getWithAuth(
                '/api/auth/profile',
                accessToken,
            )

            if (response.status === 401) {
                const refreshed = await refreshAccessToken()
                if (refreshed) {
                    response = await getWithAuth(
                        '/api/auth/profile',
                        refreshed,
                    )
                }
            }

            if (!response.ok) {
                setError('Не удалось загрузить профиль')
                setProfile(null)
                return
            }

            const data = await response.json()
            setProfile(data ?? null)

            try {
                // Кладём свежие данные в кеш, чтобы следующий заход был мгновенным
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
            console.error('Profile fetch error', err)
            setError('Ошибка сети')
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
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
