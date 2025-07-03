import { createContext, useContext, useState, useEffect } from 'react';
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '../services/transactions';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const fetchTransactions = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await getTransactions(currentUser.token);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const data = await createTransaction(transaction, currentUser.token);
      setTransactions(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Create error:', err);
      throw new Error('Failed to create transaction');
    }
  };

  const editTransaction = async (id, updates) => {
    try {
      const data = await updateTransaction(id, updates, currentUser.token);
      setTransactions(prev => 
        prev.map(tx => tx.id === id ? data : tx)
      );
      return data;
    } catch (err) {
      console.error('Update error:', err);
      throw new Error('Failed to update transaction');
    }
  };

  const removeTransaction = async (id) => {
    try {
      await deleteTransaction(id, currentUser.token);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      throw new Error('Failed to delete transaction');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [currentUser]);

  const value = {
    transactions,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refreshTransactions: fetchTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};