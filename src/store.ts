import { configureStore } from '@reduxjs/toolkit';
import cardReducer from './cardReducer.tsx';

export const store = configureStore({
  reducer: {
    card: cardReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;