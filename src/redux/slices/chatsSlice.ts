import {
    fetchChats,
    handleFetchChats,
} from './../extraReducers/chat-extraReducers/fetchChatsExtraRed'

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatItem, ChatsState, ChatSettings } from '../../shared/types/chat';
import { handleFetchChats } from '@redux/extraReducers/chat-extraReducers/fetchChatsExtraRed';

const initialState: ChatsState = {
  items: [],
  loading: false,
  error: null,
  selectedChatId: null,
  chatSettings:{}
};

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        setSelectedChat: (
            state,
            action: PayloadAction<number | null>,
        ) => {
            state.selectedChatId = action.payload
        },
        updateChat: (
            state,
            action: PayloadAction<ChatItem>,
        ) => {
            const index = state.items.findIndex(
                (chat) => chat.id === action.payload.id,
            )
            if (index !== -1) {
                state.items[index] = action.payload
            }
        },
    },
    extraReducers: (builder) => {
        handleFetchChats(builder)
    },
   // обновление настроек конкретного чата
    updateChatSettings: (state, action: PayloadAction<{
      chatId: number;
      settings: Partial<ChatSettings>;
    }>) => {
      const { chatId, settings } = action.payload;
      
      if (!state.chatSettings[chatId]) {
        const chat = state.items.find(c => c.id === chatId);
        state.chatSettings[chatId] = {
          isFavorite: chat?.isFavorite || false,
          isChatRead: chat?.newMessageCount === 0,
          notificationsEnabled: chat?.notifications ?? true,
          isDeleted: false,
          originalUnreadCount: chat?.newMessageCount || 0,
        };
      }
      
      state.chatSettings[chatId] = {
        ...state.chatSettings[chatId],
        ...settings,
      };
      
      // Обновляем также в items для совместимости
      const chatIndex = state.items.findIndex(c => c.id === chatId);
      if (chatIndex !== -1 && state.items[chatIndex].settings) {
        state.items[chatIndex].settings = {
          ...state.items[chatIndex].settings!,
          ...settings,
        };
      }
    },
    
    // переключение избранного
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const currentSettings = state.chatSettings[chatId];
      
      if (currentSettings) {
        state.chatSettings[chatId] = {
          ...currentSettings,
          isFavorite: !currentSettings.isFavorite,
        };
      } else {
        const chat = state.items.find(c => c.id === chatId);
        state.chatSettings[chatId] = {
          isFavorite: true,
          isChatRead: chat?.newMessageCount === 0,
          notificationsEnabled: chat?.notifications ?? true,
          isDeleted: false,
          originalUnreadCount: chat?.newMessageCount || 0,
        };
      }
    },
    
    // переключение уведомлений
    toggleNotifications: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const currentSettings = state.chatSettings[chatId];
      
      if (currentSettings) {
        state.chatSettings[chatId] = {
          ...currentSettings,
          notificationsEnabled: !currentSettings.notificationsEnabled,
        };
      }
    },
    
    // пометить как прочитанное
    markAsRead: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const currentSettings = state.chatSettings[chatId];
      
      if (currentSettings) {
        state.chatSettings[chatId] = {
          ...currentSettings,
          isChatRead: true,
          originalUnreadCount: currentSettings.originalUnreadCount > 0 
            ? currentSettings.originalUnreadCount 
            : 0,
        };
      }
    },
    
    // пометить как непрочитанное
    markAsUnread: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const currentSettings = state.chatSettings[chatId];
      
      if (currentSettings) {
        state.chatSettings[chatId] = {
          ...currentSettings,
          isChatRead: false,
          originalUnreadCount: 0,
        };
      }
    },
    
    //  пометить как удаленное
    markAsDeleted: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const currentSettings = state.chatSettings[chatId];
      
      if (currentSettings) {
        state.chatSettings[chatId] = {
          ...currentSettings,
          isDeleted: true,
        };
      } else {
        const chat = state.items.find(c => c.id === chatId);
        state.chatSettings[chatId] = {
          isFavorite: false,
          isChatRead: chat?.newMessageCount === 0,
          notificationsEnabled: chat?.notifications ?? true,
          isDeleted: true,
          originalUnreadCount: chat?.newMessageCount || 0,
        };
      }
    },
    
    // добавить в контакты
    addToContacts: (state, action: PayloadAction<number>) => {
      const chatId = action.payload;
      const chatIndex = state.items.findIndex(c => c.id === chatId);
      
      if (chatIndex !== -1) {
        state.items[chatIndex].chat.isInContacts = true;
      }
    },
    
    // сбросить все настройки
    resetChatSettings: (state) => {
      state.chatSettings = {};
    },
  },
   extraReducers: (builder) => {
      handleFetchChats(builder, initialState)
  },
});
export { 
  fetchChats, 
};
export const { 
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
} = chatsSlice.actions;
export default chatsSlice.reducer;
