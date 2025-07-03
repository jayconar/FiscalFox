import { useState, useMemo } from 'react';
import { Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { useTransactions } from '../context/TransactionContext';
import { ExpensesPieChart, IncomePieChart } from '../components/PieCharts';
import BalanceHistoryChart from '../components/BalanceHistoryChart';

const DashboardPage = () => {
  const { transactions, loading, error } = useTransactions();
  const [timeInterval, setTimeInterval] = useState('all');
  const [chartTimeInterval, setChartTimeInterval] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (timeInterval === 'all') return transactions;
    const today = new Date();
    const cutoffDate = new Date();
    
    switch (timeInterval) {
      case '5y': cutoffDate.setFullYear(today.getFullYear() - 5); break;
      case '1y': cutoffDate.setFullYear(today.getFullYear() - 1); break;
      case '6m': cutoffDate.setMonth(today.getMonth() - 6); break;
      case '3m': cutoffDate.setMonth(today.getMonth() - 3); break;
      case '1m': cutoffDate.setMonth(today.getMonth() - 1); break;
      case '1w': cutoffDate.setDate(today.getDate() - 7); break;
      case '1d': cutoffDate.setDate(today.getDate() - 1); break;
      default: return transactions;
    }
    
    return transactions.filter(tx => new Date(tx.date) >= cutoffDate);
  }, [transactions, timeInterval]);

  const { totalIncome, totalExpenses, balance, surplus, deficit } = useMemo(() => {
    const income = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const expenses = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const balanceValue = income - expenses;
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: balanceValue,
      surplus: Math.max(balanceValue, 0),
      deficit: Math.max(-balanceValue, 0),
    };
  }, [filteredTransactions]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const intervals = [
    { id: 'all', label: 'All' },
    { id: '5y', label: '5 Years' },
    { id: '1y', label: '1 Year' },
    { id: '6m', label: '6 Months' },
    { id: '3m', label: '3 Months' },
    { id: '1m', label: '1 Month' },
    { id: '1w', label: '1 Week' },
    { id: '1d', label: 'Today' },
  ];

  return (
    <>
      <h1 className="mb-4">Financial Dashboard</h1>
      
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="fox-card border-0 bg-success">
            <Card.Body className="p-3">
              <Card.Title>Income</Card.Title>
              <Card.Text>${totalIncome.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="fox-card border-0 bg-danger">
            <Card.Body className="p-3">
              <Card.Title>Spending</Card.Title>
              <Card.Text>${totalExpenses.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="fox-card border-0 bg-primary">
            <Card.Body className="p-3">
              <Card.Title>Surplus</Card.Title>
              <Card.Text>${surplus.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="fox-card border-0 bg-warning">
            <Card.Body className="p-3">
              <Card.Title>Deficit</Card.Title>
              <Card.Text>${deficit.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="justify-content-center mb-5 mt-3">
        <Col xs={12} className="text-center">
          <div className="mobile-scroll-container">
            <ButtonGroup className="time-selector">
              {intervals.map(interval => (
                <Button
                  key={interval.id}
                  variant={timeInterval === interval.id ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeInterval(interval.id)}
                >
                  {interval.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className="fox-card">
            <Card.Body>
              <Card.Title>Income Sources</Card.Title>
              <div style={{ height: '300px' }}>
                <IncomePieChart transactions={filteredTransactions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="fox-card">
            <Card.Body>
              <Card.Title>Spending Categories</Card.Title>
              <div style={{ height: '300px' }}>
                <ExpensesPieChart transactions={filteredTransactions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card className="fox-card">
            <Card.Body>
              <Card.Title>Balance History</Card.Title>
              <BalanceHistoryChart 
                transactions={transactions} 
                timeInterval={chartTimeInterval}
                onIntervalChange={setChartTimeInterval}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardPage;