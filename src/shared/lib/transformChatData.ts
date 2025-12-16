import { ApiChatItem, ChatItem } from '../types/chat';

/**
 * Преобразует ChatItem из API формата (snake_case) в UI формат (camelCase)
 * для дальнейшего его использовние в ui
 */
export const transformChatItemFromApi = (apiChatItem: ApiChatItem): ChatItem => ({
  id: apiChatItem.id,
  chat: {
    uid: apiChatItem.chat.uid,
    username: apiChatItem.chat.username,
    nickname: apiChatItem.chat.nickname,
    firstName: apiChatItem.chat.first_name,
    lastName: apiChatItem.chat.last_name,
    avatar: apiChatItem.chat.avatar,
    avatarUrl: apiChatItem.chat.avatar_url,
    avatarWebp: apiChatItem.chat.avatar_webp,
    avatarWebpUrl: apiChatItem.chat.avatar_webp_url,
    isBlocked: apiChatItem.chat.is_blocked,
    isOnline: apiChatItem.chat.is_online,
    wasOnlineAt: apiChatItem.chat.was_online_at,
    isInContacts: apiChatItem.chat.is_in_contacts,
  },
  isFavorite: apiChatItem.is_favorite,
  notifications: apiChatItem.notifications,
  newMessageCount: apiChatItem.new_message_count,
  newFileCount: apiChatItem.new_file_count,
  name: apiChatItem.name,
  chatType: apiChatItem.chat_type,
  chatKey: apiChatItem.chat_key,
  lastActivityAt: apiChatItem.last_activity_at,
  lastSeenMessage: apiChatItem.last_seen_message,
  firstNewMessage: apiChatItem.first_new_message,
  lastMessage: {
    id: apiChatItem.last_message.id,
    uid: apiChatItem.last_message.uid,
    fromUser: apiChatItem.last_message.from_user,
    content: apiChatItem.last_message.content,
    filesSummary: apiChatItem.last_message.files_summary,
    hasRepliedMessage: apiChatItem.last_message.has_replied_message,
    hasForwardedMessage: apiChatItem.last_message.has_forwarded_message,
    new: apiChatItem.last_message.new,
    createdAt: apiChatItem.last_message.created_at,
    updatedAt: apiChatItem.last_message.updated_at,
  },
});

/**
 * Преобразует массив ChatItem из API формата в UI формат
 */
export const transformChatListFromApi = (apiChatItems: ApiChatItem[]): ChatItem[] => {
  if (!Array.isArray(apiChatItems)) {
    return [];
  }
  
  return apiChatItems
    .map(item => transformChatItemFromApi(item))
    .filter((item): item is ChatItem => item !== null && item !== undefined);
};

/**
 * Преобразует UI данные обратно в API формат (для отправки данных на сервер)
 */
export const transformChatItemToApi = (chatItem: ChatItem): ApiChatItem => ({
  id: chatItem.id,
  chat: {
    uid: chatItem.chat.uid,
    username: chatItem.chat.username,
    nickname: chatItem.chat.nickname,
    first_name: chatItem.chat.firstName,
    last_name: chatItem.chat.lastName,
    avatar: chatItem.chat.avatar,
    avatar_url: chatItem.chat.avatarUrl,
    avatar_webp: chatItem.chat.avatarWebp,
    avatar_webp_url: chatItem.chat.avatarWebpUrl,
    is_blocked: chatItem.chat.isBlocked,
    is_online: chatItem.chat.isOnline,
    was_online_at: chatItem.chat.wasOnlineAt,
    is_in_contacts: chatItem.chat.isInContacts,
  },
  is_favorite: chatItem.isFavorite,
  notifications: chatItem.notifications,
  new_message_count: chatItem.newMessageCount,
  new_file_count: chatItem.newFileCount,
  name: chatItem.name,
  chat_type: chatItem.chatType,
  chat_key: chatItem.chatKey,
  last_activity_at: chatItem.lastActivityAt,
  last_seen_message: chatItem.lastSeenMessage,
  first_new_message: chatItem.firstNewMessage,
  last_message: {
    id: chatItem.lastMessage.id,
    uid: chatItem.lastMessage.uid,
    from_user: chatItem.lastMessage.fromUser,
    content: chatItem.lastMessage.content,
    files_summary: chatItem.lastMessage.filesSummary,
    has_replied_message: chatItem.lastMessage.hasRepliedMessage,
    has_forwarded_message: chatItem.lastMessage.hasForwardedMessage,
    new: chatItem.lastMessage.new,
    created_at: chatItem.lastMessage.createdAt,
    updated_at: chatItem.lastMessage.updatedAt,
  },
});