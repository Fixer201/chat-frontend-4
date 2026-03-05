'use client'

import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'
import {
    findGroupParticipantsByChatKey,
    saveGroupParticipants,
} from '@shared/lib/localStorageGroupParticipants'
import {
    GroupParticipant,
    Contact,
} from '@shared/types/contact'
import { contactsToGroupParticipants } from '@shared/lib/participantUtils'
import ContactsListGroup from '@modules/contacts/components/ContactsListGroup'
import InviteMembersContent from './InviteMembersContent'
import {
    setParticipants,
    removeParticipant,
} from '@redux/slices/groupParticipantsSlice'
import { wsChatService } from '@shared/lib/webSocketChatService'
import { useProfile } from '@shared/hooks/useProfile'
import { useApiFetcher } from '@shared/hooks/useApiFetcher' // добавляем хук для запросов

type View = 'participants' | 'invite'

interface ParticipantsContentProps {
    chatKey: string
    onTitleChange?: (title: string | null) => void
    onParticipantsChange?: (count: number) => void
    isCurrentUserOwner?: boolean
    onOwnerChanged?: () => void
}

// Тип ответа API для участника
interface ApiParticipant {
    uid: string
    is_deleted: boolean
    first_name: string
    last_name: string
    avatar_url: string
    avatar_webp_url: string
    is_owner: boolean
    is_blocked: boolean
    is_online: boolean
    was_online_at: number
    is_in_contacts: boolean
}

// Тип пагинированного ответа
interface ApiParticipantsResponse {
    count: number
    next: string | null
    previous: string | null
    results: ApiParticipant[]
}

