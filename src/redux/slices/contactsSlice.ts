import { ContactsListDB } from '@shared/config/constants';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    list: ContactsListDB,
  },
  reducers: {
    setContacts: (state, action) => {
      state.list = action.payload;
    },
    removeContacts: (state, action: PayloadAction<string[]>) => { 
      state.list = state.list.filter(contact => !action.payload.includes(contact.uid));
    },
  },
});

export const { setContacts, removeContacts } = contactsSlice.actions;
export default contactsSlice.reducer;