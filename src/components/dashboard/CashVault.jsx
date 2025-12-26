import React, { useState, useMemo } from 'react';
import { cashAPI } from '../../services/api';
import { FaPrint } from 'react-icons/fa';

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
  billings,
  company
}) => {
  // Helper function to get today's start time (4 AM)
  const getTodayStart = () => {
    const now = new Date();
    const today = new Date(now);
    
    // If current time is before 4 AM, "today" started yesterday at 4 AM
    if (now.getHours() < 4) {
      today.setDate(today.getDate() - 1);
    }
    today.setHours(4, 0, 0, 0);
    return today;
  };

  // Helper function to get today's end time (next day 4 AM)
  const getTodayEnd = () => {
    const todayStart = getTodayStart();
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    return todayEnd;
  };

  // Filter to show only today's transactions (from 4 AM to next 4 AM)
  const todayTransactions = useMemo(() => {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();

    return cashEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= todayStart && entryDate < todayEnd;
    });
  }, [cashEntries]);

  // Helper function to categorize purity
  const getPurityCategory = (purityLabel) => {
    if (!purityLabel) return 'Low Purity';
    const purity = parseFloat(purityLabel.replace(/[^0-9.]/g, ''));
    if (purity >= 91.5) return '916 Hallmark';
    if (purity >= 90) return '916 Non Hallmark';
    return 'Low Purity';
  };

  // Deduction per gram (matching billing system)
  const DEDUCTION_PER_GRAM = 400;

  // Print daily transactions - Gold Send Report format (EXACT MATCH)
  const printDailyTransactions = (data) => {
    try {
      if (!company) {
        alert('Company data not loaded');
        return;
      }

      const { date, transactions, summary } = data;
      const comp = company;
      
      // Report date formatting
      const reportDateObj = new Date(date);
      const reportDate = `${String(reportDateObj.getDate()).padStart(2, '0')}-${String(reportDateObj.getMonth() + 1).padStart(2, '0')}-${reportDateObj.getFullYear()}`;
      const userId = user?._id ? String(user._id).slice(-6) : (user?.id ? String(user.id).slice(-6) : 'N/A');
      const logoUrl = window.location.origin + `/images/${comp.logoFile}`;

      // Combine all transactions (Physical, Release, TakeOver)
      const allTransactions = [];
      let transactionNumber = 1;

      // Process Physical Sales (Billings)
      if (transactions?.billings) {
        transactions.billings.forEach(billing => {
          const items = billing.goldDetails?.items || billing.calculation?.items || [];
          if (items.length > 0) {
            // Process each item individually (not grouped)
            const itemEntries = [];
            let totalGrossWeight = 0;
            let totalNetWeight = 0;
            let totalGrossAmount = 0;
            
            items.forEach(item => {
              const gross = item.weight || 0;
              const stone = item.stoneWeight || item.stone || 0;
              const net = gross - stone;
              const selectedRate = item.selectedRatePerGram || billing.calculation?.selectedRatePerGram || 0;
              // Effective rate after 400 deduction: Rate shown = selectedRate - 400
              const effectiveRate = selectedRate - DEDUCTION_PER_GRAM;
              // Gross Amount = Net Weight * selectedRate (before deduction)
              const grossAmount = net * selectedRate;
              
              totalGrossWeight += gross;
              totalNetWeight += net;
              totalGrossAmount += grossAmount;
              
              // Each item as separate sub-entry
              const category = getPurityCategory(item.purityLabel);
              itemEntries.push({
                category: category,
                grossWeight: gross,
                netWeight: net,
                grossAmount: grossAmount,
                purity: item.purityLabel || 'N/A',
                effectiveRate: effectiveRate
              });
            });

            const netAmount = billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0;
            // Calculate weighted average purity
            let totalPurityWeight = 0;
            let totalPurityValue = 0;
            itemEntries.forEach(item => {
              const purityStr = item.purity || '';
              const purityMatch = purityStr.match(/(\d+\.?\d*)\s*%/);
              const purityNum = purityMatch ? parseFloat(purityMatch[1]) : parseFloat(purityStr.replace(/[^0-9.]/g, '')) || 0;
              totalPurityWeight += item.netWeight;
              totalPurityValue += purityNum * item.netWeight;
            });
            const avgPurity = totalPurityWeight > 0 ? (totalPurityValue / totalPurityWeight) : 0;
            // Calculate weighted average effective rate (after 400 deduction)
            // Effective rate = (Gross Amount - Total Deduction) / Net Weight
            // Or: Average of (selectedRate - 400) weighted by net weight
            let totalEffectiveRateWeight = 0;
            let totalEffectiveRateValue = 0;
            itemEntries.forEach(item => {
              totalEffectiveRateWeight += item.netWeight;
              totalEffectiveRateValue += item.effectiveRate * item.netWeight;
            });
            const avgEffectiveRate = totalEffectiveRateWeight > 0 ? (totalEffectiveRateValue / totalEffectiveRateWeight) : (items[0]?.selectedRatePerGram || billing.calculation?.selectedRatePerGram || 0) - DEDUCTION_PER_GRAM;
            const margin = totalGrossAmount > 0 ? ((totalGrossAmount - netAmount) / totalGrossAmount) * 100 : 0;

            allTransactions.push({
              number: transactionNumber++,
              billId: billing.invoiceNo || 'N/A',
              date: new Date(billing.createdAt || billing.date).toISOString().split('T')[0],
              grossWeight: totalGrossWeight,
              netWeight: totalNetWeight,
              grossAmount: totalGrossAmount,
              netAmount: netAmount,
              purity: avgPurity.toFixed(3),
              rate: Math.round(avgEffectiveRate),
              margin: margin.toFixed(2),
              subEntries: itemEntries,
              type: 'Physical'
            });
          } else {
            // Single item or legacy format
            const gross = billing.goldDetails?.weight || 0;
            const stone = billing.goldDetails?.stoneWeight || billing.calculation?.stone || 0;
            const net = gross - stone;
            const selectedRate = billing.calculation?.selectedRatePerGram || 0;
            // Effective rate after 400 deduction
            const effectiveRate = selectedRate - DEDUCTION_PER_GRAM;
            // Gross Amount = Net Weight * selectedRate (before deduction)
            const grossAmount = net * selectedRate;
            const netAmount = billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0;
            const purityLabel = billing.goldDetails?.purityLabel || 'N/A';
            const purityMatch = purityLabel.match(/(\d+\.?\d*)\s*%/);
            const purity = purityMatch ? parseFloat(purityMatch[1]) : parseFloat(purityLabel.replace(/[^0-9.]/g, '')) || 0;
            const margin = grossAmount > 0 ? ((grossAmount - netAmount) / grossAmount) * 100 : 0;

            allTransactions.push({
              number: transactionNumber++,
              billId: billing.invoiceNo || 'N/A',
              date: new Date(billing.createdAt || billing.date).toISOString().split('T')[0],
              grossWeight: gross,
              netWeight: net,
              grossAmount: grossAmount,
              netAmount: netAmount,
              purity: purity.toFixed(3),
              rate: Math.round(effectiveRate),
              margin: margin.toFixed(2),
              subEntries: [{ category: getPurityCategory(purityLabel), grossWeight: gross, netWeight: net, grossAmount: grossAmount, purity: purityLabel, effectiveRate: effectiveRate }],
              type: 'Physical'
            });
          }
        });
      }

      // Process Release Transactions (Renewals)
      if (transactions?.renewals) {
        transactions.renewals.forEach(renewal => {
          const gross = renewal.goldDetails?.weight || 0;
          const stone = renewal.goldDetails?.stoneWeight || 0;
          const net = gross - stone;
          const selectedRate = renewal.calculation?.selectedRatePerGram || 0;
          // Effective rate after 400 deduction
          const effectiveRate = selectedRate - DEDUCTION_PER_GRAM;
          // Gross Amount = Net Weight * selectedRate (before deduction)
          const grossAmount = net * selectedRate;
          const netAmount = renewal.renewalDetails?.renewalAmount || 0;
          const purityLabel = renewal.goldDetails?.purityLabel || 'N/A';
          const purityMatch = purityLabel.match(/(\d+\.?\d*)\s*%/);
          const purity = purityMatch ? parseFloat(purityMatch[1]) : parseFloat(purityLabel.replace(/[^0-9.]/g, '')) || 0;
          const margin = renewal.renewalDetails?.commissionAmount || 0;
          const marginPercent = grossAmount > 0 ? (margin / grossAmount) * 100 : 0;

          allTransactions.push({
            number: transactionNumber++,
            billId: renewal.renewalNo || renewal.invoiceNo || 'N/A',
            date: new Date(renewal.createdAt || renewal.date).toISOString().split('T')[0],
            grossWeight: gross,
            netWeight: net,
            grossAmount: grossAmount,
            netAmount: netAmount,
            purity: purity.toFixed(3),
            rate: Math.round(effectiveRate),
            margin: marginPercent.toFixed(2),
            subEntries: [{ category: getPurityCategory(purityLabel), grossWeight: gross, netWeight: net, grossAmount: grossAmount, purity: purityLabel, effectiveRate: effectiveRate }],
            type: 'Release'
          });
        });
      }

      // Process Takeover Transactions
      if (transactions?.takeovers) {
        transactions.takeovers.forEach(takeover => {
          const gross = takeover.goldDetails?.weight || 0;
          const stone = takeover.goldDetails?.stoneWeight || 0;
          const net = gross - stone;
          const selectedRate = takeover.calculation?.selectedRatePerGram || 0;
          // Effective rate after 400 deduction
          const effectiveRate = selectedRate - DEDUCTION_PER_GRAM;
          // Gross Amount = Net Weight * selectedRate (before deduction)
          const grossAmount = net * selectedRate;
          const netAmount = takeover.takeoverDetails?.takeoverAmount || 0;
          const purityLabel = takeover.goldDetails?.purityLabel || 'N/A';
          const purityMatch = purityLabel.match(/(\d+\.?\d*)\s*%/);
          const purity = purityMatch ? parseFloat(purityMatch[1]) : parseFloat(purityLabel.replace(/[^0-9.]/g, '')) || 0;
          const margin = grossAmount > 0 ? ((grossAmount - netAmount) / grossAmount) * 100 : 0;

          allTransactions.push({
            number: transactionNumber++,
            billId: takeover.takeoverNo || takeover.invoiceNo || 'N/A',
            date: new Date(takeover.createdAt || takeover.date).toISOString().split('T')[0],
            grossWeight: gross,
            netWeight: net,
            grossAmount: grossAmount,
            netAmount: netAmount,
            purity: purity.toFixed(3),
            rate: Math.round(effectiveRate),
            margin: margin.toFixed(2),
            subEntries: [{ category: getPurityCategory(purityLabel), grossWeight: gross, netWeight: net, grossAmount: grossAmount, purity: purityLabel, effectiveRate: effectiveRate }],
            type: 'TakeOver'
          });
        });
      }

      // Calculate summary totals
      const totalPackets = allTransactions.length;
      const totalGrossWeight = allTransactions.reduce((sum, t) => sum + t.grossWeight, 0);
      const totalNetWeight = allTransactions.reduce((sum, t) => sum + t.netWeight, 0);
      const totalGrossAmount = allTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
      const totalNetAmount = allTransactions.reduce((sum, t) => sum + t.netAmount, 0);
      
      let totalPurityWeight = 0;
      let totalPurityValue = 0;
      allTransactions.forEach(t => {
        const purityNum = parseFloat(t.purity) || 0;
        totalPurityWeight += t.netWeight;
        totalPurityValue += purityNum * t.netWeight;
      });
      const avgPurity = totalPurityWeight > 0 ? (totalPurityValue / totalPurityWeight) : 0;
      const avgMargin = totalGrossAmount > 0 ? ((totalGrossAmount - totalNetAmount) / totalGrossAmount) * 100 : 0;
      const physicalCount = allTransactions.filter(t => t.type === 'Physical').length;
      const releaseCount = allTransactions.filter(t => t.type === 'Release').length;

      // Generate table rows HTML - EXACT MATCH to image format
      let tableRowsHTML = '';
      allTransactions.forEach(trans => {
        const purityNum = parseFloat(trans.purity) || 0;
        
        // Main row
        tableRowsHTML += `
          <tr>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.number}</td>
            <td style="text-align:left; padding:4px; border:1px solid #000; font-size:11px;">${trans.billId}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.date}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.grossWeight.toFixed(2)}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.netWeight.toFixed(2)}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${Math.round(trans.grossAmount)}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${Math.round(trans.netAmount)}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${purityNum.toFixed(3)}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.rate}</td>
            <td style="text-align:right; padding:4px; border:1px solid #000; font-size:11px;">${trans.margin}%</td>
          </tr>
        `;

        // Sub-entries - each item separately (not grouped)
        trans.subEntries.forEach((item) => {
          const purityMatch = item.purity.match(/(\d+\.?\d*)\s*%/);
          const subPurity = purityMatch ? parseFloat(purityMatch[1]) : parseFloat(item.purity.replace(/[^0-9.]/g, '')) || 0;
          
          tableRowsHTML += `
            <tr style="font-size:10px;">
              <td style="text-align:left; padding:3px; border:1px solid #000; padding-left:10px;">${item.category}</td>
              <td style="padding:3px; border:1px solid #000;"></td>
              <td style="padding:3px; border:1px solid #000;"></td>
              <td style="text-align:right; padding:3px; border:1px solid #000;">${item.grossWeight.toFixed(3)}</td>
              <td style="text-align:right; padding:3px; border:1px solid #000;">${item.netWeight.toFixed(3)}</td>
              <td style="text-align:right; padding:3px; border:1px solid #000;">${Math.round(item.grossAmount)}</td>
              <td style="padding:3px; border:1px solid #000;"></td>
              <td style="text-align:right; padding:3px; border:1px solid #000;">${subPurity.toFixed(2)}</td>
              <td style="padding:3px; border:1px solid #000;"></td>
              <td style="padding:3px; border:1px solid #000;"></td>
            </tr>
          `;
        });
      });

      // Generate HTML
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Gold Send Report - ${reportDate}</title>
          <style>
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 10mm; }
              @page { margin: 10mm; }
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 20px;
              font-size: 11px;
              line-height: 1.4;
            }
            .no-print {
              text-align: center;
              margin: 10px 0 20px 0;
            }
            .no-print button {
              padding: 10px 20px;
              background: #d4a017;
              border: none;
              color: white;
              font-size: 16px;
              cursor: pointer;
              border-radius: 4px;
            }
            .no-print button:hover {
              background: #b89015;
            }
            .report-container {
              max-width: 210mm;
              margin: 0 auto;
            }
            .header-section {
              margin-bottom: 15px;
            }
            .header-top {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .logo-container {
              width: 80px;
              height: 60px;
              flex-shrink: 0;
            }
            .logo-container img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .header-right {
              text-align: right;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            }
            .company-name {
              font-size: 11px;
              font-weight: normal;
              text-transform: lowercase;
              margin: 0;
              margin-bottom: 5px;
            }
            .report-date {
              font-size: 10px;
              margin: 0;
              margin-bottom: 8px;
            }
            .report-title {
              text-align: right;
              font-size: 13px;
              font-weight: bold;
              margin: 0;
              letter-spacing: 1px;
            }
            .report-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 10px;
              padding: 0 5px;
            }
            .report-details span {
              margin-right: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 10px;
            }
            table th {
              background-color: #f0f0f0;
              font-weight: bold;
              padding: 6px 4px;
              border: 1px solid #000;
              text-align: left;
              font-size: 9px;
            }
            table th:nth-child(1),
            table th:nth-child(3),
            table th:nth-child(n+4) {
              text-align: right;
            }
            table td {
              padding: 5px 4px;
              border: 1px solid #000;
              font-size: 10px;
            }
            .signature-section {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #000;
              margin-top: 50px;
              margin-left: auto;
            }
            .signature-label {
              text-align: right;
              margin-top: 5px;
              font-size: 10px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()">🖨️ Print Report</button>
          </div>
          <div class="report-container">
            <div class="header-section">
              <div class="header-top">
                <div class="logo-container">
                  <img src="${logoUrl}" alt="${comp.companyName}" />
                </div>
                <div class="header-right">
                  <div class="report-title">GOLD SEND REPORT</div>
                  <div class="company-name">${comp.companyName.toLowerCase()}</div>
                  <div class="report-date">Date: ${reportDate}</div>
                </div>
              </div>
              <div class="report-details">
                <span>Branch: ${comp.branch || comp.addressLine1 || 'N/A'}</span>
                <span>BM: ${user?.name || 'N/A'} / ${userId}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Gross Weight</th>
                  <th>Net Weight</th>
                  <th>Gross Amount</th>
                  <th>Net Amount</th>
                  <th>Purity</th>
                  <th>Rate</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHTML}
              </tbody>
            </table>
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-label">Managing Director</div>
            </div>
          </div>
        </body>
        </html>
      `;

      const win = window.open('', '_blank', 'width=1200,height=800');
      win.document.title = `Gold Send Report - ${reportDate}`;
      win.document.write(html);
      win.document.close();
    } catch (error) {
      console.error('Error printing daily transactions:', error);
      alert('Failed to print daily transactions. Please try again.');
    }
  };

  // Calculate today's totals (using 4 AM reset logic)
  const todayTotals = useMemo(() => {
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();
    
    const initialCash = todayTransactions
      .filter((e) => e.type === 'initial')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalDeductions = todayTransactions
      .filter((e) => e.type === 'billing')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const remainingCash = initialCash - totalDeductions;
    
    // Calculate margin from billings (commission + hidden deductions)
    // Filter billings using 4 AM reset logic
    const todayBillings = billings?.filter(b => {
      const billingDate = new Date(b.createdAt || b.date);
      return billingDate >= todayStart && billingDate < todayEnd;
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
          <strong>Note:</strong> Showing only today's transactions (resets at 4 AM). Historical data is available in Analytics, Expense Tracker, and Transactions.
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
              onClick={() => printDailyTransactions(dailyTransactions)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition duration-300 text-sm"
            >
              <FaPrint />
              Print Report
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
