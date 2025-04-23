import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialState = {
  account: {
    access_token: '',
    refresh_token: '',
    role: [],
    phone_number: '',
    username: '',
    email: '',
    avatarUrl: '',
  },
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { accessToken, refreshToken, roles, user } = action.payload;
      state.account.access_token = accessToken;
      state.account.refresh_token = refreshToken;
      state.account.role = roles || [];
      state.account.phone_number = user?.phoneNumber || '';
      state.account.username = user?.username || '';
      state.account.email = user?.email || '';
      state.account.avatarUrl =
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1618500299034-abce7ed0e8df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.account = {
        access_token: '',
        refresh_token: '',
        role: [],
        phone_number: '',
        username: '',
        email: '',
        avatarUrl: '',
      };
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
