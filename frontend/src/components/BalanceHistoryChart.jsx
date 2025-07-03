import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const BalanceHistoryChart = ({ transactions, timeInterval, onIntervalChange }) => {
  const { labels, dataPoints } = useMemo(() => {
    if (!transactions.length) return { labels: [], dataPoints: [] };

    const today = new Date();
    const cutoffDate = new Date();
    switch (timeInterval) {
      case '5y': cutoffDate.setFullYear(today.getFullYear() - 5); break;
      case '1y': cutoffDate.setFullYear(today.getFullYear() - 1); break;
      case '6m': cutoffDate.setMonth(today.getMonth() - 6); break;
      case '3m': cutoffDate.setMonth(today.getMonth() - 3); break;
      case '1m': cutoffDate.setMonth(today.getMonth() - 1); break;
      case '7d': cutoffDate.setDate(today.getDate() - 7); break;
      default: break;
    }

    const filtered = timeInterval === 'all'
      ? [...transactions]
      : transactions.filter(tx => new Date(tx.date) >= cutoffDate);

    const sorted = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    const dailyBalances = {};
    sorted.forEach(tx => {
      const dateStr = tx.date.split('T')[0];
      const amount = tx.type === 'income' ? tx.amount : -tx.amount;
      dailyBalances[dateStr] = (dailyBalances[dateStr] || 0) + amount;
    });

    let cumulativeBalance = 0;
    const cumulativeData = Object.keys(dailyBalances).sort().map(date => {
      cumulativeBalance += dailyBalances[date];
      return { date, balance: cumulativeBalance };
    });

    return {
      labels: cumulativeData.map(item => item.date),
      dataPoints: cumulativeData.map(item => item.balance)
    };
  }, [transactions, timeInterval]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Balance History',
        data: dataPoints,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: context => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          const last = dataPoints[dataPoints.length - 1] || 0;
          if (last >= 0) {
            gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
            gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');
          } else {
            gradient.addColorStop(0, 'rgba(255, 99, 132, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 99, 132, 0.1)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: ctx => ctx.dataset.data[ctx.dataIndex] >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        pointBorderColor: 'white',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Balance: $${ctx.parsed.y.toFixed(2)}`,
          title: ctx => new Date(ctx[0].label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { callback: val => `$${val}` },
        position: 'right',
        beginAtZero: true
      }
    },
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'index', intersect: false }
  };

  const intervals = [
    { id: 'all', label: 'All' },
    { id: '5y', label: '5Y' },
    { id: '1y', label: '1Y' },
    { id: '6m', label: '6M' },
    { id: '3m', label: '3M' },
    { id: '1m', label: '1M' },
    { id: '7d', label: '7D' }
  ];

  return (
    <div className="balance-chart">
      <div className="d-flex justify-content-center mb-4">
        <div className="mobile-scroll-container">
          <div className="time-selector">
            {intervals.map(({ id, label }) => (
              <button
                key={id}
                className={`btn ${timeInterval === id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => onIntervalChange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default BalanceHistoryChart;