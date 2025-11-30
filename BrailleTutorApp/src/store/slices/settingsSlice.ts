import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    voiceSpeed: 1.0,
    audioVolume: 0.8,
    dotDepth: 0.6,
    printSpeed: 'normal',
    language: 'en',
    notificationsEnabled: true,
    darkMode: true,
    hapticFeedback: true,
  },
  reducers: {
    updateSetting: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    resetSettings: () => settingsSlice.getInitialState(),
  },
});

export const { updateSetting, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
