// Генератор моковых данных для чатов (для тестирования/разработки)
/**
 * Генерирует массив моковых данных для чатов
 * @param count - количество элементов для генерации
 * @returns Promise<ChatItem[]> - массив объектов ChatItem
 */

import { ApiChatItem } from '@shared/types/chat'
import { generateAvatarUrl } from './avatarGenerator'
import { AVATAR_SOURCES } from './avatarSources'
import { saveGroupParticipants } from '@shared/lib/localStorageGroupParticipants'
import { GroupParticipant } from '@shared/types/contact'

const CURRENT_USER_UID = 'current-user-uid'

/**
 * Генерирует моковых участников для группы или канала.
 * Подходит как для групп, так и для каналов (владелец/администратор и остальные участники/подписчики).
 */
function generateMockGroupParticipants(
    chat: ApiChatItem,
    seed: number,
): GroupParticipant[] {
    const firstNames = [
        'Алексей',
        'Мария',
        'Сергей',
        'Екатерина',
        'Дмитрий',
        'Ольга',
        'Иван',
        'Анна',
        'Михаил',
        'Наталья',
    ]
    const lastNames = [
        'Петров',
        'Иванова',
        'Смирнов',
        'Кузнецова',
        'Федоров',
        'Николаева',
        'Воробьев',
        'Павлова',
        'Козлов',
        'Орлова',
    ]

    const count = 2 + (seed % 5) // от 2 до 6 участников
    const participants: GroupParticipant[] = []

    // Определяем, будет ли владелец текущим пользователем (по чётности seed)
    const isOwnerCurrentUser = seed % 2 === 0

    // Владелец (создатель / администратор)
    if (isOwnerCurrentUser) {
        participants.push({
            uid: CURRENT_USER_UID,
            firstName: 'Я',
            lastName: '',
            avatarUrl: '/images/chatHeader/userAvatar.svg',
            avatarWebpUrl:
                '/images/chatHeader/userAvatar.svg',
            isOwner: true,
            isBlocked: false,
            isOnline: true,
            wasOnlineAt: Date.now(),
            isInContacts: true,
        })
    } else {
        participants.push({
            uid: `owner-${chat.id}`,
            firstName: 'Создатель',
            lastName: '',
            avatarUrl: '/images/chatHeader/userAvatar.svg',
            avatarWebpUrl:
                '/images/chatHeader/userAvatar.svg',
            isOwner: true,
            isBlocked: false,
            isOnline: true,
            wasOnlineAt: Date.now(),
            isInContacts: true,
        })
    }

    for (let i = 1; i < count; i++) {
        const idx = (seed + i) % firstNames.length
        participants.push({
            uid: `participant-${chat.id}-${i}`,
            firstName: firstNames[idx],
            lastName: lastNames[idx],
            avatarUrl: '/images/chatHeader/userAvatar.svg',
            avatarWebpUrl:
                '/images/chatHeader/userAvatar.svg',
            isOwner: false,
            isBlocked: false,
            isOnline: Math.random() > 0.5,
            wasOnlineAt:
                Date.now() -
                Math.floor(Math.random() * 3600000),
            isInContacts: Math.random() > 0.3,
        })
    }
    return participants
}

// Функция генерации моковых данных чатов
// Фиксированные UID из ContactsListDB для синхронизации с контактами
const CONTACT_UIDS = [
    '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Влад Ляшев
    '3fa85f64-5717-4562-b3fc-2c963f66afa9', // Сергей Авдиев
    '3fa85f64-5717-4562-b3fc-2c963f66afa8', // Алла Свиридова
    '3fa85f64-5717-4562-b3fc-2c963f66afa7', // Егор Петухов
    '3fa85f64-5717-4562-b3fc-2c963f66afb1', // Инна Сивакова
    '3fa85f64-5717-4562-b3fc-2c963f66afb2', // Артем Галозин
    '3fa85f64-5717-4562-b3fc-2c963f66afb3', // Татьяна Пашина
    '3fa85f64-5717-4562-b3fc-2c963f66afb9', // Евгений Солнышков
    '3fa85f64-5717-4562-b3fc-2c963f66afr5', // Анастасия Христорождественская
]

