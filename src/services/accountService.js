import { api } from '../api/client';

export const accountService = {
  getAccount: (accountNo) => api.get(`/searchAccount/${accountNo}`),
  getBalance: (accountNo) => api.get(`/getBalance/${accountNo}`),
};
