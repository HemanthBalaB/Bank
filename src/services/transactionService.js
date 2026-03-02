import { api } from '../api/client';

const base = '/api/transactions';

export const transactionService = {
  getTransactions: (accountNo) => api.get(`${base}/recent/${accountNo}`),
  deposit: (accountNo, amount) => api.post(`${base}/deposit`, { accountNo, amount }, 'text'),
  withdraw: (accountNo, amount) => api.post(`${base}/withdraw`, { accountNo, amount }, 'text'),
  transfer: (fromAccountNo, toAccountNo, amount) =>
    api.post(`${base}/transferFunds`, { fromAccountNo, toAccountNo, amount }, 'text'),
};
