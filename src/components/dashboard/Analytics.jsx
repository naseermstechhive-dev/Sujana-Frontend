import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useAdmin } from '../../contexts/AdminContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DEDUCTION_PER_GRAM = 400;

const Analytics = ({ billings, renewals, takeovers, cashEntries }) => {
  const { goldPrices } = useAdmin();
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [dailyData, setDailyData] = useState({});
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [overviewData, setOverviewData] = useState({});

  // Get average gold rate for profit calculations
  const getAverageGoldRate = () => {
    const rates = Object.values(goldPrices || {}).filter(r => r > 0);
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 11000;
  };

  // Calculate profit in gold (grams)
  const calculateProfitInGold = (billing) => {
    const items = billing.goldDetails?.items || billing.calculation?.items || [];
    if (items.length > 0) {
      let totalProfitGold = 0;
      items.forEach(item => {
        const net = (item.weight || 0) - (item.stoneWeight || item.stone || 0);
        const rate = item.selectedRatePerGram || billing.calculation?.selectedRatePerGram || 0;
        // Profit in gold = (Deduction per gram / Rate) × Net Weight
        // This represents how much gold value we gained from the deduction
        if (rate > 0) {
          totalProfitGold += (DEDUCTION_PER_GRAM / rate) * net;
        }
      });
      return totalProfitGold;
    } else {
      // Legacy single item
      const net = (billing.goldDetails?.weight || 0) - (billing.goldDetails?.stoneWeight || billing.calculation?.stone || 0);
      const rate = billing.calculation?.selectedRatePerGram || 0;
      if (rate > 0) {
        return (DEDUCTION_PER_GRAM / rate) * net;
      }
    }
    return 0;
  };

  // Calculate commission profit in gold
  const calculateCommissionInGold = (renewal) => {
    const commission = renewal.renewalDetails?.commissionAmount || 0;
    const avgRate = getAverageGoldRate();
    return avgRate > 0 ? commission / avgRate : 0;
  };

  // Calculate takeover profit in gold
  const calculateTakeoverProfitInGold = (takeover) => {
    const profitLoss = takeover.takeoverDetails?.profitLoss || 0;
    const avgRate = getAverageGoldRate();
    return avgRate > 0 ? Math.max(0, profitLoss / avgRate) : 0;
  };

  useEffect(() => {
    processAllData();
  }, [billings, renewals, takeovers, cashEntries, goldPrices]);

  useEffect(() => {
    if (viewMode === 'daily') {
    processDayData();
    } else if (viewMode === 'weekly') {
      processWeekData();
    } else if (viewMode === 'monthly') {
      processMonthData();
    }
  }, [selectedDate, selectedWeek, selectedMonth, viewMode, billings, renewals, takeovers]);

  const processAllData = () => {
    // Process all historical data (nothing resets)
    const daily = {};
    const weekly = {};
    const monthly = {};
    
    let totalGoldBought = 0;
    let totalProfitGold = 0;
    let totalCommissionGold = 0;
    let totalTakeoverProfitGold = 0;
    let totalCashPaid = 0;
    let totalTransactions = 0;

    // Process Billings (Physical Sales - buying gold from customers)
    billings.forEach(billing => {
      const date = new Date(billing.createdAt || billing.date);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = getWeekKey(date);
      const monthKey = date.toISOString().slice(0, 7);

      const items = billing.goldDetails?.items || billing.calculation?.items || [];
      let goldWeight = 0;
      if (items.length > 0) {
        items.forEach(item => {
          goldWeight += (item.weight || 0) - (item.stoneWeight || item.stone || 0);
        });
      } else {
        goldWeight = (billing.goldDetails?.weight || 0) - (billing.goldDetails?.stoneWeight || billing.calculation?.stone || 0);
      }

      const profitGold = calculateProfitInGold(billing);
      const cashPaid = billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0;

      // Daily
      if (!daily[dayKey]) daily[dayKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      daily[dayKey].goldBought += goldWeight;
      daily[dayKey].profitGold += profitGold;
      daily[dayKey].cashPaid += cashPaid;
      daily[dayKey].transactions += 1;

      // Weekly
      if (!weekly[weekKey]) weekly[weekKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      weekly[weekKey].goldBought += goldWeight;
      weekly[weekKey].profitGold += profitGold;
      weekly[weekKey].cashPaid += cashPaid;
      weekly[weekKey].transactions += 1;

      // Monthly
      if (!monthly[monthKey]) monthly[monthKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      monthly[monthKey].goldBought += goldWeight;
      monthly[monthKey].profitGold += profitGold;
      monthly[monthKey].cashPaid += cashPaid;
      monthly[monthKey].transactions += 1;

      totalGoldBought += goldWeight;
      totalProfitGold += profitGold;
      totalCashPaid += cashPaid;
      totalTransactions += 1;
    });

    // Process Renewals (Commission is profit)
    renewals.forEach(renewal => {
      const date = new Date(renewal.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = getWeekKey(date);
      const monthKey = date.toISOString().slice(0, 7);

      const commissionGold = calculateCommissionInGold(renewal);
      const cashPaid = renewal.renewalDetails?.renewalAmount || 0;

      if (!daily[dayKey]) daily[dayKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      daily[dayKey].commissionGold += commissionGold;
      daily[dayKey].cashPaid += cashPaid;
      daily[dayKey].transactions += 1;

      if (!weekly[weekKey]) weekly[weekKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      weekly[weekKey].commissionGold += commissionGold;
      weekly[weekKey].cashPaid += cashPaid;
      weekly[weekKey].transactions += 1;

      if (!monthly[monthKey]) monthly[monthKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      monthly[monthKey].commissionGold += commissionGold;
      monthly[monthKey].cashPaid += cashPaid;
      monthly[monthKey].transactions += 1;

      totalCommissionGold += commissionGold;
      totalCashPaid += cashPaid;
      totalTransactions += 1;
    });

    // Process Takeovers
    takeovers.forEach(takeover => {
      const date = new Date(takeover.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = getWeekKey(date);
      const monthKey = date.toISOString().slice(0, 7);

      const profitGold = calculateTakeoverProfitInGold(takeover);
      const cashPaid = takeover.takeoverDetails?.takeoverAmount || 0;

      if (!daily[dayKey]) daily[dayKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      daily[dayKey].takeoverProfitGold += profitGold;
      daily[dayKey].cashPaid += cashPaid;
      daily[dayKey].transactions += 1;

      if (!weekly[weekKey]) weekly[weekKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      weekly[weekKey].takeoverProfitGold += profitGold;
      weekly[weekKey].cashPaid += cashPaid;
      weekly[weekKey].transactions += 1;

      if (!monthly[monthKey]) monthly[monthKey] = { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
      monthly[monthKey].takeoverProfitGold += profitGold;
      monthly[monthKey].cashPaid += cashPaid;
      monthly[monthKey].transactions += 1;

      totalTakeoverProfitGold += profitGold;
      totalCashPaid += cashPaid;
      totalTransactions += 1;
    });

    setDailyData(daily);
    setWeeklyData(weekly);
    setMonthlyData(monthly);

    setOverviewData({
      totalGoldBought,
      totalProfitGold: totalProfitGold, // Physical sales profit
      totalCommissionGold,
      totalTakeoverProfitGold,
      totalAllProfitGold: totalProfitGold + totalCommissionGold + totalTakeoverProfitGold, // All profit combined
      totalCashPaid,
      totalTransactions,
    });
  };

  const getWeekKey = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
    return d.toISOString().split('T')[0];
  };

  const processDayData = () => {
    const day = selectedDate;
    const dayData = dailyData[day] || { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
    return dayData;
  };

  const processWeekData = () => {
    const week = selectedWeek || getWeekKey(new Date());
    const weekData = weeklyData[week] || { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
    return weekData;
  };

  const processMonthData = () => {
    const month = selectedMonth;
    const monthData = monthlyData[month] || { goldBought: 0, profitGold: 0, commissionGold: 0, takeoverProfitGold: 0, cashPaid: 0, transactions: 0 };
    return monthData;
  };

  const getCurrentViewData = () => {
    if (viewMode === 'daily') return processDayData();
    if (viewMode === 'weekly') return processWeekData();
    return processMonthData();
  };

  const currentData = getCurrentViewData();
  const totalProfitGold = (currentData.profitGold || 0) + (currentData.commissionGold || 0) + (currentData.takeoverProfitGold || 0);

  // Chart data
  const profitChartData = {
    labels: Object.keys(monthlyData).sort(),
    datasets: [
      {
        label: 'Profit in Gold (g)',
        data: Object.keys(monthlyData).sort().map(month => {
          const data = monthlyData[month];
          return (data.profitGold || 0) + (data.commissionGold || 0) + (data.takeoverProfitGold || 0);
        }),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
      },
    ],
  };

  const goldBoughtChartData = {
    labels: Object.keys(monthlyData).sort(),
    datasets: [
      {
        label: 'Gold Bought (g)',
        data: Object.keys(monthlyData).sort().map(month => monthlyData[month].goldBought || 0),
        backgroundColor: 'rgba(40, 167, 69, 0.6)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2,
      },
    ],
  };

  const profitBreakdownData = {
    labels: ['Physical Sales Profit', 'Commission Profit', 'Takeover Profit'],
    datasets: [
      {
        data: [
          (overviewData.totalProfitGold || 0),
          (overviewData.totalCommissionGold || 0),
          (overviewData.totalTakeoverProfitGold || 0),
        ],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',
          'rgba(0, 123, 255, 0.8)',
          'rgba(220, 53, 69, 0.8)',
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(0, 123, 255, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h2>
        <p className="text-yellow-100">Complete business analytics with profit tracking in gold</p>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'daily'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'weekly'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'monthly'
                ? 'bg-yellow-500 text-white shadow-lg'
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
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        )}
        {viewMode === 'weekly' && (
          <input
            type="week"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        )}
        {viewMode === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        )}
      </div>

      {/* Current View Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Gold Bought</h4>
          <p className="text-3xl font-bold">{currentData.goldBought?.toFixed(3) || 0} g</p>
          <p className="text-sm mt-2 opacity-75">{currentData.transactions || 0} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Total Profit (Gold)</h4>
          <p className="text-3xl font-bold">{totalProfitGold.toFixed(3)} g</p>
          <p className="text-sm mt-2 opacity-75">All profit sources</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Cash Paid</h4>
          <p className="text-3xl font-bold">₹{currentData.cashPaid?.toLocaleString('en-IN') || 0}</p>
          <p className="text-sm mt-2 opacity-75">Total payments</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Transactions</h4>
          <p className="text-3xl font-bold">{currentData.transactions || 0}</p>
          <p className="text-sm mt-2 opacity-75">Total count</p>
        </div>
      </div>

      {/* Profit Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Profit Breakdown ({viewMode})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Physical Sales Profit</h4>
            <p className="text-2xl font-bold text-yellow-600">{currentData.profitGold?.toFixed(3) || 0} g</p>
            <p className="text-sm text-gray-600 mt-1">From 400/g deduction</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Commission Profit</h4>
            <p className="text-2xl font-bold text-blue-600">{currentData.commissionGold?.toFixed(3) || 0} g</p>
            <p className="text-sm text-gray-600 mt-1">From renewals</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Takeover Profit</h4>
            <p className="text-2xl font-bold text-red-600">{currentData.takeoverProfitGold?.toFixed(3) || 0} g</p>
            <p className="text-sm text-gray-600 mt-1">From takeovers</p>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-4">📈 Overall Summary (All Time)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h4 className="text-sm opacity-75 mb-1">Total Gold Bought</h4>
            <p className="text-2xl font-bold">{overviewData.totalGoldBought?.toFixed(3) || 0} g</p>
          </div>
          <div>
            <h4 className="text-sm opacity-75 mb-1">Total Profit (Gold)</h4>
            <p className="text-2xl font-bold text-yellow-400">{overviewData.totalAllProfitGold?.toFixed(3) || 0} g</p>
        </div>
          <div>
            <h4 className="text-sm opacity-75 mb-1">Total Cash Paid</h4>
            <p className="text-2xl font-bold">₹{overviewData.totalCashPaid?.toLocaleString('en-IN') || 0}</p>
          </div>
          <div>
            <h4 className="text-sm opacity-75 mb-1">Total Transactions</h4>
            <p className="text-2xl font-bold">{overviewData.totalTransactions || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Monthly Profit in Gold</h3>
          <Bar
            data={profitChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Profit (grams)' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toFixed(2) + ' g';
                    }
                  }
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Monthly Gold Bought</h3>
          <Bar
            data={goldBoughtChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Gold Bought (grams)' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toFixed(2) + ' g';
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Profit Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold mb-4">Profit Distribution (All Time)</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Pie
              data={profitBreakdownData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ' + context.parsed.toFixed(3) + ' g';
                      }
                    }
                  }
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
