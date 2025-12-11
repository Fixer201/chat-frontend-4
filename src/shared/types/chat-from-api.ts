export interface Chat {
    uid: string;
    username: string;
    nickname: string;
    first_name: string;
    last_name: string;
    avatar: string;
    avatar_url: string;
    avatar_webp: string;
    avatar_webp_url: string;
    is_blocked: boolean;
    is_online: boolean;
    was_online_at: number;
    is_in_contacts: boolean;
}

export interface FilesSummary {
  types: string[];
  count: number;
}

export interface Message {
  id: number;
  uid: string;
  from_user: string;
  content: string;
  files_summary: FilesSummary;
  has_replied_message: boolean;
  has_forwarded_message: boolean;
  new: boolean;
  created_at: number;
  updated_at: number;
}

export interface ChatItem {
  id: number;
  chat: Chat;
  is_favorite: boolean;
  notifications: boolean;
  new_message_count: number;
  new_file_count: number;
  name: string;
  chat_type: string;
  chat_key: string;
  last_activity_at: number;
  last_seen_message: {
    id: number;
    uid: string;
  };
  first_new_message: {
    id: number;
    uid: string;
  };
  last_message: Message;
}

// Использование Partial
// export type PartialChat = Partial<Chat>;
// export type PartialFilesSummary = Partial<FilesSummary>;
// export type PartialMessage = Partial<Message>;
// export type PartialChatItem = Partial<ChatItem>;