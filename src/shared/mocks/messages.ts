import { Message } from '@shared/types/message'

/** Идентификатор текущего пользователя для определения «своих» сообщений */
export const MOCK_CURRENT_USER_ID = 'user-me-123'

/** Идентификатор собеседника */
export const MOCK_OTHER_USER_ID = 'user-anna-456'

/** Ключ чата, по которому фильтруются сообщения */
export const MOCK_CHAT_KEY = 'mock-chat-001'

/**
 * Реалистичная 2-месячная переписка между друзьями (декабрь 2025 — февраль 2026).
 * Участники: «Я» (user-me-123) и Анна Павлова (user-anna-456).
 * Третьи лица (источники пересылок): Сергей Авдиев, Лена, Михаил Петров и др.
 */
export const MOCK_MESSAGES: Message[] = [
    // 5 декабря 2025, 14:23
    {
        uid: 'msg-001',
        chatKey: 'mock-chat-001',
        content: 'Привет! Как дела? Давно не виделись 😊',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733405020,
        updated_at: 1733405020,
    },
    // 5 декабря, 14:45
    {
        uid: 'msg-002',
        chatKey: 'mock-chat-001',
        content:
            'Привет! Да, давно) Все хорошо, работы много',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733406300,
        updated_at: 1733406300,
        delivered_at: 1733406301,
        read_at: 1733406350,
    },
    // 5 декабря, 14:47
    {
        uid: 'msg-003',
        chatKey: 'mock-chat-001',
        content:
            'У меня тоже... Проект новый запустили, сроки жёсткие 😓',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733406420,
        updated_at: 1733406420,
    },
    // 5 декабря, 15:02
    {
        uid: 'msg-004',
        chatKey: 'mock-chat-001',
        content:
            'Понимаю. Может в выходные встретимся? Погулять, кофе попить',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733407320,
        updated_at: 1733407320,
        delivered_at: 1733407322,
        read_at: 1733407400,
    },
    // 5 декабря, 15:10
    {
        uid: 'msg-005',
        chatKey: 'mock-chat-001',
        content: 'Да, давай! В субботу свободна днём',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733407800,
        updated_at: 1733407800,
    },
    // 7 декабря, 12:30 (суббота)
    {
        uid: 'msg-006',
        chatKey: 'mock-chat-001',
        content: 'Доброе утро! Во сколько встречаемся?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733576400,
        updated_at: 1733576400,
        delivered_at: 1733576402,
        read_at: 1733577000,
    },
    // 7 декабря, 12:40
    {
        uid: 'msg-007',
        chatKey: 'mock-chat-001',
        content: 'Привет! В 2 часа у парка норм?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733577000,
        updated_at: 1733577000,
    },
    // 7 декабря, 12:42
    {
        uid: 'msg-008',
        chatKey: 'mock-chat-001',
        content: 'Отлично 👍',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733577120,
        updated_at: 1733577120,
        delivered_at: 1733577121,
        read_at: 1733577180,
    },
    // 7 декабря, 18:20
    {
        uid: 'msg-009',
        chatKey: 'mock-chat-001',
        content:
            'Было классно сегодня! Спасибо за встречу ❤️',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733597600,
        updated_at: 1733597600,
    },
    // 7 декабря, 18:30
    {
        uid: 'msg-010',
        chatKey: 'mock-chat-001',
        content: 'Да, мне тоже! Давай чаще так будем 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733598000,
        updated_at: 1733598000,
        delivered_at: 1733598002,
        read_at: 1733598100,
    },
    // 10 декабря, 10:15
    {
        uid: 'msg-011',
        chatKey: 'mock-chat-001',
        content:
            'Слушай, помнишь мы говорили про того фронтенд-разраба?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733823300,
        updated_at: 1733823300,
    },
    // 10 декабря, 10:25
    {
        uid: 'msg-012',
        chatKey: 'mock-chat-001',
        content: 'Да, который в твоей компании работает?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733823900,
        updated_at: 1733823900,
        delivered_at: 1733823901,
        read_at: 1733824200,
    },
    // 10 декабря, 10:30 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-013',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1733824200,
        updated_at: 1733824200,
        forwardedMessages: [
            {
                uid: 'fwd-msg-001',
                content:
                    'Коллеги, у кого есть опыт с React Query? Нужна помощь с оптимизацией запросов',
                from_user: 'user-sergey-789',
                first_name: 'Сергей',
                last_name: 'Авдиев',
            },
        ],
    },
    // 10 декабря, 10:32
    {
        uid: 'msg-014',
        chatKey: 'mock-chat-001',
        content:
            'Ага, это он 😄 Всегда задаёт такие вопросы',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1733824320,
        updated_at: 1733824320,
        delivered_at: 1733824321,
        read_at: 1733824400,
    },
    // 12 декабря, 16:45
    {
        uid: 'msg-015',
        chatKey: 'mock-chat-001',
        content:
            'Кстати, ты на новогодний корпоратив идёшь?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734020700,
        updated_at: 1734020700,
    },
    // 12 декабря, 16:50
    {
        uid: 'msg-016',
        chatKey: 'mock-chat-001',
        content:
            'Наверное да, но не уверена ещё\nУ вас когда?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734021000,
        updated_at: 1734021000,
        delivered_at: 1734021002,
        read_at: 1734021100,
    },
    // 12 декабря, 16:52
    {
        uid: 'msg-017',
        chatKey: 'mock-chat-001',
        content: '20-го числа. У нас в ресторане будет',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734021120,
        updated_at: 1734021120,
    },
    // 12 декабря, 16:55 - ОТВЕТ НА СООБЩЕНИЕ
    {
        uid: 'msg-018',
        chatKey: 'mock-chat-001',
        content:
            'Круто! У нас только 27-го, уже почти на новый год 🎄',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734021300,
        updated_at: 1734021300,
        delivered_at: 1734021301,
        read_at: 1734021400,
        repliedMessages: [
            {
                uid: 'msg-017',
                content:
                    '20-го числа. У нас в ресторане будет',
                from_user: 'user-anna-456',
                first_name: 'Anna',
                last_name: 'Pavlova',
            },
        ],
    },
    // 15 декабря, 11:20
    {
        uid: 'msg-019',
        chatKey: 'mock-chat-001',
        content: 'Ты уже подарки начала покупать?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734258000,
        updated_at: 1734258000,
    },
    // 15 декабря, 11:30
    {
        uid: 'msg-020',
        chatKey: 'mock-chat-001',
        content:
            'Нет ещё 😅 Вечно откладываю на последний момент',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734258600,
        updated_at: 1734258600,
        delivered_at: 1734258602,
        read_at: 1734258700,
    },
    // 15 декабря, 11:32
    {
        uid: 'msg-021',
        chatKey: 'mock-chat-001',
        content:
            'Я тоже 😂\nДавай вместе на выходных съездим в торговый центр?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734258720,
        updated_at: 1734258720,
    },
    // 15 декабря, 11:35
    {
        uid: 'msg-022',
        chatKey: 'mock-chat-001',
        content: 'Отличная идея! В воскресенье?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734258900,
        updated_at: 1734258900,
        delivered_at: 1734258901,
        read_at: 1734259000,
    },
    // 15 декабря, 11:37
    {
        uid: 'msg-023',
        chatKey: 'mock-chat-001',
        content: 'Давай! Встречаемся в 12?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734259020,
        updated_at: 1734259020,
    },
    // 15 декабря, 11:38
    {
        uid: 'msg-024',
        chatKey: 'mock-chat-001',
        content: '👌',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734259080,
        updated_at: 1734259080,
        delivered_at: 1734259081,
        read_at: 1734259200,
    },
    // 17 декабря (воскресенье), 11:45
    {
        uid: 'msg-025',
        chatKey: 'mock-chat-001',
        content: 'Выхожу, буду минут через 20',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734430500,
        updated_at: 1734430500,
        delivered_at: 1734430501,
        read_at: 1734430600,
    },
    // 17 декабря, 11:50
    {
        uid: 'msg-026',
        chatKey: 'mock-chat-001',
        content: 'Окей, я уже на месте, жду у входа',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734430800,
        updated_at: 1734430800,
    },
    // 17 декабря, 17:30
    {
        uid: 'msg-027',
        chatKey: 'mock-chat-001',
        content:
            'Ты как, дошла? Я дома уже, ноги отваливаются 😂',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734451200,
        updated_at: 1734451200,
    },
    // 17 декабря, 17:35
    {
        uid: 'msg-028',
        chatKey: 'mock-chat-001',
        content:
            'Ага, тоже дома\nНо зато все подарки купили! Молодцы мы 💪',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734451500,
        updated_at: 1734451500,
        delivered_at: 1734451502,
        read_at: 1734451600,
    },
    // 20 декабря, 22:15 (после корпоратива Анны)
    {
        uid: 'msg-029',
        chatKey: 'mock-chat-001',
        content:
            'Корпоратив прошёл отлично! Было весело 🎉🍾',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734730500,
        updated_at: 1734730500,
    },
    // 20 декабря, 22:25
    {
        uid: 'msg-030',
        chatKey: 'mock-chat-001',
        content: 'Рада за тебя! Фотки будут? 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734731100,
        updated_at: 1734731100,
        delivered_at: 1734731101,
        read_at: 1734731200,
    },
    // 21 декабря, 10:30 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-031',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734774600,
        updated_at: 1734774600,
        forwardedMessages: [
            {
                uid: 'fwd-msg-002',
                content:
                    'Девочки, кто хочет в складчину на подарок шефу? Думаю взять хороший виски',
                from_user: 'user-lena-300',
                first_name: 'Лена',
                last_name: '',
            },
        ],
    },
    // 21 декабря, 10:37
    {
        uid: 'msg-032',
        chatKey: 'mock-chat-001',
        content:
            'У вас складчины на подарки? Классно, что так дружно 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734775020,
        updated_at: 1734775020,
        delivered_at: 1734775021,
        read_at: 1734775100,
    },
    // 23 декабря, 15:20
    {
        uid: 'msg-033',
        chatKey: 'mock-chat-001',
        content: 'Планы на новый год есть?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734963600,
        updated_at: 1734963600,
    },
    // 23 декабря, 15:27
    {
        uid: 'msg-034',
        chatKey: 'mock-chat-001',
        content: 'К родителям поеду, как обычно\nА ты?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1734964020,
        updated_at: 1734964020,
        delivered_at: 1734964021,
        read_at: 1734964100,
    },
    // 23 декабря, 15:30
    {
        uid: 'msg-035',
        chatKey: 'mock-chat-001',
        content:
            'Тоже к семье. Брат с женой приедут, будет большая компания',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1734964200,
        updated_at: 1734964200,
    },
    // 25 декабря, 12:00
    {
        uid: 'msg-036',
        chatKey: 'mock-chat-001',
        content:
            'Слушай, можешь помочь с советом по работе?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735128000,
        updated_at: 1735128000,
        delivered_at: 1735128001,
        read_at: 1735128300,
    },
    // 25 декабря, 12:05
    {
        uid: 'msg-037',
        chatKey: 'mock-chat-001',
        content: 'Конечно, говори',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735128300,
        updated_at: 1735128300,
    },
    // 25 декабря, 12:10
    {
        uid: 'msg-038',
        chatKey: 'mock-chat-001',
        content:
            'Мне предложили переход на другой проект. Более интересный, но команда незнакомая совсем. Не знаю, стоит ли соглашаться',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735128600,
        updated_at: 1735128600,
        delivered_at: 1735128602,
        read_at: 1735128900,
    },
    // 25 декабря, 12:15
    {
        uid: 'msg-039',
        chatKey: 'mock-chat-001',
        content:
            'Я бы на твоём месте попробовала. Новый опыт всегда полезен. А если что, можно же потом обратно перейти?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735128900,
        updated_at: 1735128900,
    },
    // 25 декабря, 12:17 - ОТВЕТ НА СООБЩЕНИЕ
    {
        uid: 'msg-040',
        chatKey: 'mock-chat-001',
        content:
            'Вообще да, ты права. Спасибо за совет! 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735129020,
        updated_at: 1735129020,
        delivered_at: 1735129021,
        read_at: 1735129100,
        repliedMessages: [
            {
                uid: 'msg-039',
                content:
                    'Я бы на твоём месте попробовала. Новый опыт всегда полезен. А если что, можно же потом обратно перейти?',
                from_user: 'user-anna-456',
                first_name: 'Anna',
                last_name: 'Pavlova',
            },
        ],
    },
    // 27 декабря, 21:00 (после корпоратива)
    {
        uid: 'msg-041',
        chatKey: 'mock-chat-001',
        content:
            'Наш корпоратив тоже прошёл хорошо! Правда устала очень 😴',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735333200,
        updated_at: 1735333200,
        delivered_at: 1735333201,
        read_at: 1735333500,
    },
    // 27 декабря, 21:08
    {
        uid: 'msg-042',
        chatKey: 'mock-chat-001',
        content: 'Понимаю 😂 Отдыхай!',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735333680,
        updated_at: 1735333680,
    },
    // 31 декабря, 23:55
    {
        uid: 'msg-043',
        chatKey: 'mock-chat-001',
        content:
            'С наступающим Новым Годом! 🎄🎁✨\nЖелаю тебе счастья, здоровья и исполнения всех желаний!',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735687500,
        updated_at: 1735687500,
    },
    // 1 января 2026, 00:02
    {
        uid: 'msg-044',
        chatKey: 'mock-chat-001',
        content:
            'И тебя с Новым Годом, дорогая! 🥂🎉\nПусть всё будет отлично в новом году!',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735687920,
        updated_at: 1735687920,
        delivered_at: 1735687921,
        read_at: 1735688000,
    },
    // 3 января, 14:30
    {
        uid: 'msg-045',
        chatKey: 'mock-chat-001',
        content: 'Как праздники прошли?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735911000,
        updated_at: 1735911000,
        delivered_at: 1735911001,
        read_at: 1735911300,
    },
    // 3 января, 14:35
    {
        uid: 'msg-046',
        chatKey: 'mock-chat-001',
        content:
            'Отлично! Много ели, много отдыхали 😄\nТы как?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735911300,
        updated_at: 1735911300,
    },
    // 3 января, 14:37
    {
        uid: 'msg-047',
        chatKey: 'mock-chat-001',
        content:
            'Тоже хорошо! Родители передавали тебе привет кстати',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1735911420,
        updated_at: 1735911420,
        delivered_at: 1735911421,
        read_at: 1735911500,
    },
    // 3 января, 14:38
    {
        uid: 'msg-048',
        chatKey: 'mock-chat-001',
        content:
            'Ой, как мило! Передай им тоже большой привет ❤️',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1735911480,
        updated_at: 1735911480,
    },
    // 9 января, 10:00 (возвращение на работу)
    {
        uid: 'msg-049',
        chatKey: 'mock-chat-001',
        content:
            'Первый рабочий день... Не хочу вставать 😭',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1736409600,
        updated_at: 1736409600,
    },
    // 9 января, 10:10
    {
        uid: 'msg-050',
        chatKey: 'mock-chat-001',
        content: 'Понимаю 😂 Держись!',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1736410200,
        updated_at: 1736410200,
        delivered_at: 1736410201,
        read_at: 1736410300,
    },
    // 12 января, 16:45 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-051',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1736698500,
        updated_at: 1736698500,
        forwardedMessages: [
            {
                uid: 'fwd-msg-003',
                content:
                    'Внимание! Завтра в офисе будут проблемы с электричеством с 14:00 до 16:00. Планируйте работу соответственно',
                from_user: 'user-mikhail-101',
                first_name: 'Михаил',
                last_name: 'Петров',
            },
        ],
    },
    // 12 января, 16:52
    {
        uid: 'msg-052',
        chatKey: 'mock-chat-001',
        content:
            'Ого, значит домой пораньше можно будет уйти? 😁',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1736698920,
        updated_at: 1736698920,
        delivered_at: 1736698921,
        read_at: 1736699000,
    },
    // 12 января, 16:54
    {
        uid: 'msg-053',
        chatKey: 'mock-chat-001',
        content:
            'Хотелось бы 😂 Но наверное просто в коворкинг пойдём',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1736699040,
        updated_at: 1736699040,
    },
    // 15 января, 19:30 - ОТРЕДАКТИРОВАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-054',
        chatKey: 'mock-chat-001',
        content:
            'Я таки согласилась на тот новый проект! Со следующей недели начинаю',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1736962200,
        updated_at: 1736962800,
        delivered_at: 1736962201,
        read_at: 1736962500,
    },
    // 15 января, 19:35
    {
        uid: 'msg-055',
        chatKey: 'mock-chat-001',
        content:
            'Ура! Поздравляю! 🎉 Уверена, всё будет отлично',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1736962500,
        updated_at: 1736962500,
    },
    // 20 января, 18:00 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-056',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1737388800,
        updated_at: 1737388800,
        delivered_at: 1737388801,
        read_at: 1737389000,
        forwardedMessages: [
            {
                uid: 'fwd-msg-004',
                content:
                    'Команда, отличная работа на прошлой неделе! Заказчик очень доволен результатами. Так держать!',
                from_user: 'user-kate-555',
                first_name: 'Екатерина',
                last_name: 'Смирнова',
            },
        ],
    },
    // 20 января, 18:03
    {
        uid: 'msg-057',
        chatKey: 'mock-chat-001',
        content: 'Приятно получать такие сообщения 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1737388980,
        updated_at: 1737388980,
        delivered_at: 1737388981,
        read_at: 1737389100,
    },
    // 20 января, 18:05
    {
        uid: 'msg-058',
        chatKey: 'mock-chat-001',
        content:
            'Точно! Молодец, всё правильно решила с переходом',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1737389100,
        updated_at: 1737389100,
    },
    // 25 января, 12:30
    {
        uid: 'msg-059',
        chatKey: 'mock-chat-001',
        content:
            'Привет! Давно не списывались. Как дела на новом проекте?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1737803400,
        updated_at: 1737803400,
    },
    // 25 января, 12:40
    {
        uid: 'msg-060',
        chatKey: 'mock-chat-001',
        content:
            'Привет! Всё хорошо, адаптируюсь потихоньку. Команда классная, правда задач очень много',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1737804000,
        updated_at: 1737804000,
        delivered_at: 1737804001,
        read_at: 1737804100,
    },
    // 25 января, 12:42 - ОТВЕТ НА СООБЩЕНИЕ
    {
        uid: 'msg-061',
        chatKey: 'mock-chat-001',
        content:
            'Это нормально на начальном этапе. Главное не перегружайся!',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1737804120,
        updated_at: 1737804120,
        repliedMessages: [
            {
                uid: 'msg-060',
                content:
                    'Привет! Всё хорошо, адаптируюсь потихоньку. Команда классная, правда задач очень много',
                from_user: 'user-me-123',
                first_name: 'me',
                last_name: '',
            },
        ],
    },
    // 28 января, 20:15
    {
        uid: 'msg-062',
        chatKey: 'mock-chat-001',
        content:
            'Слушай, может в выходные сходим куда-нибудь? В кино или просто погуляем?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738093500,
        updated_at: 1738093500,
        delivered_at: 1738093501,
        read_at: 1738093800,
    },
    // 28 января, 20:20
    {
        uid: 'msg-063',
        chatKey: 'mock-chat-001',
        content: 'Давай! Хочу в кино, давно не была',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738093800,
        updated_at: 1738093800,
    },
    // 28 января, 20:22
    {
        uid: 'msg-064',
        chatKey: 'mock-chat-001',
        content:
            'Окей, посмотрю что идёт интересного и скину варианты',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738093920,
        updated_at: 1738093920,
        delivered_at: 1738093921,
        read_at: 1738094000,
    },
    // 29 января, 11:00 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-065',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738147200,
        updated_at: 1738147200,
        delivered_at: 1738147201,
        read_at: 1738147500,
        forwardedMessages: [
            {
                uid: 'fwd-msg-005',
                content:
                    'Друзья, нашла отличный сериал! Кто любит фантастику, рекомендую "Основание" от Apple. Просто бомба! 🎬',
                from_user: 'user-olga-777',
                first_name: 'Ольга',
                last_name: 'Королёва',
            },
        ],
    },
    // 29 января, 11:05
    {
        uid: 'msg-066',
        chatKey: 'mock-chat-001',
        content:
            'О, спасибо за рекомендацию! Может вместо кино сериал посмотрим у кого-то дома? 🤔',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738147500,
        updated_at: 1738147500,
    },
    // 29 января, 11:08 - ОТВЕТ НА СООБЩЕНИЕ
    {
        uid: 'msg-067',
        chatKey: 'mock-chat-001',
        content:
            'Тоже вариант! Давай у меня, я попкорн приготовлю 🍿',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738147680,
        updated_at: 1738147680,
        delivered_at: 1738147681,
        read_at: 1738147800,
        repliedMessages: [
            {
                uid: 'msg-066',
                content:
                    'О, спасибо за рекомендацию! Может вместо кино сериал посмотрим у кого-то дома? 🤔',
                from_user: 'user-anna-456',
                first_name: 'Anna',
                last_name: 'Pavlova',
            },
        ],
    },
    // 29 января, 11:10
    {
        uid: 'msg-068',
        chatKey: 'mock-chat-001',
        content: 'Отлично! В субботу вечером?',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738147800,
        updated_at: 1738147800,
    },
    // 29 января, 11:11
    {
        uid: 'msg-069',
        chatKey: 'mock-chat-001',
        content: 'Давай, жду! 😊',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738147860,
        updated_at: 1738147860,
        delivered_at: 1738147861,
        read_at: 1738148000,
    },
    // 1 февраля (суббота), 18:30
    {
        uid: 'msg-070',
        chatKey: 'mock-chat-001',
        content: 'Выехала, буду через полчаса примерно',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738428600,
        updated_at: 1738428600,
    },
    // 1 февраля, 18:32
    {
        uid: 'msg-071',
        chatKey: 'mock-chat-001',
        content: 'Окей, всё готово, жду 👌',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738428720,
        updated_at: 1738428720,
        delivered_at: 1738428721,
        read_at: 1738428800,
    },
    // 2 февраля (воскресенье), 01:30
    {
        uid: 'msg-072',
        chatKey: 'mock-chat-001',
        content:
            'Дома, спасибо за вечер! Сериал реально крутой, будем продолжать смотреть? 😊',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738454400,
        updated_at: 1738454400,
    },
    // 2 февраля, 01:33
    {
        uid: 'msg-073',
        chatKey: 'mock-chat-001',
        content:
            'Обязательно! Мне тоже очень понравилось. Спокойной ночи ❤️',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738454580,
        updated_at: 1738454580,
        delivered_at: 1738454581,
        read_at: 1738454700,
    },
    // 4 февраля, 13:45 - ПЕРЕСЛАННОЕ СООБЩЕНИЕ
    {
        uid: 'msg-074',
        chatKey: 'mock-chat-001',
        content: '',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738674300,
        updated_at: 1738674300,
        forwardedMessages: [
            {
                uid: 'fwd-msg-006',
                content:
                    'Всем привет! В пятницу планируется тимбилдинг - боулинг и ужин. Кто с нами?',
                from_user: 'user-dmitry-888',
                first_name: 'Дмитрий',
                last_name: 'Соколов',
            },
        ],
    },
    // 4 февраля, 13:50
    {
        uid: 'msg-075',
        chatKey: 'mock-chat-001',
        content: 'Круто! У вас часто такие мероприятия?',
        status: 'read',
        from_user: 'user-me-123',
        created_at: 1738674600,
        updated_at: 1738674600,
        delivered_at: 1738674601,
        read_at: 1738674700,
    },
    // 4 февраля, 13:52
    {
        uid: 'msg-076',
        chatKey: 'mock-chat-001',
        content:
            'Да, раз в месяц точно. Компания старается поддерживать командный дух 😊',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738674720,
        updated_at: 1738674720,
    },
    // 5 февраля, 10:15 - ОТВЕТ НА СООБЩЕНИЕ (текущий день)
    {
        uid: 'msg-077',
        chatKey: 'mock-chat-001',
        content:
            'Завидую белой завистью 😊 У нас таких активностей почти нет',
        status: 'delivered',
        from_user: 'user-me-123',
        created_at: 1738748100,
        updated_at: 1738748100,
        delivered_at: 1738748102,
        repliedMessages: [
            {
                uid: 'msg-076',
                content:
                    'Да, раз в месяц точно. Компания старается поддерживать командный дух 😊',
                from_user: 'user-anna-456',
                first_name: 'Anna',
                last_name: 'Pavlova',
            },
        ],
    },
    // 5 февраля, 10:25 (последнее сообщение, только отправлено)
    {
        uid: 'msg-078',
        chatKey: 'mock-chat-001',
        content:
            'Может предложи руководству? Обычно такие инициативы поддерживают',
        status: 'publish',
        from_user: 'user-anna-456',
        created_at: 1738748700,
        updated_at: 1738748700,
    },
]
