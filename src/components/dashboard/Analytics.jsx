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

const Analytics = ({ billings, renewals, takeovers, cashEntries }) => {
  const [monthlyData, setMonthlyData] = useState({});
  const [dailyData, setDailyData] = useState({});
  const [overviewData, setOverviewData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayData, setDayData] = useState({});

  useEffect(() => {
    processData();
  }, [billings, renewals, takeovers, cashEntries]);

  useEffect(() => {
    processDayData();
  }, [selectedDate, billings, renewals, takeovers, cashEntries]);

  const processData = () => {
    // Monthly Analytics
    const monthly = {};
    const currentYear = new Date().getFullYear();

    // Process Billings
    billings.forEach(billing => {
      const date = new Date(billing.createdAt || billing.date);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthly[month]) monthly[month] = { billings: 0, renewals: 0, takeovers: 0, cash: 0, goldWeight: 0 };
        monthly[month].billings += billing.calculation?.finalPayout || 0;
        monthly[month].goldWeight += billing.goldDetails?.weight || 0;
      }
    });

    // Process Renewals
    renewals.forEach(renewal => {
      const date = new Date(renewal.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthly[month]) monthly[month] = { billings: 0, renewals: 0, takeovers: 0, cash: 0 };
        monthly[month].renewals += renewal.renewalDetails?.commissionAmount || 0;
      }
    });

    // Process Takeovers
    takeovers.forEach(takeover => {
      const date = new Date(takeover.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthly[month]) monthly[month] = { billings: 0, renewals: 0, takeovers: 0, cash: 0 };
        monthly[month].takeovers += takeover.takeoverDetails?.takeoverAmount || 0;
      }
    });

    // Process Cash
    cashEntries.forEach(entry => {
      const date = new Date(entry.createdAt);
      if (date.getFullYear() === currentYear) {
        const month = date.toLocaleString('default', { month: 'short' });
        if (!monthly[month]) monthly[month] = { billings: 0, renewals: 0, takeovers: 0, cash: 0 };
        monthly[month].cash += entry.amount;
      }
    });

    setMonthlyData(monthly);

    // Daily Analytics (last 30 days)
    const daily = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    billings.forEach(billing => {
      const date = new Date(billing.createdAt || billing.date);
      if (date >= thirtyDaysAgo) {
        const day = date.toISOString().split('T')[0];
        if (!daily[day]) daily[day] = { billings: 0, count: 0, goldWeight: 0 };
        daily[day].billings += billing.calculation?.finalPayout || 0;
        daily[day].count += 1;
        daily[day].goldWeight += billing.goldDetails?.weight || 0;
      }
    });

    setDailyData(daily);

    // Overview Data
    const totalBillings = billings.reduce((sum, b) => sum + (b.calculation?.finalPayout || 0), 0);
    const totalRenewals = renewals.reduce((sum, r) => sum + (r.renewalDetails?.commissionAmount || 0), 0);
    const totalTakeovers = takeovers.reduce((sum, t) => sum + (t.takeoverDetails?.takeoverAmount || 0), 0);
    const totalCash = cashEntries.reduce((sum, c) => sum + c.amount, 0);

    setOverviewData({
      totalBillings,
      totalRenewals,
      totalTakeovers,
      totalCash,
      totalTransactions: billings.length + renewals.length + takeovers.length
    });
  };

  const processDayData = () => {
    const day = selectedDate;
    const dayBillings = billings.filter(b => new Date(b.createdAt || b.date).toISOString().split('T')[0] === day);
    const dayRenewals = renewals.filter(r => new Date(r.createdAt).toISOString().split('T')[0] === day);
    const dayTakeovers = takeovers.filter(t => new Date(t.createdAt).toISOString().split('T')[0] === day);
    const dayCash = cashEntries.filter(c => new Date(c.createdAt).toISOString().split('T')[0] === day);

    const totalSales = dayBillings.reduce((sum, b) => sum + (b.calculation?.finalPayout || 0), 0);
    const totalRenewals = dayRenewals.reduce((sum, r) => sum + (r.renewalDetails?.commissionAmount || 0), 0);
    const totalTakeovers = dayTakeovers.reduce((sum, t) => sum + (t.takeoverDetails?.takeoverAmount || 0), 0);
    const totalCash = dayCash.reduce((sum, c) => sum + c.amount, 0);
    const totalGoldWeight = dayBillings.reduce((sum, b) => sum + (b.goldDetails?.weight || 0), 0);
    const totalTransactions = dayBillings.length + dayRenewals.length + dayTakeovers.length;

    setDayData({
      totalSales,
      totalRenewals,
      totalTakeovers,
      totalCash,
      totalGoldWeight,
      totalTransactions,
      billingsCount: dayBillings.length,
      renewalsCount: dayRenewals.length,
      takeoversCount: dayTakeovers.length,
    });
  };

  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Physical Sales',
        data: Object.values(monthlyData).map(d => d.billings),
        backgroundColor: 'rgba(255, 193, 7, 0.6)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
      },
      {
        label: 'Renewals',
        data: Object.values(monthlyData).map(d => d.renewals),
        backgroundColor: 'rgba(0, 123, 255, 0.6)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Takeovers',
        data: Object.values(monthlyData).map(d => d.takeovers),
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
      },
    ],
  };

  const dailyChartData = {
    labels: Object.keys(dailyData).sort(),
    datasets: [
      {
        label: 'Daily Sales Amount',
        data: Object.keys(dailyData).sort().map(day => dailyData[day].billings),
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Physical Sales', 'Renewals', 'Takeovers', 'Cash Transactions'],
    datasets: [
      {
        data: [overviewData.totalBillings, overviewData.totalRenewals, overviewData.totalTakeovers, overviewData.totalCash],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',
          'rgba(0, 123, 255, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(40, 167, 69, 0.8)',
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(0, 123, 255, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(40, 167, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <p className="text-gray-600 mb-6">Comprehensive analytics and insights for your gold trading operations.</p>

      {/* Search Daily Analytics */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-lg mb-4">Search Daily Analytics</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => processDayData()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Daily Analytics Display */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Daily Analytics for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
            <h4 className="font-semibold text-yellow-800">Total Sales</h4>
            <p className="text-2xl font-bold text-yellow-600">₹{dayData.totalSales?.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600">{dayData.billingsCount} transactions</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
            <h4 className="font-semibold text-blue-800">Renewals</h4>
            <p className="text-2xl font-bold text-blue-600">₹{dayData.totalRenewals?.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600">{dayData.renewalsCount} transactions</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
            <h4 className="font-semibold text-red-800">Takeovers</h4>
            <p className="text-2xl font-bold text-red-600">₹{dayData.totalTakeovers?.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-600">{dayData.takeoversCount} transactions</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
            <h4 className="font-semibold text-green-800">Gold Weight Sold</h4>
            <p className="text-2xl font-bold text-green-600">{dayData.totalGoldWeight?.toFixed(2)} g</p>
            <p className="text-sm text-gray-600">Total assets</p>
          </div>
        </div>

        {/* Daily Transactions Charts */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold mb-4">Transaction Amounts</h4>
            <Bar
              data={{
                labels: ['Physical Sales', 'Renewals', 'Takeovers'],
                datasets: [
                  {
                    label: 'Amount (₹)',
                    data: [dayData.totalSales || 0, dayData.totalRenewals || 0, dayData.totalTakeovers || 0],
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
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Amounts' },
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
          <div>
            <h4 className="text-md font-semibold mb-4">Gold Weight Acquired</h4>
            <Bar
              data={{
                labels: ['Gold Weight'],
                datasets: [
                  {
                    label: 'Weight (g)',
                    data: [dayData.totalGoldWeight || 0],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Gold Acquired' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
          <h4 className="font-semibold text-yellow-800">Total Sales</h4>
          <p className="text-2xl font-bold text-yellow-600">₹{overviewData.totalBillings?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="font-semibold text-blue-800">Total Renewals</h4>
          <p className="text-2xl font-bold text-blue-600">₹{overviewData.totalRenewals?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
          <h4 className="font-semibold text-red-800">Total Takeovers</h4>
          <p className="text-2xl font-bold text-red-600">₹{overviewData.totalTakeovers?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
          <h4 className="font-semibold text-green-800">Total Transactions</h4>
          <p className="text-2xl font-bold text-green-600">{overviewData.totalTransactions}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Breakdown</h3>
          <Bar
            data={monthlyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Revenue by Month' },
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

        {/* Daily Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Daily Sales Trend (Last 30 Days)</h3>
          <Line
            data={dailyChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Daily Sales Amount' },
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
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: true, text: 'Revenue Sources' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Gold Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Gold Weight */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Monthly Gold Weight Acquired</h3>
          <Bar
            data={{
              labels: Object.keys(monthlyData),
              datasets: [
                {
                  label: 'Gold Weight (g)',
                  data: Object.values(monthlyData).map(d => d.goldWeight || 0),
                  backgroundColor: 'rgba(40, 167, 69, 0.6)',
                  borderColor: 'rgba(40, 167, 69, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Gold Weight by Month' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                }
              }
            }}
          />
        </div>

        {/* Daily Gold Weight Trend */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Daily Gold Weight Trend (Last 30 Days)</h3>
          <Line
            data={{
              labels: Object.keys(dailyData).sort(),
              datasets: [
                {
                  label: 'Gold Weight (g)',
                  data: Object.keys(dailyData).sort().map(day => dailyData[day].goldWeight || 0),
                  borderColor: 'rgba(40, 167, 69, 1)',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Daily Gold Weight' },
              },
              scales: {
                y: {
                  beginAtZero: true,
                }
              }
            }}
          />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Average Transaction Value:</span>
              <span className="font-bold">₹{(overviewData.totalBillings / Math.max(billings.length, 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Gold Weight Sold:</span>
              <span className="font-bold">{billings.reduce((sum, b) => sum + (b.goldDetails?.weight || 0), 0).toFixed(2)} g</span>
            </div>
            <div className="flex justify-between">
              <span>Active Customers:</span>
              <span className="font-bold">{new Set(billings.map(b => b.customer?._id)).size}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Monthly Growth Rate:</span>
              <span className="font-bold text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Satisfaction:</span>
              <span className="font-bold text-blue-600">95%</span>
            </div>
            <div className="flex justify-between">
              <span>Operational Efficiency:</span>
              <span className="font-bold text-purple-600">88%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;