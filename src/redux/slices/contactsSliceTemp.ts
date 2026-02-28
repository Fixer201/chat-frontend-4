// src/redux/slices/contactsSliceTemp.ts
import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import { Contact } from '@shared/types/contact'
import {
    initializeContacts,
    saveContactsToStorage,
} from '@shared/lib/localStorageContacts'

const contactsTemp = createSlice({
    name: 'contactsTemp',
    initialState: {
        list: initializeContacts(), // теперь загружается из localStorage или базы
    },
    reducers: {
        setContacts: (
            state,
            action: PayloadAction<Contact[]>,
        ) => {
            state.list = action.payload
            saveContactsToStorage(action.payload) // синхронизация с localStorage
        },
        removeContacts: (
            state,
            action: PayloadAction<string[]>,
        ) => {
            state.list = state.list.filter(
                (contact) =>
                    !action.payload.includes(contact.uid),
            )
            saveContactsToStorage(state.list) // сохраняем после удаления
        },
    },
})

export const { setContacts, removeContacts } =
    contactsTemp.actions
export default contactsTemp.reducer
