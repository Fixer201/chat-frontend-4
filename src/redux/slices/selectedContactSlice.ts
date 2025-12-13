import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface SelectedContactState {
  uid: string | null;
}
const initialState: SelectedContactState = {
  uid: null,
};
const selectedContactSlice = createSlice({
  name: 'selectedContact',
  initialState,
  reducers: {
    setSelectedContact: (state, action: PayloadAction<string | null>) => {
      state.uid = action.payload;
    },
  },
});
export const { setSelectedContact } = selectedContactSlice.actions;
export default selectedContactSlice.reducer;