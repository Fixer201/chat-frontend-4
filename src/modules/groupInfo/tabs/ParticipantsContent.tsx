// ParticipantsContent.tsx
'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import Cookies from 'js-cookie'
import {
    findGroupParticipantsByChatKey, // Поиск участников группы в localStorage по ключу чата
    saveGroupParticipants, // Сохранение участников группы в localStorage
} from '@shared/lib/localStorageGroupParticipants'
import {
    GroupParticipant, // Тип участника группы
    Contact, // Тип контакта
} from '@shared/types/contact'
import { contactsToGroupParticipants } from '@shared/lib/participantUtils' // Конвертация контактов в участников группы
import ContactsListGroup from '@modules/contacts/components/ContactsListGroup' // Компонент списка участников группы
import InviteMembersContent from './InviteMembersContent' // Компонент приглашения участников
import {
    setParticipants, // Экшен для установки списка участников в Redux
    removeParticipant, // Экшен для удаления участника из Redux
} from '@redux/slices/groupParticipantsSlice'
import { wsChatService } from '@shared/lib/webSocketChatService'
import { useProfile } from '@shared/hooks/useProfile'
// Тип для отображения: список участников или приглашение
type View = 'participants' | 'invite'

// Интерфейс пропсов компонента
interface ParticipantsContentProps {
    chatKey: string // Уникальный ключ чата
    onTitleChange?: (title: string | null) => void // Колбэк для изменения заголовка (родительский компонент)
    onParticipantsChange?: (count: number) => void // Колбэк при изменении количества участников
    isCurrentUserOwner?: boolean // Флаг, является ли текущий пользователь владельцем группы
}

