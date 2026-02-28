import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
interface SelectedContactTempState {
    uid: string | null
}
const initialState: SelectedContactTempState = {
    uid: null,
}
const selectedContactTempSlice = createSlice({
    name: 'selectedContactTemp',
    initialState,
    reducers: {
        setSelectedContact: (
            state,
            action: PayloadAction<string | null>,
        ) => {
            state.uid = action.payload
        },
    },
})
export const { setSelectedContact } =
    selectedContactTempSlice.actions
export default selectedContactTempSlice.reducer
