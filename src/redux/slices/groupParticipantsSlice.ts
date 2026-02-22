import {
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit'
import { GroupParticipant } from '@shared/types/contact'

interface GroupParticipantsState {
    byChatKey: Record<string, GroupParticipant[]>
}

const initialState: GroupParticipantsState = {
    byChatKey: {},
}

const groupParticipantsSlice = createSlice({
    name: 'groupParticipants',
    initialState,
    reducers: {
        setParticipants: (
            state,
            action: PayloadAction<{
                chatKey: string
                participants: GroupParticipant[]
            }>,
        ) => {
            state.byChatKey[action.payload.chatKey] =
                action.payload.participants
        },
        addParticipant: (
            state,
            action: PayloadAction<{
                chatKey: string
                participant: GroupParticipant
            }>,
        ) => {
            if (!state.byChatKey[action.payload.chatKey]) {
                state.byChatKey[action.payload.chatKey] = []
            }
            state.byChatKey[action.payload.chatKey].push(
                action.payload.participant,
            )
        },
        removeParticipant: (
            state,
            action: PayloadAction<{
                chatKey: string
                uid: string
            }>,
        ) => {
            if (state.byChatKey[action.payload.chatKey]) {
                state.byChatKey[action.payload.chatKey] =
                    state.byChatKey[
                        action.payload.chatKey
                    ].filter(
                        (p) => p.uid !== action.payload.uid,
                    )
            }
        },
        // можно добавить другие редюсеры
    },
})

export const {
    setParticipants,
    addParticipant,
    removeParticipant,
} = groupParticipantsSlice.actions
export default groupParticipantsSlice.reducer