export default function ParticipantsContent({
    chatKey,
    onTitleChange,
    onParticipantsChange,
    isCurrentUserOwner = false,
    onOwnerChanged,
}: ParticipantsContentProps) {
    const dispatch = useDispatch()
    const fetchData = useApiFetcher() // хук для API-запросов
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null) // состояние ошибки
    const [owner, setOwner] =
        useState<GroupParticipant | null>(null)
    const [participants, setParticipantsLocal] = useState<
        GroupParticipant[]
    >([])
    const [currentView, setCurrentView] =
        useState<View>('participants')
    const [isInviting, setIsInviting] = useState(false)
    const [inviteError, setInviteError] = useState<
        string | null
    >(null)
    const { profile } = useProfile()

    // Функция для загрузки участников с сервера
    const loadParticipantsFromApi =
        useCallback(async () => {
            setLoading(true)
            setError(null)
            try {
                // Запрашиваем первую страницу с максимальным размером (например, 100)
                // В будущем можно добавить пагинацию через page и page_size
                const response: ApiParticipantsResponse =
                    await fetchData(
                        `/api/v1/chat/list/groups_or_channels/${chatKey}/participants/?page_size=100`,
                        { method: 'GET' },
                    )

                // Трансформируем API-ответ в GroupParticipant[]
                const allParticipants: GroupParticipant[] =
                    response.results.map((p) => ({
                        uid: p.uid,
                        firstName: p.first_name,
                        lastName: p.last_name,
                        avatarUrl: p.avatar_url,
                        avatarWebpUrl: p.avatar_webp_url,
                        isOwner: p.is_owner,
                        isBlocked: p.is_blocked,
                        isOnline: p.is_online,
                        wasOnlineAt: p.was_online_at,
                        isInContacts: p.is_in_contacts,
                    }))

                // Разделяем на владельца и остальных
                const ownerData =
                    allParticipants.find(
                        (p) => p.isOwner,
                    ) || null
                const otherParticipants =
                    allParticipants.filter(
                        (p) => !p.isOwner,
                    )

                setOwner(ownerData)
                setParticipantsLocal(otherParticipants)

                // Сохраняем в Redux (для возможного использования в других местах)
                dispatch(
                    setParticipants({
                        chatKey,
                        participants: allParticipants,
                    }),
                )

                // Также можно обновить localStorage для офлайн-режима (опционально)
                saveGroupParticipants(
                    chatKey,
                    allParticipants,
                )
            } catch (err) {
                console.error(
                    'Ошибка загрузки участников:',
                    err,
                )
                setError('Не удалось загрузить участников')
            } finally {
                setLoading(false)
            }
        }, [chatKey, fetchData, dispatch])

    // Загружаем участников при монтировании и при изменении chatKey
    useEffect(() => {
        loadParticipantsFromApi()
    }, [loadParticipantsFromApi])

    // Обновление счётчика участников при изменении списка
    useEffect(() => {
        const totalCount =
            (owner ? 1 : 0) + participants.length
        onParticipantsChange?.(totalCount)
    }, [owner, participants, onParticipantsChange])

    // Обновление заголовка
    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    // Обработчик приглашения участников
    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        console.log('Invite process started...')
        setIsInviting(true)
        setInviteError(null)

        const accessToken = Cookies.get('access_token')

        // Попытка через WebSocket
        if (accessToken) {
            try {
                const uids = selectedContacts.map(
                    (c) => c.uid,
                )
                const result =
                    await wsChatService.addMembersToChat({
                        chat_key: chatKey,
                        uid_users_list: uids,
                    })
                if (result.success && result.result) {
                    console.log(
                        'WebSocket success, members added',
                    )
                } else {
                    console.warn(
                        'WebSocket failed:',
                        result.error,
                    )
                }
            } catch (error) {
                console.error('WebSocket error:', error)
            }
        }

        // После WebSocket (или если его нет) обновляем список с сервера
        try {
            // Можно добавить небольшую задержку, чтобы сервер успел обработать изменения
            await new Promise((resolve) =>
                setTimeout(resolve, 500),
            )
            await loadParticipantsFromApi() // перезагружаем актуальные данные
            setCurrentView('participants')
        } catch (error) {
            setInviteError(
                error instanceof Error
                    ? error.message
                    : 'Ошибка при приглашении',
            )
        } finally {
            setIsInviting(false)
        }
    }

    // Обработчик передачи прав владельца
    const handleTransferOwnership = useCallback(
        async (participant: GroupParticipant) => {
            try {
                const result =
                    await wsChatService.transferOwner({
                        chat_key: chatKey,
                        new_owner_uid: participant.uid,
                    })
                if (result.success && result.result) {
                    console.log('Права переданы')
                    // Обновляем список с сервера
                    await loadParticipantsFromApi()
                    onOwnerChanged?.()
                } else {
                    console.error(
                        'Ошибка передачи прав:',
                        result.error,
                    )
                    // Можно показать toast
                }
            } catch (error) {
                console.error('WebSocket error:', error)
            }
        },
        [chatKey, loadParticipantsFromApi, onOwnerChanged],
    )

    // Обработчик удаления участника
    const handleParticipantRemoved = useCallback(
        async (removedUid: string) => {
            // После удаления (которое должно быть выполнено через WebSocket в дочернем компоненте)
            // перезагружаем список
            await loadParticipantsFromApi()
            // Дополнительно удаляем из Redux (хотя перезагрузка уже обновит)
            dispatch(
                removeParticipant({
                    chatKey,
                    uid: removedUid,
                }),
            )
        },
        [chatKey, loadParticipantsFromApi, dispatch],
    )

    // Отмена приглашения
    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

    // Показать экран приглашения
    const handleShowInvite = () => {
        setCurrentView('invite')
        setInviteError(null)
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка участников...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-system-red">
                    {error}
                </div>
            </div>
        )
    }

    const allParticipants = owner
        ? [owner, ...participants]
        : participants

    return (
        <div className="flex h-full flex-col">
            {currentView === 'participants' ? (
                <ContactsListGroup
                    owner={owner}
                    participants={participants}
                    onInviteClick={handleShowInvite}
                    chatKey={chatKey}
                    onParticipantRemoved={
                        handleParticipantRemoved
                    }
                    canRemoveParticipants={
                        isCurrentUserOwner
                    }
                    onTransferOwnership={
                        handleTransferOwnership
                    }
                />
            ) : (
                <InviteMembersContent
                    currentParticipants={allParticipants}
                    onInvite={handleInvite}
                    onCancel={handleCancelInvite}
                    isInviting={isInviting}
                    error={inviteError}
                />
            )}
        </div>
    )
}
