import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
  fetchChats, 
  setSelectedChat, 
  updateChat,
} from '../../redux/slices/chatsSlice';
import { ChatItem } from '../types/chat';

export const useChats = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, selectedChatId } = useAppSelector(
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

  return {
    // Данные
    chats: items,
    loading,
    error,
    selectedChatId,
    
    // Методы
    loadChats,
    selectChat,
    updateChat: updateChatData,
  };
};