// Функция генерации моковых данных чатов
// Используется для разработки и тестирования без бэкенда
export function generateLocalMockChatItems(
    count: number,
): ApiChatItem[] {
    // Массивы тестовых данных для реалистичных имен и сообщений
    const firstNames = [
        'Алексей',
        'Мария',
        'Сергей',
        'Екатерина',
        'Дмитрий',
        'Ольга',
        'Иван',
        'Анна',
        'Михаил',
        'Наталья',
        'Андрей',
        'Татьяна',
        'Павел',
        'Елена',
        'Владимир',
    ]
    const lastNames = [
        'Петров',
        'Иванова',
        'Смирнов',
        'Кузнецова',
        'Федоров',
        'Николаева',
        'Воробьев',
        'Павлова',
        'Козлов',
        'Орлова',
        'Соколов',
        'Морозова',
        'Волков',
        'Зайцева',
        'Попов',
    ]
    const nicknames = [
        'Alex',
        'Maria',
        'Sergey',
        'Kate',
        'Dima',
        'Olga',
        'Ivan',
        'Anna',
        'Misha',
        'Natasha',
        'Andrey',
        'Tanya',
        'Pavel',
        'Lena',
        'Vlad',
    ]
    // Массивы названий для групп и каналов
    const groupNames = [
        'Команда Разработки',
        'Дизайн-Отдел',
        'Продажи и Маркетинг',
        'Поддержка Клиентов',
        'Менеджмент',
        'Коллектив Офиса',
        'Совместные Проекты',
        'Встречи и Обсуждения',
        'Общий Чат Компании',
        'Вне работы',
        'Спортивные Увлечения',
        'Творческая Лаборатория',
        'ИТ-Поддержка',
        'Обучение и Развитие',
        'Корпоративные Мероприятия',
    ]

    const channelNames = [
        'Новости Компании',
        'Анонсы и Объявления',
        'Технические Обновления',
        'Мероприятия и Афиши',
        'Важные Оперативные',
        'Нормативные Документы',
        'Отчеты и Статистика',
        'Идеи и Предложения',
        'Безопасность и Соблюдение',
        'Инновации и Тренды',
        'Истории Успеха',
        'Образовательные Материалы',
        'Карьерные Возможности',
        'Корпоративная Культура',
        'Партнерские Новости',
    ]
    const messages = [
        'Привет! Как дела?',
        'Посмотри это видео, оно просто огонь!',
        'Когда встречаемся? Надо обсудить проект',
        'Отправляю тебе файлы по проекту',
        'Давай созвонимся завтра?',
        'Я уже дома, а ты?',
        'Посмотри это фото, как тебе?',
        'Надо срочно решить этот вопрос',
        'Когда будет готов отчет?',
        'Жду твоего ответа',
    ]

    // Текущее время в секундах (Unix timestamp)
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60
    const AVATAR_SOURCE = AVATAR_SOURCES.RANDOM_USER

    return Array(count)
        .fill(null)
        .map((_, index) => {
            const chatTypes = [
                'chat',
                'public-group',
                'private-group',
                'public-channel',
                'private-channel',
            ] as const

            let chatType: (typeof chatTypes)[number]
            const randomValue = Math.random()

            if (randomValue < 0.7) {
                chatType = 'chat'
            } else if (randomValue < 0.9) {
                chatType =
                    Math.random() > 0.5
                        ? 'public-group'
                        : 'private-group'
            } else {
                chatType =
                    Math.random() > 0.5
                        ? 'public-channel'
                        : 'private-channel'
            }

            let avatarSource =
                '/images/chatHeader/userAvatar.svg'

            const firstName =
                firstNames[index % firstNames.length]
            const lastName =
                lastNames[index % lastNames.length]
            const nickname =
                nicknames[index % nicknames.length]

            let username: string
            let chatName: string
            let avatarSeed: string
            const message =
                messages[index % messages.length]
            const baseId = (index + 1) * 100

            if (chatType === 'chat') {
                chatName = `${firstName} ${lastName}`
                username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
                avatarSeed = `avatar_${baseId}_${username}`
                const chatAvatarUrl = generateAvatarUrl(
                    avatarSeed,
                    300,
                    300,
                    AVATAR_SOURCE,
                )
                avatarSource = chatAvatarUrl
            } else if (chatType.includes('group')) {
                const groupName =
                    groupNames[index % groupNames.length]
                chatName = groupName
                username = `group_${index + 1}_${groupName.toLowerCase().replace(/ /g, '_')}`
                avatarSource =
                    '/images/chatHeader/userAvatar.svg'
            } else {
                const channelName =
                    channelNames[
                        index % channelNames.length
                    ]
                chatName = channelName
                username = `channel_${index + 1}_${channelName.toLowerCase().replace(/ /g, '_')}`
                avatarSource =
                    '/images/chatHeader/userAvatar.svg'
            }

            const avatarUrl = avatarSource
            const avatarWebpUrl = avatarSource

            const randomSecondsAgo = Math.floor(
                Math.random() * thirtyDaysInSeconds,
            )
            const wasOnlineAt =
                nowInSeconds - randomSecondsAgo

            const sevenDaysInSeconds = 7 * 24 * 60 * 60
            const recentSecondsAgo = Math.floor(
                Math.random() * sevenDaysInSeconds,
            )
            const lastActivityAt =
                nowInSeconds - recentSecondsAgo

            const oneDayInSeconds = 24 * 60 * 60
            const messageSecondsAgo = Math.floor(
                Math.random() * oneDayInSeconds,
            )
            const messageCreatedAt =
                lastActivityAt - messageSecondsAgo

            const fiveMinutesAgo = nowInSeconds - 300
            const isOnline =
                wasOnlineAt >= fiveMinutesAgo
                    ? Math.random() > 0.3
                    : Math.random() > 0.8

            const chatItem: ApiChatItem = {
                id: baseId,
                chat: {
                    uid: `uuid-${index}-${Math.random().toString(36).substring(2, 10)}`,
                    username: username,
                    nickname: nickname,
                    first_name: firstName,
                    last_name: lastName,
                    avatar: avatarSource.replace(
                        '/images/chatHeader/',
                        '',
                    ),
                    avatar_url: avatarUrl,
                    avatar_webp: avatarSource
                        .replace('/images/chatHeader/', '')
                        .replace('.svg', '.webp'),
                    avatar_webp_url: avatarWebpUrl,
                    is_blocked: index % 10 === 0,
                    is_online: isOnline,
                    was_online_at: wasOnlineAt,
                    is_in_contacts: index % 4 !== 0,
                },
                is_active: index % 2 === 0,
                is_favorite: index % 6 === 0,
                notifications: Math.random() > 0.5,
                index: index,
                message_count: Math.floor(
                    Math.random() * 10,
                ),
                file_count: Math.floor(Math.random() * 5),
                new_message_count: Math.floor(
                    Math.random() * 10,
                ),
                new_file_count: Math.floor(
                    Math.random() * 5,
                ),
                description: chatType.includes('channel')
                    ? `Канал о ${chatName.toLowerCase()}`
                    : undefined,
                created_by:
                    chatType !== 'chat'
                        ? 'system'
                        : undefined,
                owner_full_name:
                    chatType !== 'chat'
                        ? 'Администратор'
                        : undefined,
                participants:
                    chatType !== 'chat'
                        ? [
                              {
                                  uid: 'user1',
                                  full_name: 'Иван Иванов',
                              },
                              {
                                  uid: 'user2',
                                  full_name:
                                      'Мария Петрова',
                              },
                          ]
                        : undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                name: chatName,
                chat_type: chatType,
                chat_key: `chat_key_${index}`,
                last_activity_at: lastActivityAt,
                last_seen_message: {
                    id: baseId - 1,
                    uid: `msg_${baseId - 1}`,
                },
                first_new_message: {
                    id: baseId,
                    uid: `msg_${baseId}`,
                },
                last_message: {
                    id: baseId + 1,
                    uid: `msg_${baseId + 1}`,
                    from_user:
                        chatType === 'chat'
                            ? `uuid-${index}`
                            : 'Вы',
                    content: message,
                    files_summary: {
                        types:
                            Math.random() > 0.5
                                ? ['image']
                                : ['document'],
                        count: Math.floor(
                            Math.random() * 5,
                        ),
                    },
                    has_replied_message:
                        Math.random() > 0.7,
                    has_forwarded_message:
                        Math.random() > 0.8,
                    new: Math.random() > 0.5,
                    created_at: messageCreatedAt,
                    updated_at:
                        messageCreatedAt +
                        Math.floor(Math.random() * 60),
                },
            }

            // Сохраняем участников для групп И каналов
            if (
                chatType.includes('group') ||
                chatType.includes('channel')
            ) {
                const participants =
                    generateMockGroupParticipants(
                        chatItem,
                        index,
                    )
                saveGroupParticipants(
                    chatItem.chat_key,
                    participants,
                )
            }

            return chatItem
        })
}
