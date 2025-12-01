import { createSlice } from '@reduxjs/toolkit';

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    list: [],
  },
  reducers: {
    setContacts: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { setContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
