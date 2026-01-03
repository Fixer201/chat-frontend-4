import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
  fetchChats, 
  setSelectedChat, 
  updateChat,
  updateChatSettings,
  toggleFavorite,
  toggleNotifications,
  markAsRead,
  markAsUnread,
  markAsDeleted,
  addToContacts,
  resetChatSettings,
} from '../../redux/slices/chatsSlice';
import { ChatItem, ChatSettings } from '../types/chat';

export const useChats = () => {
  const dispatch = useAppDispatch();
  const { 
    items, 
    loading, 
    error, 
    selectedChatId, 
    chatSettings  
  } = useAppSelector(
    (state) => state.chats
  );

  const loadChats = useCallback((count: number = 20) => {
    dispatch(fetchChats(count));
  }, [dispatch]);

  const selectChat = useCallback((chatId: number | null) => {
    dispatch(setSelectedChat(chatId));
  }, [dispatch]);

  const updateChatData = useCallback((chat: ChatItem) => {
    dispatch(updateChat(chat));
  }, [dispatch]);
const updateChatSettingsData = useCallback((chatId: number, settings: Partial<ChatSettings>) => {
    dispatch(updateChatSettings({ chatId, settings }));
  }, [dispatch]);

  const toggleFavoriteChat = useCallback((chatId: number) => {
    dispatch(toggleFavorite(chatId));
  }, [dispatch]);

  const toggleChatNotifications = useCallback((chatId: number) => {
    dispatch(toggleNotifications(chatId));
  }, [dispatch]);

  const markChatAsRead = useCallback((chatId: number) => {
    dispatch(markAsRead(chatId));
  }, [dispatch]);

  const markChatAsUnread = useCallback((chatId: number) => {
    dispatch(markAsUnread(chatId));
  }, [dispatch]);

  const deleteChat = useCallback((chatId: number) => {
    dispatch(markAsDeleted(chatId));
  }, [dispatch]);

  const addChatToContacts = useCallback((chatId: number) => {
    dispatch(addToContacts(chatId));
  }, [dispatch]);

  const resetAllChatSettings = useCallback(() => {
    dispatch(resetChatSettings());
  }, [dispatch]);

  const getChatSettings = useCallback((chatId: number): ChatSettings | undefined => {
    return chatSettings[chatId];
  }, [chatSettings]);

  const getChatWithSettings = useCallback((chatId: number) => {
    const chat = items.find(c => c.id === chatId);
    const settings = chatSettings[chatId];
    
    if (!chat) return null;
    
    return {
      ...chat,
      settings: settings || {
        isFavorite: chat.isFavorite || false,
        isChatRead: chat.newMessageCount === 0,
        notificationsEnabled: chat.notifications ?? true,
        isDeleted: false,
        originalUnreadCount: chat.newMessageCount || 0,
      },
    };
  }, [items, chatSettings]);

  return {
    chats: items,
    loading,
    error,
    selectedChatId,
     chatSettings,
    loadChats,
    selectChat,
    updateChat: updateChatData,
    updateChatSettings: updateChatSettingsData,
    toggleFavorite: toggleFavoriteChat,
    toggleNotifications: toggleChatNotifications,
    markAsRead: markChatAsRead,
    markAsUnread: markChatAsUnread,
    deleteChat,
    addToContacts: addChatToContacts,
    resetChatSettings: resetAllChatSettings,
    getChatSettings,
    getChatWithSettings,
  };
};