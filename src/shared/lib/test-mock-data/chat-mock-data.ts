// /**
//  * Генерирует массив моковых данных для чатов
//  * @param count - количество элементов для генерации
//  * @returns Promise<ChatItem[]> - массив объектов ChatItem

import { ChatItem } from "@shared/types/chat";

export function generateLocalMockChatItems(count: number): ChatItem[] {
  const firstNames = ['Алексей', 'Мария', 'Сергей', 'Екатерина', 'Дмитрий', 'Ольга', 'Иван', 'Анна', 'Михаил', 'Наталья', 'Андрей', 'Татьяна', 'Павел', 'Елена', 'Владимир'];
  const lastNames = ['Петров', 'Иванова', 'Смирнов', 'Кузнецова', 'Федоров', 'Николаева', 'Воробьев', 'Павлова', 'Козлов', 'Орлова', 'Соколов', 'Морозова', 'Волков', 'Зайцева', 'Попов'];
  const nicknames = ['Alex', 'Maria', 'Sergey', 'Kate', 'Dima', 'Olga', 'Ivan', 'Anna', 'Misha', 'Natasha', 'Andrey', 'Tanya', 'Pavel', 'Lena', 'Vlad'];
  const messages = [
    "Привет! Как дела?",
    "Посмотри это видео, оно просто огонь!",
    "Когда встречаемся? Надо обсудить проект"
    // ... добавьте еще сообщений
  ];

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

    const chatItem: ChatItem = {
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
        was_online_at: Math.floor(Date.now() / 1000) - (index * 3600),
        is_in_contacts: index % 4 !== 0
      },
      is_favorite: index % 6 === 0,
      notifications: true,
      new_message_count: index % 4,
      new_file_count: index % 3,
      name: `${firstName} ${lastName}`,
      chat_type: ['private', 'group', 'channel'][index % 3] as 'private' | 'group' | 'channel',
      chat_key: `chat_key_${index}`,
      last_activity_at: Math.floor(Date.now() / 1000),
      last_seen_message: { id: baseId - 1, uid: `msg_${baseId - 1}` },
      first_new_message: { id: baseId, uid: `msg_${baseId}` },
      last_message: {
        id: baseId + 1,
        uid: `msg_${baseId + 1}`,
        from_user: `uuid-${index}`,
        content: message,
        files_summary: { types: ['image', 'document'], count: index % 5 },
        has_replied_message: false,
        has_forwarded_message: false,
        new: true,
        created_at: Math.floor(Date.now() / 1000) - 300,
        updated_at: Math.floor(Date.now() / 1000)
      }
    };
    return chatItem;
  });
}