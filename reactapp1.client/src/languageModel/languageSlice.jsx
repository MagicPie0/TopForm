import { createSlice } from '@reduxjs/toolkit';

const languageSlice = createSlice({
  name: 'language',
  initialState: 'EN', // Kezdeti nyelv
  reducers: {
    toggleLanguage: (state) => (state === 'EN' ? 'HU' : 'EN'),
    setLanguage: (state, action) => action.payload, // Manuális nyelvbeállítás
  },
});

export const { toggleLanguage, setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
