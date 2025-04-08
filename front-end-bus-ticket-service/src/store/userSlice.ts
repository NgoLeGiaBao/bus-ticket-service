import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialState = {
  account: {
    access_token: '',
    role: '',
  },
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.account.access_token = action.payload.access_token;
      state.account.role = action.payload.role || '';
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.account.access_token = '';
      state.account.role = '';
      state.isAuthenticated = false;
    },
  },
});

const persistConfig = {
  key: 'user',
  storage,
  whitelist: ['account', 'isAuthenticated'], 
};

export const { setUser, logout } = userSlice.actions;
export default persistReducer(persistConfig, userSlice.reducer);
