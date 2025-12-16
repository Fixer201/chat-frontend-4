// /**
//  * Генерирует массив моковых данных для чатов
//  * @param count - количество элементов для генерации
//  * @returns Promise<ChatItem[]> - массив объектов ChatItem

import { ApiChatItem } from "@shared/types/chat";

export function generateLocalMockChatItems(count: number): ApiChatItem[] {
  const firstNames = ['Алексей', 'Мария', 'Сергей', 'Екатерина', 'Дмитрий', 'Ольга', 'Иван', 'Анна', 'Михаил', 'Наталья', 'Андрей', 'Татьяна', 'Павел', 'Елена', 'Владимир'];
  const lastNames = ['Петров', 'Иванова', 'Смирнов', 'Кузнецова', 'Федоров', 'Николаева', 'Воробьев', 'Павлова', 'Козлов', 'Орлова', 'Соколов', 'Морозова', 'Волков', 'Зайцева', 'Попов'];
  const nicknames = ['Alex', 'Maria', 'Sergey', 'Kate', 'Dima', 'Olga', 'Ivan', 'Anna', 'Misha', 'Natasha', 'Andrey', 'Tanya', 'Pavel', 'Lena', 'Vlad'];
  const messages = [
    "Привет! Как дела?",
    "Посмотри это видео, оно просто огонь!",
    "Когда встречаемся? Надо обсудить проект",
    "Отправляю тебе файлы по проекту",
    "Давай созвонимся завтра?",
    "Я уже дома, а ты?",
    "Посмотри это фото, как тебе?",
    "Надо срочно решить этот вопрос",
    "Когда будет готов отчет?",
    "Жду твоего ответа"
  ];
 const nowInSeconds = Math.floor(Date.now() / 1000);
 // Генерируем случайные времена в пределах последних 30 дней для каждого чата
  const thirtyDaysInSeconds = 30 * 24 * 60 * 60;

  return Array(count).fill(null).map((_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const nickname = nicknames[index % nicknames.length];
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    const message = messages[index % messages.length];

    const avatarSeed = `${username}_${index}_${Date.now()}`; // Гарантированно уникальный seed
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    const avatarUrlJpg = `https://api.dicebear.com/7.x/avataaars/jpg?seed=${avatarSeed}`;

    const baseId = (index + 1) * 100;
    
    // Генерируем случайные времена для каждого чата
    // was_online_at - случайное время в пределах 30 дней
    const randomSecondsAgo = Math.floor(Math.random() * thirtyDaysInSeconds);
    const wasOnlineAt = nowInSeconds - randomSecondsAgo;
    
    // last_activity_at - более свежее время (в пределах 7 дней)
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;
    const recentSecondsAgo = Math.floor(Math.random() * sevenDaysInSeconds);
    const lastActivityAt = nowInSeconds - recentSecondsAgo;
    
    // created_at для сообщения - случайное время (в пределах 1 дня от last_activity_at)
    const oneDayInSeconds = 24 * 60 * 60;
    const messageSecondsAgo = Math.floor(Math.random() * oneDayInSeconds);
    const messageCreatedAt = lastActivityAt - messageSecondsAgo;
    
    // is_online - случайно определяем, но с учетом времени последнего онлайн
    // Если был онлайн менее 5 минут назад, с большей вероятностью онлайн
    const fiveMinutesAgo = nowInSeconds - 300;
    const isOnline = wasOnlineAt >= fiveMinutesAgo 
      ? Math.random() > 0.3  // 70% шанс быть онлайн, если был онлайн недавно
      : Math.random() > 0.8; // 20% шанс быть онлайн, если давно не был онлайн

    const chatItem: ApiChatItem = {
      id: baseId,
      chat: {
        uid: `uuid-${index}-${Math.random().toString(36).substring(2, 10)}`,
        username: username,
        nickname: nickname,
        first_name: firstName,
        last_name: lastName,
        avatar: `avatar_${index}.jpg`,
        avatar_url: avatarUrlJpg, // Уникальная аватарка для каждого
        avatar_webp: `avatar_${index}.webp`,
        avatar_webp_url: avatarUrl,
        is_blocked: index % 10 === 0,
        is_online: index % 3 === 0,
        was_online_at: wasOnlineAt,
        is_in_contacts: index % 4 !== 0
      },
      is_favorite: index % 6 === 0,
      notifications: true,
      new_message_count: Math.floor(Math.random() * 10), // случайное число от 0 до 9
      new_file_count: Math.floor(Math.random() * 5),    // случайное число от 0 до 4
      name: `${firstName} ${lastName}`,
      chat_type: ['private', 'group', 'channel'][index % 3] as 'private' | 'group' | 'channel',
      chat_key: `chat_key_${index}`,
      last_activity_at: lastActivityAt,
      last_seen_message: { 
        id: baseId - 1, 
        uid: `msg_${baseId - 1}` 
      },
      first_new_message: { 
        id: baseId, 
        uid: `msg_${baseId}` 
      },
      last_message: {
        id: baseId + 1,
        uid: `msg_${baseId + 1}`,
        from_user: `uuid-${index}`,
        content: message,
        files_summary: { 
          types: Math.random() > 0.5 ? ['image'] : ['document'], 
          count: Math.floor(Math.random() * 5) 
        },
        has_replied_message: Math.random() > 0.7,
        has_forwarded_message: Math.random() > 0.8,
        new: Math.random() > 0.5,
        created_at: messageCreatedAt,
        updated_at: messageCreatedAt + Math.floor(Math.random() * 60) // + до 60 секунд
      }
    };
    return chatItem;
  });
}