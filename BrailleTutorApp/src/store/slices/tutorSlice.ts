import { createSlice } from '@reduxjs/toolkit';

const tutorSlice = createSlice({
  name: 'tutor',
  initialState: {
    chatHistory: [],
    isListening: false,
    currentResponse: '',
    sessionId: null,
  },
  reducers: {
    startListening: (state) => { state.isListening = true; },
    stopListening: (state) => { state.isListening = false; },
    addMessage: (state, action) => { state.chatHistory.push(action.payload); },
    setResponse: (state, action) => { state.currentResponse = action.payload; },
    clearChat: (state) => { state.chatHistory = []; },
  },
});

export const { startListening, stopListening, addMessage, setResponse, clearChat } = tutorSlice.actions;
export default tutorSlice.reducer;
