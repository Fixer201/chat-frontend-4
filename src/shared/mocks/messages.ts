import { Message } from '@shared/types/message'

// Константы для моковых данных
export const MOCK_CHAT_KEY = 'mock-chat-001'
export const MOCK_CURRENT_USER_ID = 'user-me-123'
export const MOCK_OTHER_USER_ID = 'user-anna-456'

// Генерация timestamp'ов для реалистичности
const now = Math.floor(Date.now() / 1000)
const yesterday = now - 24 * 60 * 60 // 1 день назад
const todayMorning = now - 8 * 60 * 60 // 8 часов назад
const recentTime = now - 2 * 60 * 60 // 2 часа назад

/**
 * Моковые сообщения для тестирования верстки чата
 *
 * Категории:
 * - Базовые сообщения (1-8): короткие, средние, длинные, с эмодзи
 * - Сообщения подряд (9-12): несколько от одного пользователя
 * - Edge cases (13-16): крайние случаи (очень длинное, короткое, эмодзи, переносы)
 * - Заготовка (17-20): с полями для будущих фич (forwarded, replied)
 */
export const MOCK_MESSAGES: Message[] = [
    // === ВЧЕРАШНИЕ СООБЩЕНИЯ (1-5) ===

    // 1. Короткое чужое сообщение
    {
        uid: 'msg-001',
        chatKey: MOCK_CHAT_KEY,
        content: 'Привет!',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: yesterday,
    },

    // 2. Короткое свое сообщение (отправлено - sent)
    {
        uid: 'msg-002',
        chatKey: MOCK_CHAT_KEY,
        content: 'Здравствуй 👋',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: yesterday + 60,
        // Только created_at - статус "sent" (одна галочка)
    },

    // 3. Среднее чужое сообщение
    {
        uid: 'msg-003',
        chatKey: MOCK_CHAT_KEY,
        content: 'Как дела? Давно не виделись!',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: yesterday + 120,
    },

    // 4. Среднее свое сообщение (доставлено - delivered)
    {
        uid: 'msg-004',
        chatKey: MOCK_CHAT_KEY,
        content: 'Отлично! У тебя как?',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: yesterday + 180,
        delivered_at: yesterday + 181, // Доставлено через 1 сек
    },

    // 5. Длинное чужое сообщение
    {
        uid: 'msg-005',
        chatKey: MOCK_CHAT_KEY,
        content:
            'У меня всё хорошо! Недавно вернулся из отпуска. Были с семьей на море, отлично отдохнули. Погода была замечательная.',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: yesterday + 240,
    },

    // === СЕГОДНЯ УТРО (6-12) ===

    // 6. Длинное свое сообщение (прочитано - read)
    {
        uid: 'msg-006',
        chatKey: MOCK_CHAT_KEY,
        content:
            'Здорово! Я тоже недавно отдыхал, правда недолго. Ездил к родителям на выходные, давно не видел их.',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning,
        delivered_at: todayMorning + 1,
        read_at: todayMorning + 10, // Прочитано через 10 сек
    },

    // 7. Сообщение с эмодзи (чужое)
    {
        uid: 'msg-007',
        chatKey: MOCK_CHAT_KEY,
        content: 'Отлично провели время! 🎉🌊☀️',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: todayMorning + 300,
    },

    // 8. Свое с эмодзи (read)
    {
        uid: 'msg-008',
        chatKey: MOCK_CHAT_KEY,
        content: 'Круто! 😊',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 360,
        delivered_at: todayMorning + 361,
        read_at: todayMorning + 370,
    },

    // === НЕСКОЛЬКО СООБЩЕНИЙ ПОДРЯД ОТ ОДНОГО ПОЛЬЗОВАТЕЛЯ (9-12) ===

    // 9-12. Четыре своих сообщения подряд с разными статусами
    {
        uid: 'msg-009',
        chatKey: MOCK_CHAT_KEY,
        content: 'Кстати, хотел спросить',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 600,
        delivered_at: todayMorning + 601,
        read_at: todayMorning + 610,
    },
    {
        uid: 'msg-010',
        chatKey: MOCK_CHAT_KEY,
        content:
            'Ты не знаешь, когда планируется встреча команды?',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 605,
        delivered_at: todayMorning + 606,
        read_at: todayMorning + 615,
    },
    {
        uid: 'msg-011',
        chatKey: MOCK_CHAT_KEY,
        content: 'Или её отменили?',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 610,
        delivered_at: todayMorning + 611,
    },
    {
        uid: 'msg-012',
        chatKey: MOCK_CHAT_KEY,
        content: 'Давно не было новостей',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 615,
        // Только sent - одна галочка
    },

    // === EDGE CASES (13-16) ===

    // 13. Очень длинное сообщение (абзац)
    {
        uid: 'msg-013',
        chatKey: MOCK_CHAT_KEY,
        content:
            'Насколько я знаю, встречу планировали на следующей неделе. Руководитель хотел обсудить новые задачи на квартал и распределить роли в проекте. Также будем говорить о результатах последнего спринта. Подробности должны прислать в календарь, следи за приглашениями.',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: todayMorning + 900,
    },

    // 14. Очень короткое сообщение
    {
        uid: 'msg-014',
        chatKey: MOCK_CHAT_KEY,
        content: 'Ок',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 960,
        delivered_at: todayMorning + 961,
        read_at: todayMorning + 970,
    },

    // 15. Много эмодзи
    {
        uid: 'msg-015',
        chatKey: MOCK_CHAT_KEY,
        content: '🔥🔥🔥💪✨',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: todayMorning + 1020,
    },

    // 16. Сообщение с переносами строк
    {
        uid: 'msg-016',
        chatKey: MOCK_CHAT_KEY,
        content: `Спасибо за информацию!
Буду следить за календарем.

Хорошего дня! 😊`,
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: todayMorning + 1080,
        delivered_at: todayMorning + 1081,
        read_at: todayMorning + 1090,
    },

    // === НЕДАВНИЕ СООБЩЕНИЯ С ЗАГОТОВКАМИ ПОД БУДУЩИЕ ФИЧИ (17-20) ===

    // 17. Сообщение с пересланным (пока отображается как обычное)
    {
        uid: 'msg-017',
        chatKey: MOCK_CHAT_KEY,
        content: 'Кстати, посмотри это сообщение',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: recentTime,
        forwardedMessages: [
            {
                content: 'Встреча перенесена на 15:00',
            },
        ],
    },

    // 18. Сообщение с ответом (пока отображается как обычное)
    {
        uid: 'msg-018',
        chatKey: MOCK_CHAT_KEY,
        content: 'Хорошо, учту!',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: recentTime + 60,
        delivered_at: recentTime + 61,
        read_at: recentTime + 70,
        repliedMessages: [
            {
                content: 'Кстати, посмотри это сообщение',
            },
        ],
    },

    // 19. Комбинированное (для теста типа - в реальности может не использоваться)
    {
        uid: 'msg-019',
        chatKey: MOCK_CHAT_KEY,
        content: 'Договорились на завтра',
        status: 'publish',
        from_user: MOCK_OTHER_USER_ID,
        created_at: recentTime + 120,
        repliedMessages: [
            {
                content: 'Хорошо, учту!',
            },
        ],
        forwardedMessages: [
            {
                content: 'Встреча в 15:00',
            },
        ],
    },

    // 20. Резервное сообщение для экспериментов
    {
        uid: 'msg-020',
        chatKey: MOCK_CHAT_KEY,
        content: 'Увидимся! 👋',
        status: 'publish',
        from_user: MOCK_CURRENT_USER_ID,
        created_at: recentTime + 180,
        delivered_at: recentTime + 181,
    },
]
