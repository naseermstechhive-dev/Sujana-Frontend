import React, { useState, useMemo } from 'react';
import { cashAPI } from '../../services/api';
import { FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';

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

  // Helper function to draw table with borders
  const drawTable = (doc, startX, startY, headers, rows, colWidths) => {
    const rowHeight = 7;
    let currentY = startY;
    const tableWidth = colWidths.reduce((sum, w) => sum + w, 0);
    
    // Draw header
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentY, tableWidth, rowHeight, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(startX, currentY, tableWidth, rowHeight);
    
    let xPos = startX;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, currentY + 5, { align: 'left' });
      if (index < headers.length - 1) {
        doc.line(xPos + colWidths[index], currentY, xPos + colWidths[index], currentY + rowHeight);
      }
      xPos += colWidths[index];
    });
    currentY += rowHeight;
    
    // Draw rows
    doc.setFont('helvetica', 'normal');
    rows.forEach((row) => {
      doc.rect(startX, currentY, tableWidth, rowHeight);
      xPos = startX;
      row.forEach((cell, index) => {
        doc.text(cell, xPos + 2, currentY + 5, { align: 'left', maxWidth: colWidths[index] - 4 });
        if (index < row.length - 1) {
          doc.line(xPos + colWidths[index], currentY, xPos + colWidths[index], currentY + rowHeight);
        }
        xPos += colWidths[index];
      });
      currentY += rowHeight;
    });
    
    return currentY;
  };

  // Download daily transactions as PDF
  const downloadDailyTransactions = (data) => {
    try {
      const { date, transactions, summary } = data;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      let yPos = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to add a new page if needed
      const checkPageBreak = (requiredHeight) => {
        if (yPos + requiredHeight > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage();
          yPos = 15;
          return true;
        }
        return false;
      };
      
      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DAILY TRANSACTIONS REPORT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const reportDate = new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Date: ${reportDate}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Summary Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY', margin, yPos);
      yPos += 8;
      
      const summaryHeaders = ['Description', 'Amount'];
      const overallCash = (summary?.totalBillings || 0) + (summary?.totalRenewals || 0) + (summary?.totalTakeovers || 0);
      const summaryRows = [
        ['Physical Sales', `Rs. ${(summary?.totalBillings || 0).toLocaleString('en-IN')}`],
        ['Releases', `Rs. ${(summary?.totalRenewals || 0).toLocaleString('en-IN')}`],
        ['Takeovers', `Rs. ${(summary?.totalTakeovers || 0).toLocaleString('en-IN')}`],
        ['Overall Cash', `Rs. ${overallCash.toLocaleString('en-IN')}`],
      ];
      const summaryColWidths = [contentWidth * 0.6, contentWidth * 0.4];
      
      yPos = drawTable(doc, margin, yPos, summaryHeaders, summaryRows, summaryColWidths);
      yPos += 8;
      checkPageBreak(30);
      
      // Physical Sales Transactions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PHYSICAL SALES TRANSACTIONS', margin, yPos);
      yPos += 8;
      
      if (transactions?.billings && transactions.billings.length > 0) {
        const billingHeaders = ['Invoice No', 'Customer Name', 'Mobile', 'Amount', 'Date'];
        const billingRows = transactions.billings.map(billing => {
          const transDate = new Date(billing.createdAt || billing.date).toLocaleDateString('en-IN');
          return [
            billing.invoiceNo || 'N/A',
            (billing.customer?.name || 'N/A').substring(0, 20),
            (billing.customer?.mobile || 'N/A'),
            `Rs. ${(billing.calculation?.finalPayout || billing.calculation?.editedAmount || 0).toLocaleString('en-IN')}`,
            transDate
          ];
        });
        const billingColWidths = [35, 50, 30, 35, 30];
        
        yPos = drawTable(doc, margin, yPos, billingHeaders, billingRows, billingColWidths);
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No physical sales transactions for this date.', margin, yPos);
        yPos += 6;
      }
      
      yPos += 8;
      checkPageBreak(30);
      
      // Release Transactions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RELEASE TRANSACTIONS', margin, yPos);
      yPos += 8;
      
      if (transactions?.renewals && transactions.renewals.length > 0) {
        const renewalHeaders = ['Renewal No', 'Customer Name', 'Bank Name', 'Loan Amount', 'Commission', 'Date'];
        const renewalRows = transactions.renewals.map(renewal => {
          const transDate = new Date(renewal.createdAt || renewal.date).toLocaleDateString('en-IN');
          return [
            renewal.renewalNo || 'N/A',
            (renewal.customer?.name || 'N/A').substring(0, 18),
            (renewal.bankDetails?.bankName || 'N/A').substring(0, 18),
            `Rs. ${(renewal.renewalDetails?.renewalAmount || 0).toLocaleString('en-IN')}`,
            `Rs. ${(renewal.renewalDetails?.commissionAmount || 0).toLocaleString('en-IN')}`,
            transDate
          ];
        });
        const renewalColWidths = [30, 35, 35, 30, 30, 25];
        
        yPos = drawTable(doc, margin, yPos, renewalHeaders, renewalRows, renewalColWidths);
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No release transactions for this date.', margin, yPos);
        yPos += 6;
      }
      
      yPos += 8;
      checkPageBreak(30);
      
      // Takeover Transactions
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TAKEOVER TRANSACTIONS', margin, yPos);
      yPos += 8;
      
      if (transactions?.takeovers && transactions.takeovers.length > 0) {
        const takeoverHeaders = ['Takeover No', 'Customer Name', 'Bank Name', 'Amount', 'Date'];
        const takeoverRows = transactions.takeovers.map(takeover => {
          const transDate = new Date(takeover.createdAt || takeover.date).toLocaleDateString('en-IN');
          return [
            takeover.takeoverNo || 'N/A',
            (takeover.customer?.name || 'N/A').substring(0, 25),
            (takeover.bankDetails?.bankName || 'N/A').substring(0, 25),
            `Rs. ${(takeover.takeoverDetails?.takeoverAmount || 0).toLocaleString('en-IN')}`,
            transDate
          ];
        });
        const takeoverColWidths = [35, 50, 50, 35, 30];
        
        yPos = drawTable(doc, margin, yPos, takeoverHeaders, takeoverRows, takeoverColWidths);
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No takeover transactions for this date.', margin, yPos);
        yPos += 6;
      }
      
      yPos += 8;
      checkPageBreak(30);
      
      // Cash Entries
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CASH ENTRIES', margin, yPos);
      yPos += 8;
      
      if (transactions?.cashEntries && transactions.cashEntries.length > 0) {
        const cashHeaders = ['Type', 'Amount', 'Date', 'Added By'];
        const cashRows = transactions.cashEntries.map(entry => {
          const transDate = new Date(entry.createdAt).toLocaleDateString('en-IN');
          const type = (entry.type || 'N/A').charAt(0).toUpperCase() + (entry.type || 'N/A').slice(1);
          return [
            type,
            `Rs. ${entry.amount.toLocaleString('en-IN')}`,
            transDate,
            entry.addedBy?.name || 'N/A'
          ];
        });
        const cashColWidths = [30, 40, 40, 60];
        
        yPos = drawTable(doc, margin, yPos, cashHeaders, cashRows, cashColWidths);
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No cash entries for this date.', margin, yPos);
        yPos += 6;
      }
      
      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        doc.text('Generated by Sujana Gold System', margin, doc.internal.pageSize.getHeight() - 10);
      }
      
      // Save PDF
      doc.save(`daily-transactions-${date}.pdf`);
      alert('Daily transactions PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading daily transactions:', error);
      alert('Failed to download daily transactions. Please try again.');
    }
  };

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
                  if (!window.confirm('Are you sure you want to end the day? This will:\n- Reset initial cash (for next day)\n- Reset daily view (total billing, margin, remaining cash will show 0 for new day)\n- All transaction data is preserved in database for Analytics and Expense Tracker\n- UserVault will continue to show all historical billings\n\nNote: After reset, set new initial cash to start the next day.')) {
                    return;
                  }
                  try {
                    // Reset initial cash only (all billing deductions, margin, remaining cash calculations stay in DB)
                    await cashAPI.resetAllCash();
                    // Reset gold transactions view (does NOT delete data - just marks day as ended)
                    await resetGoldTransactions();
                    // Refresh cash vault (will show empty for new day since no initial cash set yet)
                    await fetchCashVault();
                    // Refresh initial cash status
                    await checkInitialCashStatus();
                    // Refresh margin to show 0 for new day
                    await fetchMargin();
                    alert('Day ended successfully!\n\n✅ Initial cash reset\n✅ Daily view reset (total billing, margin, remaining cash will show 0 for new day)\n✅ All historical data preserved in database for Analytics and Expense Tracker\n✅ UserVault unchanged (shows all historical billings)\n\nSet new initial cash to start the next day.');
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
        <div className="bg-green-50 p-4 rounded-lg overflow-hidden">
          <h3 className="font-semibold text-sm mb-2">Initial Cash (Today)</h3>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-700 break-words overflow-hidden">
            ₹{todayTotals.initialCash.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg overflow-hidden">
          <h3 className="font-semibold text-sm mb-2">Total Deductions (Today)</h3>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-red-700 break-words overflow-hidden">
            ₹{todayTotals.totalDeductions.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-600 mt-1">Physical + Release + TakeOver</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg overflow-hidden">
          <h3 className="font-semibold text-sm mb-2">Remaining Cash</h3>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-700 break-words overflow-hidden">
            ₹{todayTotals.remainingCash.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg overflow-hidden">
          <h3 className="font-semibold text-sm mb-2">Margin (Today)</h3>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-700 break-words overflow-hidden">
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
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Initial Cash</div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600 break-words overflow-hidden">
                ₹{marginData.initialCash.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Total Billings</div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 break-words overflow-hidden">
                ₹{marginData.totalBillings.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Remaining Cash</div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 break-words overflow-hidden">
                ₹{marginData.remainingCash.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Margin</div>
              <div className={`text-lg md:text-xl lg:text-2xl font-bold break-words overflow-hidden ${marginData.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{marginData.margin.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Transactions Display */}
      {dailyTransactions && (
        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Daily Transactions Summary ({dailyTransactions.date})</h3>
            <button
              onClick={() => downloadDailyTransactions(dailyTransactions)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
            >
              <FaDownload />
              Download PDF
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Physical Sales</div>
              <div className="text-base md:text-lg lg:text-xl font-bold text-blue-600 break-words overflow-hidden">
                ₹{dailyTransactions.summary.totalBillings.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Releases</div>
              <div className="text-base md:text-lg lg:text-xl font-bold text-green-600 break-words overflow-hidden">
                ₹{dailyTransactions.summary.totalRenewals.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Takeovers</div>
              <div className="text-base md:text-lg lg:text-xl font-bold text-orange-600 break-words overflow-hidden">
                ₹{dailyTransactions.summary.totalTakeovers.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded border overflow-hidden">
              <div className="text-sm text-gray-600 mb-2">Net Cash Flow</div>
              <div className={`text-base md:text-lg lg:text-xl font-bold break-words overflow-hidden ${dailyTransactions.summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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