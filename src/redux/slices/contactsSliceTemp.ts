import { ContactsListDB } from '@shared/config/constants'
import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'

const contactsTemp = createSlice({
    name: 'contactsTemp',
    initialState: {
        list: ContactsListDB,
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
    },
})

export const { setContacts, removeContacts } =
    contactsTemp.actions
export default contactsTemp.reducer
