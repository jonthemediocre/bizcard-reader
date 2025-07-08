import { configureStore } from '@reduxjs/toolkit';

// Placeholder slices - would be implemented based on app needs
const authSlice = {
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {},
};

const contactsSlice = {
  name: 'contacts',
  initialState: { contacts: [], loading: false },
  reducers: {},
};

export const store = configureStore({
  reducer: {
    auth: (state = authSlice.initialState) => state,
    contacts: (state = contactsSlice.initialState) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 