
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatItem, ChatsState } from '../../shared/types/chat';
import { generateLocalMockChatItems } from '@shared/lib/test-mock-data/chat-mock-data';
import { transformChatListFromApi } from '../../shared/lib/transformChatData';

const initialState: ChatsState = {
  items: [],
  loading: false,
  error: null,
  selectedChatId: null,
};
// Async thunk для загрузки чатов
export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (count: number = 15, { rejectWithValue }) => {
    try {
      // Получаем моковые данные
      const mockData = generateLocalMockChatItems(count);
      
      // Преобразуем в camelCase для UI
      // Фильтруем валидные данные
      const validData = mockData.filter(
        (item): item is Required<typeof item> => 
          item !== null && 
          item !== undefined && 
          item.id !== undefined &&
          item.chat !== undefined
      ) as unknown as Parameters<typeof transformChatListFromApi>[0];
      
      return transformChatListFromApi(validData);
    } catch {
      return rejectWithValue('Не удалось загрузить чаты');
    }
  }
);
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setSelectedChat: (state, action: PayloadAction<number | null>) => {
      state.selectedChatId = action.payload;
    },
    updateChat: (state, action: PayloadAction<ChatItem>) => {
      const index = state.items.findIndex(chat => chat.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
   extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<ChatItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedChat, 
  updateChat, 
} = chatsSlice.actions;
export default chatsSlice.reducer;
