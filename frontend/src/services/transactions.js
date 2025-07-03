import api from './api';

export const getTransactions = async (token) => {
  const response = await api.get('/transactions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createTransaction = async (transaction, token) => {
  const response = await api.post('/transactions', transaction, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateTransaction = async (id, transaction, token) => {
  const response = await api.put(`/transactions/${id}`, transaction, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTransaction = async (id, token) => {
  await api.delete(`/transactions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};