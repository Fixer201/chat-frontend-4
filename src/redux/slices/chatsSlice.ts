import { createSlice } from '@reduxjs/toolkit';

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    list: [],
    selectedChat: null,
  },
  reducers: {
    setChats: (state, action) => {
      state.list = action.payload;
    },
    selectChat: (state, action) => {
      state.selectedChat = action.payload;
    },
  },
});

export const { setChats, selectChat } = chatsSlice.actions;
export default chatsSlice.reducer;
