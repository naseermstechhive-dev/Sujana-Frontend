import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAdmin } from '../../contexts/AdminContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseTracker = ({ cashEntries, billings, renewals, takeovers }) => {
  const { goldPrices } = useAdmin();
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [monthlyExpenses, setMonthlyExpenses] = useState({});
  const [weeklyExpenses, setWeeklyExpenses] = useState({});
  const [dailyExpenses, setDailyExpenses] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalExpensesGold, setTotalExpensesGold] = useState(0);

  // Get average gold rate
  const getAverageGoldRate = () => {
    const rates = Object.values(goldPrices || {}).filter(r => r > 0);
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 11000;
  };

  useEffect(() => {
    processExpenses();
  }, [cashEntries, billings, renewals, takeovers, goldPrices]);

  const processExpenses = () => {
    // All cash outflows are expenses
    const expenses = cashEntries.filter(entry => entry.type === 'billing' || entry.type === 'expense');
    const currentYear = new Date().getFullYear();
    const monthly = {};
    const weekly = {};
    const daily = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    let total = 0;
    const avgRate = getAverageGoldRate();

    expenses.forEach(entry => {
      const date = new Date(entry.createdAt);
      total += entry.amount;

      // Monthly
      if (date.getFullYear() === currentYear) {
        const month = date.toISOString().slice(0, 7);
        if (!monthly[month]) monthly[month] = { amount: 0, gold: 0 };
        monthly[month].amount += entry.amount;
        monthly[month].gold += avgRate > 0 ? entry.amount / avgRate : 0;
      }

      // Weekly
      if (date >= twelveWeeksAgo) {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        if (!weekly[weekKey]) weekly[weekKey] = { amount: 0, gold: 0 };
        weekly[weekKey].amount += entry.amount;
        weekly[weekKey].gold += avgRate > 0 ? entry.amount / avgRate : 0;
      }

      // Daily
      if (date >= thirtyDaysAgo) {
        const day = date.toISOString().split('T')[0];
        if (!daily[day]) daily[day] = { amount: 0, gold: 0 };
        daily[day].amount += entry.amount;
        daily[day].gold += avgRate > 0 ? entry.amount / avgRate : 0;
      }
    });

    setMonthlyExpenses(monthly);
    setWeeklyExpenses(weekly);
    setDailyExpenses(daily);
    setTotalExpenses(total);
    setTotalExpensesGold(avgRate > 0 ? total / avgRate : 0);
  };

  const getCurrentViewData = () => {
    if (viewMode === 'daily') {
      const day = selectedDate;
      return dailyExpenses[day] || { amount: 0, gold: 0 };
    } else if (viewMode === 'weekly') {
      const week = selectedWeek || getWeekKey(new Date());
      return weeklyExpenses[week] || { amount: 0, gold: 0 };
    } else {
      const month = selectedMonth;
      return monthlyExpenses[month] || { amount: 0, gold: 0 };
    }
  };

  const getWeekKey = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  };

  const currentData = getCurrentViewData();

  const monthlyChartData = {
    labels: Object.keys(monthlyExpenses).sort(),
    datasets: [
      {
        label: 'Expenses (₹)',
        data: Object.keys(monthlyExpenses).sort().map(month => monthlyExpenses[month].amount),
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 2,
      },
      {
        label: 'Expenses (Gold - g)',
        data: Object.keys(monthlyExpenses).sort().map(month => monthlyExpenses[month].gold),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const weeklyChartData = {
    labels: Object.keys(weeklyExpenses).sort().map(week => {
      const date = new Date(week);
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }),
    datasets: [
      {
        label: 'Expenses (₹)',
        data: Object.keys(weeklyExpenses).sort().map(week => weeklyExpenses[week].amount),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
      },
    ],
  };

  const dailyChartData = {
    labels: Object.keys(dailyExpenses).sort(),
    datasets: [
      {
        label: 'Daily Expenses (₹)',
        data: Object.keys(dailyExpenses).sort().map(day => dailyExpenses[day].amount),
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">💰 Expense Tracker</h2>
        <p className="text-red-100">Track all cash outflows and expenses</p>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'daily'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'weekly'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'monthly'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>

        {viewMode === 'daily' && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        )}
        {viewMode === 'weekly' && (
          <input
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        )}
        {viewMode === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="font-semibold text-red-100 mb-2">Total Expenses</h4>
          <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <p className="text-sm mt-2 text-red-200">{totalExpensesGold.toFixed(3)} g (gold equivalent)</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="font-semibold text-orange-100 mb-2">Current View</h4>
          <p className="text-3xl font-bold">₹{currentData.amount?.toLocaleString('en-IN') || 0}</p>
          <p className="text-sm mt-2 text-orange-200">{currentData.gold?.toFixed(3) || 0} g (gold equivalent)</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="font-semibold text-yellow-100 mb-2">Average Daily</h4>
          <p className="text-3xl font-bold">
            ₹{Math.round(totalExpenses / Math.max(Object.keys(dailyExpenses).length, 1)).toLocaleString('en-IN')}
          </p>
          <p className="text-sm mt-2 text-yellow-200">Based on last 30 days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {viewMode === 'monthly' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Monthly Expense Analysis</h3>
            <Bar
              data={monthlyChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Monthly Expenses Overview' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString('en-IN');
                      }
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value.toFixed(2) + ' g';
                      }
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  }
                }
              }}
            />
          </div>
        )}

        {viewMode === 'weekly' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Weekly Expense Trends</h3>
            <Bar
              data={weeklyChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Weekly Expenses (Last 12 Weeks)' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString('en-IN');
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}

        {viewMode === 'daily' && (
          <div>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Daily Expense Patterns</h3>
            <Line
              data={dailyChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Daily Expenses (Last 30 Days)' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString('en-IN');
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Recent Expenses List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="font-bold text-xl mb-6 text-gray-800">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Processed By</th>
              </tr>
            </thead>
            <tbody>
              {cashEntries
                .filter(entry => entry.type === 'billing' || entry.type === 'expense')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 50)
                .map((entry, index) => (
                  <tr key={entry._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700">
                      {new Date(entry.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        {entry.type === 'billing' ? 'Billing Payment' : 'Expense'}
                      </span>
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3 font-bold text-red-600 text-sm">
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-700">
                      {entry.addedBy?.name || 'System'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {cashEntries.filter(entry => entry.type === 'billing' || entry.type === 'expense').length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg">No expenses recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
