'use client'

import { useMemo } from 'react'
import Cookies from 'js-cookie'

/**
 * Извлекает user_id из JWT access_token в cookies.
 * JWT payload содержит { user_id: string } — UUID текущего пользователя.
 */
export function useCurrentUserId(): string | null {
    return useMemo(() => {
        const token = Cookies.get('access_token')
        if (!token) return null

        try {
            const payload = JSON.parse(
                atob(token.split('.')[1]),
            )
            return (payload.user_id as string) ?? null
        } catch {
            return null
        }
    }, [])
}
