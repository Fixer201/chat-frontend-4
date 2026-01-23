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
            console.error('Refresh token не найден')
            throw new Error('RefreshTokenNotFound') // Специальная ошибка для отсутствия refresh token
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
                // Refresh token истек (404) — выбрасываем специальную ошибку
                throw new Error('RefreshTokenExpired')
            } else {
                console.error(
                    'Ошибка refresh token:',
                    response.status,
                )
                return null
            }
        } catch (err) {
            console.error('Ошибка refreshing token:', err)
            throw err // Пробрасываем ошибку дальше
        }
    }, [])

    const fetchData = useCallback(
        async (url: string, options: FetchOptions = {}) => {
            const accessToken = Cookies.get('access_token')
            const csrfToken =
                Cookies.get('csrftoken') ||
                Cookies.get('X-CSRFTOKEN')
            if (!accessToken) {
                console.error('Access token не найден')
                throw new Error('AccessTokenNotFound')
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
                        throw new Error(
                            'Не удалось обновить токен',
                        )
                    }
                } catch (refreshError) {
                    // Если refresh не удался, пробрасываем ошибку
                    throw refreshError
                }
            }

            if (!response.ok) {
                throw new Error(
                    `Ошибка API: ${response.status} ${response.statusText}`,
                )
            }

            return await response.json()
        },
        [refreshAccessToken],
    )

    return fetchData
}
