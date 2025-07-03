import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const generateDistinctColors = (count, saturation = 70, lightness = 60) => {
  const colors = [];
  const goldenRatio = 0.618033988749895;
  for (let i = 0; i < count; i++) {
    const hue = (i * goldenRatio * 360) % 360;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

const PieChartTemplate = ({ transactions, type }) => {
  const navigate = useNavigate();

  const filteredTransactions = transactions.filter(tx => tx.type === type);
  if (filteredTransactions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No {type} data available</p>
        <button
          onClick={() => navigate('/transactions')}
          className="piechart-add-btn"
        >
          Add {type === 'income' ? 'Income' : 'Expense'}
        </button>
      </div>
    );
  }

  const categoryTotals = {};
  filteredTransactions.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const sorted = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = sorted.reduce((sum, cat) => sum + cat.amount, 0);
  const display = [];
  let other = 0;
  sorted.forEach((cat, idx) => idx < 6 ? display.push(cat) : other += cat.amount);
  if (other > 0) display.push({ name: 'Others', amount: other });

  const labels = display.map(c => c.name);
  const data = display.map(c => c.amount);
  const bg = generateDistinctColors(labels.length);
  const chartData = {
    labels,
    datasets: [{ data, backgroundColor: bg, borderColor: '#f8fafc', borderWidth: 2, hoverOffset: 15 }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12, family: "'Inter', sans-serif" },
          padding: 15,
          generateLabels: chart => {
            const ds = chart.data.datasets[0];
            return chart.data.labels.map((label, i) => ({
              text: `${label}: $${ds.data[i].toFixed(2)}`,
              fillStyle: ds.backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      }
    },
    tooltip: {
      callbacks: {
        label: ctx => {
          const label = ctx.label || '';
          const val = ctx.raw || 0;
          const pct = Math.round((val / total) * 100);
          return `${label}: $${val.toFixed(2)} (${pct}%)`;
        }
      }
    }
  };

  return (
    <Pie data={chartData} options={options} />
  );
};

export const IncomePieChart = ({ transactions }) => (
  <PieChartTemplate transactions={transactions} type="income" />
);
export const ExpensesPieChart = ({ transactions }) => (
  <PieChartTemplate transactions={transactions} type="expense" />
);