export default function ParticipantsContent({
    chatKey,
    onTitleChange,
    onParticipantsChange,
    isCurrentUserOwner = false,
}: ParticipantsContentProps) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true) // Состояние загрузки
    const [owner, setOwner] =
        useState<GroupParticipant | null>(null) // Владелец группы
    const [participants, setParticipantsLocal] = useState<
        GroupParticipant[]
    >([]) // Остальные участники
    const [currentView, setCurrentView] =
        useState<View>('participants') // Текущий экран
    const [isInviting, setIsInviting] = useState(false) // Флаг процесса приглашения
    const [inviteError, setInviteError] = useState<
        string | null
    >(null) // Ошибка при приглашении
    const { profile } = useProfile()

    // Загрузка данных из localStorage и синхронизация с Redux
    useEffect(() => {
        setLoading(true)
        const data = findGroupParticipantsByChatKey(chatKey)
        if (data) {
            let processedData = data
            if (profile?.uid) {
                processedData = data.map((p) => {
                    if (p.uid === 'current-user-uid') {
                        return {
                            ...p,
                            uid: profile.uid,
                            firstName:
                                profile.first_name ||
                                p.firstName,
                            lastName:
                                profile.last_name ||
                                p.lastName,
                            avatarUrl:
                                profile.avatar_url ||
                                p.avatarUrl,
                            avatarWebpUrl:
                                profile.avatar_webp_url ||
                                p.avatarWebpUrl,
                        }
                    }
                    return p
                })
            }

            const ownerData =
                processedData.find((p) => p.isOwner) || null
            const otherParticipants = processedData.filter(
                (p) => !p.isOwner,
            )
            setOwner(ownerData)
            setParticipantsLocal(otherParticipants)
            dispatch(
                setParticipants({
                    chatKey,
                    participants: processedData,
                }),
            )
        } else {
            setOwner(null)
            setParticipantsLocal([])
            dispatch(
                setParticipants({
                    chatKey,
                    participants: [],
                }),
            )
        }
        setLoading(false)
    }, [chatKey, dispatch, profile])

    // Обновление счётчика участников при изменении списка
    useEffect(() => {
        const totalCount =
            (owner ? 1 : 0) + participants.length
        onParticipantsChange?.(totalCount)
    }, [owner, participants, onParticipantsChange])

    // Обновление заголовка в зависимости от текущего вида
    useEffect(() => {
        if (onTitleChange) {
            const title =
                currentView === 'invite'
                    ? 'Пригласить участников'
                    : 'Участники'
            onTitleChange(title)
        }
    }, [currentView, onTitleChange])

    // Обработчик приглашения участников (WebSocket -> localStorage fallback)
    const handleInvite = async (
        selectedContacts: Contact[],
    ) => {
        console.log(
            '\n=========================================',
        )
        console.log(
            '[ParticipantsContent] 🚀 Starting invite process',
        )
        console.log(
            '[ParticipantsContent] 📝 Chat key:',
            chatKey,
        )
        console.log(
            '[ParticipantsContent] 👥 Selected contacts:',
            selectedContacts.map((c) => ({
                uid: c.uid,
                name: `${c.firstName} ${c.lastName}`,
            })),
        )
        console.log(
            '=========================================',
        )

        setIsInviting(true)
        setInviteError(null)

        const accessToken = Cookies.get('access_token')
        let wsSuccess = false

        // ========== STEP 1: Try WebSocket first ==========
        if (accessToken) {
            console.log(
                '[ParticipantsContent] 📡 STEP 1: Trying WebSocket...',
            )
            try {
                const uids = selectedContacts.map(
                    (c) => c.uid,
                )
                console.log(
                    '[ParticipantsContent] 🔑 UIDs to invite:',
                    uids,
                )

                const result =
                    await wsChatService.addMembersToChat({
                        chat_key: chatKey,
                        uid_users_list: uids,
                    })

                console.log(
                    '[ParticipantsContent] 📥 WebSocket result:',
                    result,
                )

                if (result.success && result.result) {
                    console.log(
                        '[ParticipantsContent] ✅ WebSocket success, members added:',
                        result.result.added_users,
                    )
                    wsSuccess = true
                } else {
                    console.warn(
                        '[ParticipantsContent] ⚠️ WebSocket failed:',
                        result.error,
                    )
                }
            } catch (error) {
                console.error(
                    '[ParticipantsContent] ❌ WebSocket error:',
                    error,
                )
            }
        } else {
            console.log(
                '[ParticipantsContent] ⏳ No access token, skipping WebSocket',
            )
        }

        // ========== STEP 2: Fallback to localStorage ==========
        console.log(
            '[ParticipantsContent] 💾 STEP 2: Saving to localStorage...',
        )
        try {
            // Имитация задержки сети (только для UX)
            await new Promise((resolve) =>
                setTimeout(resolve, 500),
            )

            // Преобразуем выбранные контакты в участников группы
            const newParticipants =
                contactsToGroupParticipants(
                    selectedContacts,
                )
            const allParticipants = [
                ...participants,
                ...newParticipants,
            ]
            const fullList = owner
                ? [owner, ...allParticipants]
                : allParticipants

            // Сохраняем в localStorage
            saveGroupParticipants(chatKey, fullList)
            console.log(
                '[ParticipantsContent] ✅ Saved to localStorage',
            )

            // Обновляем локальное состояние
            setOwner(
                fullList.find((p) => p.isOwner) || null,
            )
            setParticipantsLocal(
                fullList.filter((p) => !p.isOwner),
            )

            // Обновляем Redux
            dispatch(
                setParticipants({
                    chatKey,
                    participants: fullList,
                }),
            )

            console.log(
                '[ParticipantsContent] ✅ State updated successfully',
            )

            // Возвращаемся к списку участников
            setCurrentView('participants')
        } catch (error) {
            console.error(
                '[ParticipantsContent] ❌ Error:',
                error,
            )
            setInviteError(
                error instanceof Error
                    ? error.message
                    : 'Ошибка при приглашении',
            )
        } finally {
            setIsInviting(false)
            console.log(
                '[ParticipantsContent] 🔐 Invite process finished',
            )
            console.log(
                '=========================================\n',
            )
        }
    }

    // Обработчик удаления участника
    const handleParticipantRemoved = (
        removedUid: string,
    ) => {
        // Фильтруем удалённого участника
        const newParticipants = participants.filter(
            (p) => p.uid !== removedUid,
        )
        const fullList = owner
            ? [owner, ...newParticipants]
            : newParticipants

        // Сохраняем в localStorage
        saveGroupParticipants(chatKey, fullList)

        // Обновляем локальное состояние
        setOwner(fullList.find((p) => p.isOwner) || null)
        setParticipantsLocal(
            fullList.filter((p) => !p.isOwner),
        )

        // Обновляем Redux (удаляем конкретного участника)
        dispatch(
            removeParticipant({ chatKey, uid: removedUid }),
        )
    }

    // Отмена приглашения - возврат к списку участников
    const handleCancelInvite = () => {
        setCurrentView('participants')
        setInviteError(null)
    }

    // Показать экран приглашения
    const handleShowInvite = () => {
        setCurrentView('invite')
        setInviteError(null)
    }

    // Состояние загрузки
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-text-gray">
                    Загрузка участников...
                </div>
            </div>
        )
    }

    // Полный список участников (владелец + остальные)
    const allParticipants = owner
        ? [owner, ...participants]
        : participants

    return (
        <div className="flex h-full flex-col">
            {currentView === 'participants' ? (
                // Список участников
                <ContactsListGroup
                    owner={owner}
                    participants={participants}
                    onInviteClick={handleShowInvite} // Кнопка "Пригласить"
                    chatKey={chatKey}
                    onParticipantRemoved={
                        handleParticipantRemoved
                    } // Удаление участника
                    canRemoveParticipants={
                        isCurrentUserOwner
                    } // Право на удаление
                />
            ) : (
                // Экран приглашения
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
