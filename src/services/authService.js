import { api } from '../api/client';

const AUTH_URL = '/auth/login';

export const authService = {
  login(username, password) {
    return api.post(AUTH_URL, { username, password }).then((res) => {
      if (res.token) {
        localStorage.setItem('jwtToken', res.token);
        const storedUser = {
          accountNo: Number(res.user?.username) || 0,
          name: res.user?.name || 'Customer',
          role: (res.user?.role || 'USER').toUpperCase(),
        };
        localStorage.setItem('currentUser', JSON.stringify(storedUser));
      }
      return res;
    });
  },

  logout() {
    localStorage.clear();
  },

  getToken() {
    return localStorage.getItem('jwtToken');
  },

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  },

  getRole() {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() || '';
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
