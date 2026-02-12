import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import { Contact } from '@shared/types/contact'

const contactsSlice = createSlice({
    name: 'contacts',
    initialState: {
        list: [] as Contact[],
    },
    reducers: {
        setContacts: (state, action) => {
            state.list = action.payload
        },
        removeContacts: (
            state,
            action: PayloadAction<string[]>,
        ) => {
            state.list = state.list.filter(
                (contact) =>
                    !action.payload.includes(contact.uid),
            )
        },
        addContacts: (
            state,
            action: PayloadAction<Contact>,
        ) => {
            // Добавляем контакт, если его нет (по uid или phone)
            const exists = state.list.some(
                (c) =>
                    c.uid === action.payload.uid ||
                    c.phone === action.payload.phone,
            )
            if (!exists) {
                state.list.push(action.payload)
            }
        },
    },
})

export const { setContacts, removeContacts, addContacts } =
    contactsSlice.actions
export default contactsSlice.reducer
