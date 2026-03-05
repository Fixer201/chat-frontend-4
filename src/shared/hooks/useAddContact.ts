// @shared/hooks/useAddContact.ts
import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { addContacts } from '@redux/slices/contactsSlice'
import { Contact } from '@shared/types/contact'
import toast from 'react-hot-toast'

// Ответ от API при добавлении контакта
interface ApiAddedContact {
    uid: string
    phone: string
    first_name: string
    last_name: string
    avatar: string | null
    avatar_url: string | null
    avatar_webp: string | null
    avatar_webp_url: string | null
    is_online: boolean
    was_online_at: number | null
}

// Элемент ответа от /api/v1/contact/check/full-list/
interface CheckFullListResponseItem {
    uid: string
    phone: string
    is_online: boolean
    first_name?: string
    last_name?: string
    // могут быть и другие поля
}

export function useAddContact() {
    const [isAdding, setIsAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fetchData = useApiFetcher()
    const dispatch = useDispatch()

    const addContact = useCallback(
        async (contact: Contact) => {
            setIsAdding(true)
            setError(null)

            try {
                let phoneToUse = contact.phone
                let firstNameToUse = contact.firstName || ''
                let lastNameToUse = contact.lastName || ''
                let uidToUse = contact.uid

                // Если нет телефона, но есть никнейм – пытаемся получить телефон через lookup
                if (!phoneToUse && contact.nickname) {
                    console.log(
                        'No phone, trying to get phone by nickname:',
                        contact.nickname,
                    )
                    const lookupResponse = await fetchData(
                        '/api/v1/contact/check/full-list/',
                        {
                            method: 'POST',
                            body: JSON.stringify([
                                {
                                    phone_or_nickname:
                                        contact.nickname,
                                },
                            ]),
                        },
                    )
                    const lookupArray = Array.isArray(
                        lookupResponse,
                    )
                        ? lookupResponse
                        : []
                    if (lookupArray.length > 0) {
                        const item =
                            lookupArray[0] as CheckFullListResponseItem
                        phoneToUse = item.phone
                        uidToUse = item.uid
                        // Если в исходном контакте не было имени, берём из ответа
                        if (!firstNameToUse)
                            firstNameToUse =
                                item.first_name || ''
                        if (!lastNameToUse)
                            lastNameToUse =
                                item.last_name || ''
                    } else {
                        throw new Error(
                            'Пользователь с таким никнеймом не найден',
                        )
                    }
                }

                // Если телефон так и не получили – ошибка
                if (!phoneToUse) {
                    throw new Error(
                        'Недостаточно данных для добавления контакта (нет телефона или никнейма)',
                    )
                }

                // Формируем тело запроса
                const body = {
                    phone: phoneToUse,
                    first_name: firstNameToUse,
                    last_name: lastNameToUse,
                }

                console.log(
                    'Отправка запроса на добавление контакта:',
                    body,
                )

                // Добавляем контакт через API
                const response: ApiAddedContact =
                    await fetchData(
                        '/api/v1/contact/messenger-add-by-phone/',
                        {
                            method: 'POST',
                            body: JSON.stringify(body),
                        },
                    )

                // Маппим ответ в Contact и сохраняем в Redux
                const newContact: Contact = {
                    uid: response.uid,
                    userUid: response.uid,
                    username: '',
                    nickname: contact.nickname || '',
                    phone: response.phone,
                    firstName: response.first_name,
                    lastName: response.last_name,
                    patronymic: '',
                    avatar: response.avatar,
                    avatarUrl: response.avatar_url,
                    avatarWebp: response.avatar_webp,
                    avatarWebpUrl: response.avatar_webp_url,
                    additionalInformation: '',
                    birthday: 0,
                    chatId: 0,
                    isOnline: response.is_online,
                    wasOnlineAt: response.was_online_at,
                }

                dispatch(addContacts(newContact))
                //toast.success('Контакт добавлен')
            } catch (error: unknown) {
                console.error(
                    'Ошибка при добавлении контакта:',
                    error,
                )

                if (error instanceof Error) {
                    const errorMessage = error.message

                    // Сервер может вернуть 400, если контакт уже существует – считаем это успехом
                    if (
                        errorMessage.includes('400') &&
                        errorMessage.includes(
                            'Этот контакт уже существует',
                        )
                    ) {
                        //toast.success('Контакт добавлен')
                        return
                    }

                    // Обработка типовых ошибок
                    if (errorMessage.includes('401')) {
                        toast.error(
                            'Необходимо авторизоваться',
                        )
                    } else if (
                        errorMessage.includes('404')
                    ) {
                        toast.error(
                            'Пользователь не найден',
                        )
                    } else if (
                        errorMessage.includes('500')
                    ) {
                        toast.error(
                            'Ошибка сервера, попробуйте позже',
                        )
                    } else {
                        toast.error(
                            errorMessage ||
                                'Ошибка при добавлении контакта',
                        )
                    }

                    setError(errorMessage)
                } else {
                    toast.error('Неизвестная ошибка')
                    setError('Unknown error')
                }

                throw error
            } finally {
                setIsAdding(false)
            }
        },
        [fetchData, dispatch],
    )

    return { addContact, isAdding, error }
}
