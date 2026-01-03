import {
    fetchChats,
    handleFetchChats,
} from './../extraReducers/chat-extraReducers/fetchChatsExtraRed'

import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import {
    ChatItem,
    ChatsState,
} from '../../shared/types/chat'

const initialState: ChatsState = {
    items: [],
    loading: false,
    error: null,
    selectedChatId: null,
}

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
})
export { fetchChats }
export const { setSelectedChat, updateChat } =
    chatsSlice.actions
export default chatsSlice.reducer
