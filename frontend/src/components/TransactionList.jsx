import { useState, useMemo } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import { useTransactions } from '../context/TransactionContext';
import formatDate from '../utils/formatDate';

const TransactionList = ({ onEdit }) => {
  const { transactions, loading, error, removeTransaction } = useTransactions();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none', // 'ascending', 'descending', or 'none'
  });

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = 'none';
      }
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    if (sortConfig.direction === 'none') return transactions;

    return [...transactions].sort((a, b) => {
      if (sortConfig.key === 'amount') {
        const valueA = a.type === 'income' ? a.amount : -a.amount;
        const valueB = b.type === 'income' ? b.amount : -b.amount;
        return sortConfig.direction === 'ascending' ? valueA - valueB : valueB - valueA;
      }

      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
      }

      const valueA = a[sortConfig.key].toString().toLowerCase();
      const valueB = b[sortConfig.key].toString().toLowerCase();
      
      if (valueA < valueB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1 text-muted" />;
    switch (sortConfig.direction) {
      case 'ascending':
        return <FaSortUp className="ms-1" />;
      case 'descending':
        return <FaSortDown className="ms-1" />;
      default:
        return <FaSort className="ms-1 text-muted" />;
    }
  };

  if (loading) return <div className="text-center">Loading transactions...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (transactions.length === 0) return <div className="alert alert-info">No transactions found</div>;

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th 
            className="py-3 sortable-header" 
            onClick={() => handleSort('date')}
          >
            <div className="d-flex align-items-center">
              Date
              {getSortIcon('date')}
            </div>
          </th>
          <th 
            className="py-3 sortable-header" 
            onClick={() => handleSort('description')}
          >
            <div className="d-flex align-items-center">
              Description
              {getSortIcon('description')}
            </div>
          </th>
          <th 
            className="py-3 sortable-header" 
            onClick={() => handleSort('category')}
          >
            <div className="d-flex align-items-center">
              Category
              {getSortIcon('category')}
            </div>
          </th>
          <th 
            className="py-3 sortable-header" 
            onClick={() => handleSort('type')}
          >
            <div className="d-flex align-items-center">
              Type
              {getSortIcon('type')}
            </div>
          </th>
          <th 
            className="py-3 sortable-header" 
            onClick={() => handleSort('amount')}
          >
            <div className="d-flex align-items-center">
              Amount
              {getSortIcon('amount')}
            </div>
          </th>
          <th className="py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedTransactions.map(transaction => (
          <tr key={transaction.id}>
            <td className="align-middle">{formatDate(transaction.date)}</td>
            <td className="align-middle">{transaction.description}</td>
            <td className="align-middle">{transaction.category}</td>
            <td className="align-middle">
              <Badge 
                bg="light" 
                className={`text-${transaction.type === 'income' ? 'success' : 'danger'} border`}
              >
                {transaction.type}
              </Badge>
            </td>
            <td className={`fw-semibold align-middle ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </td>
            <td className="align-middle">
              <Button 
                variant="outline-primary" 
                className="me-2 py-1" 
                onClick={() => onEdit(transaction)}
              >
                <FaEdit />
              </Button>
              <Button 
                variant="outline-danger" 
                className="py-1" 
                onClick={() => removeTransaction(transaction.id)}
              >
                <FaTrash />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionList;