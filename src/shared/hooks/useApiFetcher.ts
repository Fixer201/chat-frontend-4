'use client'
import { useCallback } from 'react'
import Cookies from 'js-cookie'

interface FetchOptions extends RequestInit {
    body?: string
}

export const useApiFetcher = () => {
    const refreshAccessToken = useCallback(async () => {
        const refreshToken = Cookies.get('refresh_token')
        if (!refreshToken) {
            console.warn('Refresh token не найден')
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            return null
        }

        try {
            const response = await fetch(
                '/api/auth/refresh',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                },
            )
            if (response.ok) {
                const data = await response.json()
                Cookies.set('access_token', data.access, {
                    expires: 7,
                })
                return data.access
            } else if (response.status === 404) {
                // Refresh token истек (404) — чистим куки и возвращаем null,
                // чтобы вызывающая сторона могла спокойно редиректить без ошибок в консоли.
                console.warn(
                    'Refresh token истек (404), очищаем куки',
                )
                Cookies.remove('access_token')
                Cookies.remove('refresh_token')
                return null
            } else {
                console.warn(
                    'Ошибка refresh token:',
                    response.status,
                )
                return null
            }
        } catch (err) {
            console.warn('Ошибка refreshing token:', err)
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            return null
        }
    }, [])

    const fetchData = useCallback(
        async (url: string, options: FetchOptions = {}) => {
            if (
                !url ||
                typeof url !== 'string' ||
                url.trim() === ''
            ) {
                throw new Error(
                    `Invalid URL provided to fetchData: "${url}". URL must be a non-empty string.`,
                )
            }
            const accessToken = Cookies.get('access_token')
            const csrfToken =
                Cookies.get('csrftoken') ||
                Cookies.get('X-CSRFTOKEN')
            if (!accessToken) {
                console.warn('Access token не найден')
                return Promise.reject(
                    new Error('AccessTokenNotFound'),
                )
            }

            const baseHeaders: Record<string, string> = {
                accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                ...(csrfToken && {
                    'X-CSRFTOKEN': csrfToken,
                }),
                ...(options.body && {
                    'Content-Type': 'application/json',
                }),
            }

            const headers: Record<string, string> = {
                ...baseHeaders,
                ...(options.headers as Record<
                    string,
                    string
                >),
            }

            let response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            })

            if (response.status === 401) {
                console.log('Token истек, обновление')
                try {
                    const newAccessToken =
                        await refreshAccessToken()
                    if (newAccessToken) {
                        response = await fetch(url, {
                            ...options,
                            headers: {
                                ...headers,
                                Authorization: `Bearer ${newAccessToken}`,
                            },
                            credentials: 'include',
                        })
                    } else {
                        return Promise.reject(
                            new Error(
                                'AccessTokenNotFound',
                            ),
                        )
                    }
                } catch (refreshError) {
                    return Promise.reject(refreshError)
                }
            }

            if (!response.ok) {
                return Promise.reject(
                    new Error(
                        `Ошибка API: ${response.status} ${response.statusText}`,
                    ),
                )
            }

            return await response.json()
        },
        [refreshAccessToken],
    )

    return fetchData
}
