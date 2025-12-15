
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import chatsReducer from './slices/chatsSlice'
import contactsReducer from './slices/contactsSlice'
import uiReducer from './slices/uiSlice'
import selectedContactReducer from './slices/selectedContactSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
    reducer: {
        user: userReducer,
        chats: chatsReducer,
        contacts: contactsReducer,
        ui: uiReducer,
        SelectedContact: selectedContactReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;