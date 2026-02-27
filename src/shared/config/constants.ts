import { Contact } from '@shared/types/contact'
import { Category } from '@shared/types/Emoji'
import TimeIcon from '@public/icons/messageComposer/emojiCategories/time.svg'
import EmotionIcon from '@public/icons/messageComposer/emojiCategories/smiley.svg'
import PeoplesIcon from '@public/icons/messageComposer/emojiCategories/people.svg'
import CatIcon from '@public/icons/messageComposer/emojiCategories/cat.svg'
import FoodDrinkIcon from '@public/icons/messageComposer/emojiCategories/food&drink.svg'
import TravelIcon from '@public/icons/messageComposer/emojiCategories/travel.svg'
import ObjectsIcon from '@public/icons/messageComposer/emojiCategories/objects.svg'
import SymbolsIcon from '@public/icons/messageComposer/emojiCategories/symbols.svg'
import FlagIcon from '@public/icons/messageComposer/emojiCategories/flag.svg'

export const APP_NAME = 'Chat App'
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
]

export const DEFAULT_AVATAR =
    '/images/chatHeader/userAvatar.svg'

export const ContactsListDB: Contact[] = [
    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        username: 'string',
        nickname: '@vlad',
        phone: '987654321',
        firstName: 'Влад',
        lastName: 'Ляшев',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: true,
        wasOnlineAt: 0,
    },
    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
        username: 'string',
        nickname: 'string',
        phone: '9132363070',
        firstName: 'Сергей',
        lastName: 'Авдиев',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: true,
        wasOnlineAt: 0,
    },
    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
        username: 'string',
        nickname: 'string',
        phone: '777777777',
        firstName: 'Алла',
        lastName: 'Свиридова',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: 1696161600000,
    },

    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
        username: 'string',
        nickname: '@egor',
        phone: 'string',
        firstName: 'Егор',
        lastName: 'Петухов',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '2025-12-26T10:00:00Z',
    },

    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
        username: 'string',
        nickname: 'string',
        phone: 'string',
        firstName: 'Инна',
        lastName: 'Сивакова',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '2025-12-25T12:00:00Z',
    },

    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
        username: 'string',
        nickname: 'string',
        phone: '91323655489',
        firstName: 'Артем',
        lastName: 'Галозин',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: 48,
    },

    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
        username: 'string',
        nickname: 'string',
        phone: '986525887',
        firstName: 'Татьяна',
        lastName: 'Пашина',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '22.01.2022',
    },

    {
        uid: '3fa85f64-5717-4562-b3fc-2c963f66afb9',
        userUid: '3fa85f64-5717-4562-b3fc-2c963f66afb9',
        username: 'string',
        nickname: 'string',
        phone: 'string',
        firstName: 'Евгений',
        lastName: 'Солнышков',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '22.03.2025',
    },
    {
        uid: '3fa85f64-5717-4562-b3fc-bfsgnshgfn5165',
        userUid: '3fa85f64-5717-4562-b3fc-bfsgnshgfn5165',
        username: 'string',
        nickname: 'string',
        phone: 'string',
        firstName: 'Евгений',
        lastName: 'Солнышков',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '22.03.2025',
    },
    {
        uid: '3fa85f64-5717-4562-b3fc-fhsdgnhs453543fdh',
        userUid:
            '3fa85f64-5717-4562-b3fc-fhsdgnhs453543fdh',
        username: 'string',
        nickname: 'string',
        phone: 'string',
        firstName: 'Евгений',
        lastName: 'Солнышков',
        patronymic: 'string',
        avatar: 'string',
        avatarUrl: '',
        avatarWebp: 'string',
        avatarWebpUrl: 'string',
        additionalInformation: 'string',
        birthday: 0,
        chatId: 0,
        isOnline: false,
        wasOnlineAt: '22.03.2025',
    },
]

export const STATUS_TEXTS = {
    online: 'в сети',
    justNow: 'был(а) только что',
    minutesAgo: (minutes: number): string =>
        `был(а) ${minutes} минут назад`,
    hoursAgo: (hours: number): string =>
        `был(а) ${hours} часов назад`,
    yesterdayAt: (hours: string, minutes: string): string =>
        `был(а) вчера в ${hours}:${minutes}`,
    dateAgo: (date: string): string => `был(а) ${date}`,
} as const

export const EMOJI_CATEGORIES: Category[] = [
    { name: 'Недавние', slug: 'recent', emoji: TimeIcon },
    {
        name: 'Эмоции',
        slug: 'smileys_emotion',
        emoji: EmotionIcon,
    },
    {
        name: 'Люди',
        slug: 'people_body',
        emoji: PeoplesIcon,
    },
    {
        name: 'Животные',
        slug: 'animals_nature',
        emoji: CatIcon,
    },
    {
        name: 'Еда и напитки',
        slug: 'food_drink',
        emoji: FoodDrinkIcon,
    },
    {
        name: 'Путешествие',
        slug: 'travel_places',
        emoji: TravelIcon,
    },
    {
        name: 'Объекты',
        slug: 'objects',
        emoji: ObjectsIcon,
    },
    {
        name: 'Символы',
        slug: 'symbols',
        emoji: SymbolsIcon,
    },
    { name: 'Флаги стран', slug: 'flags', emoji: FlagIcon },
] as const
