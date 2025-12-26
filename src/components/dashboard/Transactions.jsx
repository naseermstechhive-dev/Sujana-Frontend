import React, { useState, useMemo } from 'react';
import { FaFileInvoice, FaSync, FaHandHoldingUsd, FaCoins } from 'react-icons/fa';

const Transactions = ({ billings, renewals, takeovers, cashEntries }) => {
  const [filterType, setFilterType] = useState('all'); // all, physical, release, takeover
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, name

  // Combine all transactions
  const allTransactions = useMemo(() => {
    const transactions = [];

    // Physical Sales (Billings)
    billings.forEach(billing => {
      const items = billing.goldDetails?.items || billing.calculation?.items || [];
      let totalGoldWeight = 0;
      let totalNetWeight = 0;
      
      if (items.length > 0) {
        items.forEach(item => {
          const gross = item.weight || 0;
          const stone = item.stoneWeight || item.stone || 0;
          totalGoldWeight += gross;
          totalNetWeight += gross - stone;
        });
      } else {
        totalGoldWeight = billing.goldDetails?.weight || 0;
        totalNetWeight = (billing.goldDetails?.weight || 0) - (billing.goldDetails?.stoneWeight || billing.calculation?.stone || 0);
      }

      transactions.push({
        id: billing._id,
        type: 'Physical',
        invoiceNo: billing.invoiceNo,
        date: new Date(billing.createdAt || billing.date),
        customerName: billing.customer?.name || 'N/A',
        customerMobile: billing.customer?.mobile || 'N/A',
        goldWeight: totalGoldWeight,
        netWeight: totalNetWeight,
        amount: billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0,
        purity: billing.goldDetails?.purityLabel || 'N/A',
        rate: billing.calculation?.selectedRatePerGram || 0,
        billingType: billing.billingType || 'Physical',
        data: billing,
      });
    });

    // Release Transactions (Renewals)
    renewals.forEach(renewal => {
      const gross = renewal.goldDetails?.weight || 0;
      const stone = renewal.goldDetails?.stoneWeight || 0;
      const net = gross - stone;

      transactions.push({
        id: renewal._id,
        type: 'Release',
        invoiceNo: renewal.renewalNo || renewal.invoiceNo || 'N/A',
        date: new Date(renewal.createdAt || renewal.date),
        customerName: renewal.customer?.name || 'N/A',
        customerMobile: renewal.customer?.mobile || 'N/A',
        goldWeight: gross,
        netWeight: net,
        amount: renewal.renewalDetails?.renewalAmount || 0,
        commission: renewal.renewalDetails?.commissionAmount || 0,
        purity: renewal.goldDetails?.purityLabel || 'N/A',
        rate: renewal.calculation?.selectedRatePerGram || 0,
        data: renewal,
      });
    });

    // Takeover Transactions
    takeovers.forEach(takeover => {
      const gross = takeover.goldDetails?.weight || 0;
      const stone = takeover.goldDetails?.stoneWeight || 0;
      const net = gross - stone;

      transactions.push({
        id: takeover._id,
        type: 'TakeOver',
        invoiceNo: takeover.takeoverNo || takeover.invoiceNo || 'N/A',
        date: new Date(takeover.createdAt || takeover.date),
        customerName: takeover.customer?.name || 'N/A',
        customerMobile: takeover.customer?.mobile || 'N/A',
        goldWeight: gross,
        netWeight: net,
        amount: takeover.takeoverDetails?.takeoverAmount || 0,
        purity: takeover.goldDetails?.purityLabel || 'N/A',
        rate: takeover.calculation?.selectedRatePerGram || 0,
        data: takeover,
      });
    });

    return transactions;
  }, [billings, renewals, takeovers]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => {
        if (filterType === 'physical') return t.type === 'Physical';
        if (filterType === 'release') return t.type === 'Release';
        if (filterType === 'takeover') return t.type === 'TakeOver';
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.customerName.toLowerCase().includes(query) ||
        t.customerMobile.includes(query) ||
        t.invoiceNo.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.date - a.date; // Newest first
      } else if (sortBy === 'amount') {
        return b.amount - a.amount; // Highest first
      } else if (sortBy === 'name') {
        return a.customerName.localeCompare(b.customerName);
      }
      return 0;
    });

    return filtered;
  }, [allTransactions, filterType, searchQuery, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      acc.totalGold += t.goldWeight;
      acc.totalNet += t.netWeight;
      acc.totalAmount += t.amount;
      acc.totalCommission += t.commission || 0;
      acc.count += 1;
      return acc;
    }, { totalGold: 0, totalNet: 0, totalAmount: 0, totalCommission: 0, count: 0 });
  }, [filteredTransactions]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Physical':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Release':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TakeOver':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📋 All Transactions</h2>
        <p className="text-indigo-100">Complete transaction history - Never reset unless deleted from database</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, mobile, or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="physical">Physical Sales</option>
            <option value="release">Release</option>
            <option value="takeover">TakeOver</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Total Transactions</h4>
          <p className="text-3xl font-bold">{totals.count}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Total Gold Weight</h4>
          <p className="text-3xl font-bold">{totals.totalGold.toFixed(3)} g</p>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Total Amount</h4>
          <p className="text-3xl font-bold">₹{totals.totalAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <h4 className="text-sm font-semibold mb-2 opacity-90">Total Commission</h4>
          <p className="text-3xl font-bold">₹{totals.totalCommission.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Invoice No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mobile</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Gold (g)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Net (g)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Amount (₹)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Purity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      {transaction.date.toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      {transaction.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      {transaction.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      {transaction.customerMobile}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 border-b border-gray-200">
                      {transaction.goldWeight.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 border-b border-gray-200">
                      {transaction.netWeight.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-700 border-b border-gray-200">
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 border-b border-gray-200">
                      {transaction.rate > 0 ? Math.round(transaction.rate) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                      {transaction.purity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a permanent record of all transactions. Data is never automatically reset and can only be removed by deleting records from the database.
        </p>
      </div>
    </div>
  );
};

export default Transactions;

