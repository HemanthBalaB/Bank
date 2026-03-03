import { createSlice } from '@reduxjs/toolkit';

const persistedUser = (() => {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: persistedUser,
  token: localStorage.getItem('jwtToken') || localStorage.getItem('employeeToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      const { user, token, isEmployee } = action.payload || {};
      state.user = user ?? null;
      state.token = token ?? null;

      if (token) {
        if (isEmployee) {
          localStorage.setItem('employeeToken', token);
        } else {
          localStorage.setItem('jwtToken', token);
        }
      }
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      localStorage.clear();
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

