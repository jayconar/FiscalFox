import { useState, useRef } from 'react';
import { Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { useTransactions } from '../context/TransactionContext';
import { FaFileImport } from 'react-icons/fa';

const TransactionsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const {
    transactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    refreshTransactions,
  } = useTransactions();

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await editTransaction(editingTransaction.id, formData);
      } else {
        await addTransaction(formData);
      }
      setShowForm(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const transactionsFromCsv = await parseCSV(file);
      await processTransactions(transactionsFromCsv);
      setImportSuccess(true);
      refreshTransactions();
    } catch (error) {
      setImportError(error.message);
    } finally {
      setImportLoading(false);
      e.target.value = null;
    }
  };

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target.result;
          const lines = content
            .split('\n')
            .map(l => l.trim())
            .filter(l => l !== '');
          const headers = lines[0]
            .split(',')
            .map(h => h.trim().toLowerCase());

          const requiredHeaders = [
            'description',
            'amount',
            'date',
            'category',
            'type',
          ];
          const missing = requiredHeaders.filter(
            h => !headers.includes(h)
          );
          if (missing.length > 0) {
            reject(
              new Error(
                `Missing columns: ${missing.join(
                  ', '
                )}. Required: ${requiredHeaders.join(', ')}`
              )
            );
            return;
          }

          const transactions = [];
          const errors = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const txn = {};
            headers.forEach((h, idx) => {
              txn[h] = values[idx] || '';
            });

            const err = validateTransaction(txn, i + 1);
            if (err) {
              errors.push(err);
            } else {
              txn.amount = parseFloat(txn.amount);
              transactions.push(txn);
            }
          }

          if (errors.length > 0) {
            reject(
              new Error(
                `CSV validation errors:\n${errors
                  .slice(0, 5)
                  .join('\n')}${
                  errors.length > 5
                    ? `\n...and ${errors.length - 5} more`
                    : ''
                }`
              )
            );
          } else {
            resolve(transactions);
          }
        } catch (err) {
          reject(new Error(`Parsing CSV: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const validateTransaction = (txn, row) => {
    const errs = [];
    if (!txn.description) errs.push(`Row ${row}: Description required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(txn.date))
      errs.push(`Row ${row}: Invalid date format`);
    if (!txn.category) errs.push(`Row ${row}: Category required`);
    const a = parseFloat(txn.amount);
    if (isNaN(a) || a <= 0)
      errs.push(`Row ${row}: Amount must be positive number`);
    if (!['income', 'expense'].includes(txn.type.toLowerCase()))
      errs.push(`Row ${row}: Type must be income or expense`);
    return errs.length > 0 ? errs.join(', ') : null;
  };

  const processTransactions = async (txnArray) => {
    for (const txn of txnArray) {
      await addTransaction(txn);
    }
  };

  return (
    <>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Transactions</h1>
        </Col>
        <Col className="text-end">
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-primary"
              onClick={handleImportClick}
              disabled={importLoading}
            >
              <FaFileImport className="me-2" />
              Import CSV
            </Button>
            <Button
              variant={showForm ? 'secondary' : 'primary'}
              onClick={() => {
                setShowForm(!showForm);
                setEditingTransaction(null);
              }}
              disabled={importLoading}
            >
              {showForm ? 'Cancel' : 'Add Transaction'}
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Col>
      </Row>

      {importLoading && (
        <Alert variant="info">
          <Spinner
            animation="border"
            size="sm"
            className="me-2"
          />
          Importing transactions...
        </Alert>
      )}
      {importError && (
        <Alert variant="danger">
          <strong>Import failed:</strong> {importError}
        </Alert>
      )}
      {importSuccess && (
        <Alert variant="success">
          Transactions imported successfully!
        </Alert>
      )}

      {showForm && (
        <div className="mb-4">
          <TransactionForm
            onSubmit={handleFormSubmit}
            initialData={editingTransaction}
            onCancel={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
          />
        </div>
      )}

      <TransactionList
        onEdit={handleEdit}
        onDelete={removeTransaction}
      />
    </>
  );
};

export default TransactionsPage;