import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './languageSlice';

const store = configureStore({
  reducer: {
    language: languageReducer,
  },
});

export default store;
