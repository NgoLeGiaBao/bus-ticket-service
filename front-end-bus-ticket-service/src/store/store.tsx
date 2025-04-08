import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import userReducer from './userSlice';

const rootReducer = combineReducers({
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
