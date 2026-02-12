'use client'
// Унифицированный fetcher с авторизацией, refresh‑логикой и безопасным парсингом.
// Best practice: вся работа с токенами и ошибками централизована в одном месте.
import { useCallback } from 'react'
import Cookies from 'js-cookie'

interface FetchOptions extends RequestInit {
    body?: string
}

export const useApiFetcher = () => {
    // Обновление access token по refresh token.
    // Возвращает новый access token или null, если refresh недоступен.
    const refreshAccessToken = useCallback(async () => {
        const refreshToken = Cookies.get('refresh_token')
        if (!refreshToken) {
            console.warn('Refresh token не найден')
            Cookies.remove('access_token')
            Cookies.remove('refresh_token')
            return null
        }

        try {
            // Запрос на refresh идёт через локальный API роут,
            // чтобы скрыть детали авторизации от клиента.
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
                // Best practice: обновляем access token с разумным TTL.
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
            // Защита от некорректного URL (ранняя ошибка вместо падения fetch).
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

            // Базовые заголовки: авторизация, CSRF и content-type при наличии body.
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

            // Позволяем вызывающему коду переопределять заголовки при необходимости.
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
                // Токен истёк — пробуем refresh и повторяем запрос.
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
                // Собираем максимум диагностической информации без утечки токена.
                let errorBody = ''
                try {
                    errorBody = await response
                        .clone()
                        .text()
                } catch (readError) {
                    console.warn(
                        'Не удалось прочитать тело ошибки API:',
                        readError,
                    )
                }

                const sanitizedHeaders = Object.keys(
                    headers ?? {},
                ).reduce<Record<string, string>>(
                    (acc, key) => {
                        if (
                            key.toLowerCase() ===
                            'authorization'
                        ) {
                            return acc
                        }
                        acc[key] = headers[key]
                        return acc
                    },
                    {},
                )

                // Best practice: логируем контекст ошибки целиком,
                // чтобы быстрее найти причину (endpoint, метод, payload).
                console.error('Ошибка API (подробно):', {
                    url,
                    method: options.method ?? 'GET',
                    status: response.status,
                    statusText: response.statusText,
                    requestHeaders: sanitizedHeaders,
                    requestBody: options.body ?? null,
                    responseBody: errorBody || null,
                })

                return Promise.reject(
                    new Error(
                        `Ошибка API: ${response.status} ${response.statusText}`,
                    ),
                )
            }

            // 204 No Content — валидный успешный ответ без тела.
            if (response.status === 204) {
                return null
            }

            // Читаем тело как текст, чтобы корректно обработать non‑JSON ответы.
            const responseText = await response.text()
            if (!responseText) {
                return null
            }

            try {
                // Парсим JSON только если это действительно JSON.
                return JSON.parse(responseText)
            } catch (parseError) {
                // Best practice: возвращаем текст как есть, если JSON некорректен.
                console.warn(
                    'Ответ API не является JSON:',
                    parseError,
                )
                return responseText
            }
        },
        [refreshAccessToken],
    )

    return fetchData
}
