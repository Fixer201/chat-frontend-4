// @shared/hooks/useContactData.ts
import { useState, useEffect } from 'react'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'

// Локальное определение типа Contact (на основе ваших типов)
export interface Contact {
    uid: string
    userUid: string
    username?: string | ''
    nickname?: string | ''
    phone?: string
    firstName?: string
    lastName?: string
    patronymic?: string
    avatar?: string | null
    avatarUrl?: string | null
    avatarWebp?: string | null
    avatarWebpUrl?: string | null
    additionalInformation?: string
    birthday?: number
    chatId?: number
    isOnline: boolean
    wasOnlineAt: number | string | Date | null
}

// Тип для данных контакта из API /api/v1/contact/{user_uid}/ (snake_case)
export interface ContactData {
    uid: string
    userUid: string
    username: string
    nickname: string
    first_name: string
    last_name: string
    avatar: string
    avatar_url: string
    avatar_webp: string
    avatar_webp_url: string
    is_filled: boolean
    additional_information: string
    birthday: number
    is_online: boolean
    was_online_at: number
    is_blocked: boolean
}

export function useContactData(userUid: string) {
    const [data, setData] = useState<Contact | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fetchData = useApiFetcher()

    useEffect(() => {
        // Сброс состояния при пустом UID (переход в группу/канал)
        if (!userUid) {
            setData(null)
            setError(null)
            setLoading(false)
            return
        }

        const loadContactData = async () => {
            setLoading(true)
            setError(null)
            try {
                const response: ContactData =
                    await fetchData(
                        `/api/v1/contact/${userUid}/`,
                        { method: 'GET' },
                    )
                // Маппинг из ContactData в Contact (camelCase)
                const mappedContact: Contact = {
                    uid: response.uid,
                    userUid: response.uid,
                    username: response.username || '',
                    nickname: response.nickname || '',
                    phone: '', // API не возвращает, ставим пустую строку
                    firstName: response.first_name,
                    lastName: response.last_name,
                    patronymic: '', // Не в API, пустая строка
                    avatar: response.avatar,
                    avatarUrl: response.avatar_url,
                    avatarWebp: response.avatar_webp,
                    avatarWebpUrl: response.avatar_webp_url,
                    additionalInformation:
                        response.additional_information,
                    birthday: response.birthday,
                    chatId: 0, // Не в API, ставим 0
                    isOnline: response.is_online,
                    wasOnlineAt: response.was_online_at,
                }
                setData(mappedContact)
            } catch (err) {
                if (
                    err instanceof Error &&
                    err.message.includes('404')
                ) {
                    console.log(
                        'Пользователь не найден, используем fallback',
                    )
                    setData(null)
                } else {
                    console.error(
                        'Ошибка загрузки данных контакта:',
                        err,
                    )
                    setError(
                        'Не удалось загрузить данные контакта',
                    )
                }
            } finally {
                setLoading(false)
            }
        }

        loadContactData()
    }, [userUid, fetchData])

    return { data, loading, error }
}
