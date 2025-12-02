import React, { useState, useMemo } from 'react';
import { cashAPI } from '../../services/api';

const CashVault = ({
  user,
  cashEntries,
  cashAmount,
  setCashAmount,
  fetchCashVault,
  checkInitialCashStatus,
  hasInitialCash,
  marginData,
  fetchMargin,
  dailyTransactions,
  fetchDailyTransactions,
  resetInitialCash,
  resetGoldTransactions,
  billings
}) => {
  // Filter to show only today's transactions
  const todayTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return cashEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= today && entryDate < tomorrow;
    });
  }, [cashEntries]);

  // Calculate today's totals
  const todayTotals = useMemo(() => {
    const initialCash = todayTransactions
      .filter((e) => e.type === 'initial')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalDeductions = todayTransactions
      .filter((e) => e.type === 'billing')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const remainingCash = initialCash - totalDeductions;
    
    // Calculate margin from billings (commission + hidden deductions)
    const todayBillings = billings?.filter(b => {
      const billingDate = new Date(b.createdAt || b.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return billingDate >= today && billingDate < tomorrow;
    }) || [];
    
    // Margin = Total amount paid - (Gold value at purchase)
    // For now, we'll use commission amounts for Release transactions
    const margin = todayBillings.reduce((acc, b) => {
      if (b.billingType === 'Release' && b.commissionAmount) {
        return acc + b.commissionAmount;
      }
      // For Physical and TakeOver, margin is calculated from hidden deductions
      // This would need to be calculated based on gold sale price vs purchase price
      return acc;
    }, 0);

    return {
      initialCash,
      totalDeductions,
      remainingCash,
      margin
    };
  }, [todayTransactions, billings]);
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cash Transactions</h2>
      <p className="text-gray-600 mb-4">Cash inflow and outflow details.</p>

      {/* Add Cash Form */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-lg mb-4">Add Cash Entry</h3>
        {user.role === 'employee' && hasInitialCash && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Initial cash has already been set. Only admin can reset and allow new initial cash entry.
          </div>
        )}
        <form
          className="flex gap-4"
          onSubmit={async (e) => {
            e.preventDefault();

            // Check if employee is trying to add initial cash when it's already set
            if (user.role === 'employee' && hasInitialCash) {
              alert('Initial cash has already been set. Only admin can reset it.');
              return;
            }

            try {
              await cashAPI.addCash(cashAmount);
              setCashAmount('');
              fetchCashVault();
              checkInitialCashStatus();
              alert('Cash added successfully!');
            } catch (error) {
              alert(error.message);
            }
          }}
        >
          <input
            type="number"
            placeholder="Amount"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            disabled={user.role === 'employee' && hasInitialCash}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-300"
            disabled={user.role === 'employee' && hasInitialCash}
          >
            Add Cash
          </button>
        </form>

        {/* Admin Controls */}
        {user.role === 'admin' && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="font-semibold text-md mb-3">Admin Controls</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetInitialCash}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
              >
                Reset Initial Cash
              </button>
              <button
                onClick={fetchMargin}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
              >
                Check Margin
              </button>
              <button
                onClick={resetGoldTransactions}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
              >
                Reset All Gold
              </button>
              <button
                onClick={fetchDailyTransactions}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
              >
                Daily Transactions
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to end the day? This will:\n- Save today\'s margin data (for Analytics)\n- Reset initial cash (for next day)\n- Reset gold transactions\n\nNote: All transaction data is preserved in MongoDB for Analytics. Cash Vault will only show tomorrow\'s transactions after you set new initial cash.')) {
                    return;
                  }
                  try {
                    // Calculate and save margin (for historical record in Analytics)
                    await fetchMargin();
                    // Reset initial cash only (billing deductions stay in DB for Analytics)
                    await cashAPI.resetAllCash();
                    // Reset gold transactions
                    await resetGoldTransactions();
                    // Refresh cash vault
                    await fetchCashVault();
                    // Refresh initial cash status
                    await checkInitialCashStatus();
                    alert('Day ended successfully! Initial cash reset. All historical data preserved in MongoDB for Analytics and Expense Tracker. Set new initial cash to start next day.');
                  } catch (error) {
                    alert('Error ending day: ' + error.message);
                  }
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
              >
                End Day & Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cash Summary - Today's Data Only */}
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Showing only today's transactions. Historical data is available in Analytics and Expense Tracker.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold">Initial Cash (Today)</h3>
          <p className="text-2xl font-bold text-green-700">
            ₹{todayTotals.initialCash.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold">Total Deductions (Today)</h3>
          <p className="text-2xl font-bold text-red-700">
            ₹{todayTotals.totalDeductions.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-600 mt-1">Physical + Release + TakeOver</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold">Remaining Cash</h3>
          <p className="text-2xl font-bold text-blue-700">
            ₹{todayTotals.remainingCash.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold">Margin (Today)</h3>
          <p className="text-2xl font-bold text-purple-700">
            ₹{todayTotals.margin.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-600 mt-1">Commission + Hidden Deductions</p>
        </div>
      </div>

      {/* Margin Display */}
      {marginData && (
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-4">Current Margin</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Initial Cash</div>
              <div className="text-2xl font-bold text-green-600">₹{marginData.initialCash.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Total Billings</div>
              <div className="text-2xl font-bold text-red-600">₹{marginData.totalBillings.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Remaining Cash</div>
              <div className="text-2xl font-bold text-blue-600">₹{marginData.remainingCash.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Margin</div>
              <div className={`text-2xl font-bold ${marginData.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{marginData.margin.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Transactions Display */}
      {dailyTransactions && (
        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-4">Daily Transactions Summary ({dailyTransactions.date})</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Physical Sales</div>
              <div className="text-xl font-bold text-blue-600">₹{dailyTransactions.summary.totalBillings.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Releases</div>
              <div className="text-xl font-bold text-green-600">₹{dailyTransactions.summary.totalRenewals.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Takeovers</div>
              <div className="text-xl font-bold text-orange-600">₹{dailyTransactions.summary.totalTakeovers.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-600">Net Cash Flow</div>
              <div className={`text-xl font-bold ${dailyTransactions.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{dailyTransactions.summary.netCashFlow.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Total Transactions: {
              dailyTransactions.transactions.billings.length +
              dailyTransactions.transactions.renewals.length +
              dailyTransactions.transactions.takeovers.length
            }
          </div>
        </div>
      )}

      {/* Transactions List - Today Only */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Today's Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  Time
                </th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  Type
                </th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  Description
                </th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  Amount
                </th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">
                  Added By
                </th>
              </tr>
            </thead>
            <tbody>
              {todayTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    No transactions for today yet.
                  </td>
                </tr>
              ) : (
                todayTransactions.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 capitalize text-xs md:text-sm">
                      {entry.type}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {entry.type === 'initial' ? 'Initial cash added' :
                       entry.type === 'billing' ? 'Cash deduction (Physical/Release/TakeOver)' :
                       entry.type === 'remaining' ? 'Remaining cash added' : entry.type}
                    </td>
                    <td className={`border border-gray-300 px-2 md:px-4 py-2 font-bold text-xs md:text-sm ${
                      entry.type === 'initial' || entry.type === 'remaining' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.type === 'initial' || entry.type === 'remaining' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                      {entry.addedBy?.name || 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashVault;