// languageSlice.js
import { createSlice } from '@reduxjs/toolkit';
import hu from './hu.json';
import en from './en.json';

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    current: 'HU',
    translations: {
      HU: hu,
      EN: en
    }
  },
  reducers: {
    toggleLanguage: (state) => {
      state.current = state.current === 'EN' ? 'HU' : 'EN';
    },
    setLanguage: (state, action) => {
      if (state.translations[action.payload]) {
        state.current = action.payload;
      }
    }
  }
});

// Export actions
export const { toggleLanguage, setLanguage } = languageSlice.actions;

// Create and export selectors
export const selectCurrentLanguage = (state) => state.language.current;
export const selectTranslations = (state) => state.language.translations[state.language.current];

export default languageSlice.reducer;