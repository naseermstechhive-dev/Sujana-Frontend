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

const ExpenseTracker = ({ cashEntries }) => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [monthlyExpenses, setMonthlyExpenses] = useState({});
  const [weeklyExpenses, setWeeklyExpenses] = useState({});
  const [dailyExpenses, setDailyExpenses] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    processExpenses();
  }, [cashEntries]);

  const processExpenses = () => {
    const expenses = cashEntries.filter(entry => entry.type === 'billing');
    const currentYear = new Date().getFullYear();
    const monthly = {};
    const weekly = {};
    const daily = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    let total = 0;

    expenses.forEach(entry => {
      const date = new Date(entry.createdAt);
      total += entry.amount;

      // Monthly
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthly[month]) monthly[month] = 0;
        monthly[month] += entry.amount;
      }

      // Weekly
      if (date >= twelveWeeksAgo) {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        if (!weekly[weekKey]) weekly[weekKey] = 0;
        weekly[weekKey] += entry.amount;
      }

      // Daily
      if (date >= thirtyDaysAgo) {
        const day = date.toISOString().split('T')[0];
        if (!daily[day]) daily[day] = 0;
        daily[day] += entry.amount;
      }
    });

    setMonthlyExpenses(monthly);
    setWeeklyExpenses(weekly);
    setDailyExpenses(daily);
    setTotalExpenses(total);
  };

  const monthlyChartData = {
    labels: Object.keys(monthlyExpenses),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(monthlyExpenses),
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
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
        label: 'Weekly Expenses',
        data: Object.keys(weeklyExpenses).sort().map(week => weeklyExpenses[week]),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
      },
    ],
  };

  const dailyChartData = {
    labels: Object.keys(dailyExpenses).sort(),
    datasets: [
      {
        label: 'Daily Expenses',
        data: Object.keys(dailyExpenses).sort().map(day => dailyExpenses[day]),
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-6 rounded-2xl text-white mb-6 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">💎 Premium Expense Tracker</h2>
        <p className="text-pink-100">Comprehensive expense analysis with advanced insights and premium visualizations.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:space-x-1 mb-6 bg-gray-100 p-1 rounded-lg shadow-md">
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
            activeTab === 'monthly'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          📅 Monthly
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
            activeTab === 'weekly'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          📊 Weekly
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
          }`}
        >
          📈 Daily
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="font-semibold text-red-100 mb-2">💰 Total Expenses</h4>
          <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <div className="mt-2 text-red-200 text-sm">All time expenditure</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="font-semibold text-orange-100 mb-2">📊 This Month</h4>
          <p className="text-3xl font-bold">
            ₹{Object.values(monthlyExpenses)[Object.values(monthlyExpenses).length - 1]?.toLocaleString('en-IN') || 0}
          </p>
          <div className="mt-2 text-orange-200 text-sm">Current month spending</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <h4 className="font-semibold text-yellow-100 mb-2">⚡ Average Daily</h4>
          <p className="text-3xl font-bold">
            ₹{Math.round(totalExpenses / Math.max(Object.keys(dailyExpenses).length, 1)).toLocaleString('en-IN')}
          </p>
          <div className="mt-2 text-yellow-200 text-sm">Daily expense average</div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8">
        {activeTab === 'monthly' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-blue-800">📅 Monthly Expense Analysis</h3>
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
                  }
                }
              }}
            />
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-green-800">📊 Weekly Expense Trends</h3>
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

        {activeTab === 'daily' && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-purple-800">📈 Daily Expense Patterns</h3>
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

      {/* Premium Expenses List */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-xl mb-6 text-gray-800 flex items-center">
          💳 Recent Expenses
          <span className="ml-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
            Premium
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold">Date & Time</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold">Description</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold">Amount</th>
                <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold">Processed By</th>
              </tr>
            </thead>
            <tbody>
              {cashEntries
                .filter(entry => entry.type === 'billing')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 50) // Show last 50
                .map((entry, index) => (
                  <tr key={entry._id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="border-b border-gray-200 px-3 md:px-6 py-4 text-xs md:text-sm text-gray-700">
                      {new Date(entry.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="border-b border-gray-200 px-3 md:px-6 py-4 text-xs md:text-sm text-gray-700">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        Billing Deduction
                      </span>
                    </td>
                    <td className="border-b border-gray-200 px-3 md:px-6 py-4 font-bold text-red-600 text-xs md:text-sm">
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="border-b border-gray-200 px-3 md:px-6 py-4 text-xs md:text-sm text-gray-700">
                      {entry.addedBy?.name || 'System'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {cashEntries.filter(entry => entry.type === 'billing').length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg">No expenses recorded yet.</p>
            <p className="text-sm">Start tracking your business expenses!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;