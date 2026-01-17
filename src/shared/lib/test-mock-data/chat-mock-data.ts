// Генератор моковых данных для чатов (для тестирования/разработки)
/**
 * Генерирует массив моковых данных для чатов
 * @param count - количество элементов для генерации
 * @returns Promise<ChatItem[]> - массив объектов ChatItem
 */

import { ApiChatItem } from '@shared/types/chat'
import { generateAvatarUrl } from './avatarGenerator'
import { AVATAR_SOURCES } from './avatarSources'

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
    // Используется для генерации реалистичных временных меток
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60 // 30 дней в секундах
    const AVATAR_SOURCE = AVATAR_SOURCES.RANDOM_USER // Источник аватарок по умолчанию

    // Генерация массива чатов с помощью Array.fill и map
    return Array(count)
        .fill(null) // Создаем массив из count элементов со значением null
        .map((_, index) => {
            // Выбор данных из массивов по кругу с помощью оператора %
            // index % firstNames.length гарантирует, что индексы будут циклически повторяться
            const firstName =
                firstNames[index % firstNames.length]
            const lastName =
                lastNames[index % lastNames.length]
            const nickname =
                nicknames[index % nicknames.length]
            const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`
            const message =
                messages[index % messages.length]

            const baseId = (index + 1) * 100 // Создаем ID с шагом 100 для удобства отладки
            const avatarSeed = `avatar_${baseId}_${username}`
            const generators = [
                'picsum',
                'unsplash',
                'ui-faces',
                'random-user',
                'robohash',
            ] as const
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const generatorIndex = index % generators.length

            // Генерация URL аватарок с помощью вспомогательной функции
            // generateAvatarUrl создает детерминированные URL на основе seed
            const avatarUrl = generateAvatarUrl(
                avatarSeed,
                300,
                300,
                AVATAR_SOURCE,
            )

            const avatarWebpUrl = generateAvatarUrl(
                avatarSeed + '_webp',
                300,
                300,
                AVATAR_SOURCE,
            )

            // Генерация случайных временных меток для реалистичности
            const randomSecondsAgo = Math.floor(
                Math.random() * thirtyDaysInSeconds, // Случайное число секунд от 0 до 30 дней
            )
            const wasOnlineAt =
                nowInSeconds - randomSecondsAgo // Время последнего онлайна

            const sevenDaysInSeconds = 7 * 24 * 60 * 60
            const recentSecondsAgo = Math.floor(
                Math.random() * sevenDaysInSeconds,
            )
            const lastActivityAt =
                nowInSeconds - recentSecondsAgo // Время последней активности

            const oneDayInSeconds = 24 * 60 * 60
            const messageSecondsAgo = Math.floor(
                Math.random() * oneDayInSeconds,
            )
            const messageCreatedAt =
                lastActivityAt - messageSecondsAgo // Время создания сообщения

            const fiveMinutesAgo = nowInSeconds - 300
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const isOnline =
                wasOnlineAt >= fiveMinutesAgo
                    ? Math.random() > 0.3 // 70% шанс быть онлайн если был онлайн недавно
                    : Math.random() > 0.8 // 20% шанс быть онлайн если давно не было

            // Формирование объекта чата в формате API (snake_case)
            // Все поля соответствуют ApiChatItem интерфейсу
            const chatItem: ApiChatItem = {
                id: baseId,
                chat: {
                    uid: `uuid-${index}-${Math.random().toString(36).substring(2, 10)}`, // Генерация уникального UUID
                    username: username,
                    nickname: nickname,
                    first_name: firstName,
                    last_name: lastName,
                    avatar: `avatar_${index}.jpg`,
                    avatar_url: avatarUrl,
                    avatar_webp: `avatar_${index}.webp`,
                    avatar_webp_url: avatarWebpUrl,
                    is_blocked: index % 10 === 0, // Каждый 10-й чат заблокирован
                    is_online: index % 3 === 0, // Каждый 3-й онлайн
                    was_online_at: wasOnlineAt,
                    is_in_contacts: index % 4 !== 0, // 75% контактов в списке контактов
                },
                is_favorite: index % 6 === 0, // Каждый 6-й в избранном
                notifications: Math.random() > 0.5, // Случайные уведомления
                new_message_count: Math.floor(
                    Math.random() * 10, // Случайное количество новых сообщений (0-9)
                ),
                new_file_count: Math.floor(
                    Math.random() * 5, // Случайное количество новых файлов (0-4)
                ),
                name: `${firstName} ${lastName}`,
                chat_type: ['private', 'group', 'channel'][
                    index % 3
                ] as 'private' | 'group' | 'channel', // Циклически распределяем типы чатов
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
                    from_user: `uuid-${index}`,
                    content: message,
                    files_summary: {
                        types:
                            Math.random() > 0.5
                                ? ['image']
                                : ['document'], // Случайный тип файлов
                        count: Math.floor(
                            Math.random() * 5,
                        ),
                    },
                    has_replied_message:
                        Math.random() > 0.7, // 30% шанс иметь ответ
                    has_forwarded_message:
                        Math.random() > 0.8, // 20% шанс быть пересланным
                    new: Math.random() > 0.5, // 50% шанс быть новым
                    created_at: messageCreatedAt,
                    updated_at:
                        messageCreatedAt +
                        Math.floor(Math.random() * 60), // + до 60 секунд для updated_at
                },
            }
            return chatItem
        })
}
