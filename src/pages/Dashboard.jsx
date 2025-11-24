import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, cashAPI, billingAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import GoldPriceSetter from '../components/GoldPriceSetter';
import { numberToWords } from '../utils/numberUtils';
import {
  FaCoins,
  FaMoneyBillWave,
  FaUsers,
  FaCalculator,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaEdit,
  FaFileInvoice,
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Gold Details');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [cashEntries, setCashEntries] = useState([]);
  const [cashAmount, setCashAmount] = useState('');
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [company, setCompany] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchInvoice, setSearchInvoice] = useState('');

  const handleSearch = () => {
    let filtered = billings;

    if (searchName.trim()) {
      filtered = filtered.filter(billing =>
        billing.customer.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchInvoice.trim()) {
      filtered = filtered.filter(billing =>
        billing.invoiceNo.toLowerCase().includes(searchInvoice.toLowerCase())
      );
    }

    setFilteredBillings(filtered);
  };

  const clearSearch = () => {
    setSearchName('');
    setSearchInvoice('');
    setFilteredBillings(billings);
  };

  const deleteBillingRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this billing record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await billingAPI.deleteBilling(id);
      if (response.success) {
        alert('Billing deleted successfully');
        fetchBillings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting billing:', error);
      alert('Failed to delete billing: ' + error.message);
    }
  };

  const printInvoice = (billing) => {
    if (!company) return alert('Company data not loaded');

    const comp = company;
    const c = billing.customer;
    const r = {
      ...billing.calculation,
      invoiceNo: billing.invoiceNo,
      date: billing.createdAt || billing.date,
      purityLabel: billing.goldDetails.purityLabel,
      ornamentType: billing.goldDetails.ornamentType,
      ornamentCode: billing.goldDetails.ornamentCode,
      grams: billing.goldDetails.weight,
      stone: billing.goldDetails.stoneWeight,
      net: billing.calculation.net,
      finalPayout: billing.calculation.finalPayout,
    };

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${r.invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 0; margin: 0; background: white; }
          .invoice-container { width: 800px; margin: auto; border: 1px solid black; padding: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { border: 1px solid black; padding: 6px; text-align: left; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header-table td { border: none; }
          .no-border td { border: none !important; }
          .logo img { width: 120px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align:center; margin:10px;">
          <button onclick="window.print()" style="padding:10px 20px; background:#d4a017; border:none; color:white; font-size:16px; cursor:pointer;">
            Print Invoice
          </button>
        </div>

        <div class="invoice-container">
          <!-- HEADER -->
          <table class="header-table">
            <tr>
              <td class="center" colspan="3">
                <div class="logo">
                  <img src="/images/${comp.logoFile}" alt="${comp.companyName}" />
                </div>
                <div class="bold" style="font-size:28px; margin-top:-10px;">
                  ${comp.companyName}
                </div>
                ${comp.addressLine1} <br>
                ${comp.addressLine2} <br>
                <b>Phone:</b> ${comp.phone}
              </td>
            </tr>
          </table>

          <!-- TOP COMPANY INFO ROW -->
          <table>
            <tr>
              <td><b>BRANCH :</b> Kadapa - Central</td>
              <td><b>CONTACT :</b> ${comp.phone}</td>
              <td><b>INVOICE NO :</b> ${r.invoiceNo}</td>
            </tr>
          </table>

          <table>
            <tr>
              <!-- Left side fields -->
              <td><b>CUSTOMER ID</b><br> SUJANA-${r.invoiceNo.split('-').pop()}</td>
              <td><b>DATE / TIME</b><br> ${new Date(r.date).toLocaleString()}</td>

              <!-- RIGHT SIDE PHOTO + ID PROOF + ADDRESS PROOF -->
              <td rowspan="4" style="width:180px; padding:0; margin:0; border:1px solid black; vertical-align:top;">
                <!-- PHOTO BOX -->
                <div style="width:100%; height:130px; border-bottom:1px solid black;"></div>
                <!-- ID PROOF ROW -->
                <div style="border-bottom:1px solid black; padding:6px; font-size:13px;">
                  <b>ID PROOF</b><br>
                  <div style="margin-top:4px; width:100%; border:1px solid black; height:28px; text-align:center; padding-top:4px;">
                    ${c.aadhar || '____________'}
                  </div>
                </div>
                <!-- ADDRESS PROOF ROW -->
                <div style="padding:6px; font-size:13px;">
                  <b>AADHAR NO</b><br>
                  <div style="margin-top:4px; width:100%; border:1px solid black; height:28px; text-align:center; padding-top:4px;">
                    ${c.aadhar || '____________'}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div style="display:flex; justify-content:space-between;">
                  <div><b>CUSTOMER NAME</b><br> ${c.name}</div>
                  <div style="border-left:1px solid black; padding-left:10px; margin-left:10px;">
                    <b>GENDER</b><br> ${c.gender}
                  </div>
                </div>
              </td>
              <td><b>BILL ID</b><br> ${r.invoiceNo}</td>
            </tr>

            <tr>
              <td><b>CONTACT</b><br> ${c.mobile}</td>
              <td><b>GOLD PRICE</b><br> ₹ ${r.selectedRatePerGram}/g</td>
            </tr>

            <tr>
              <td colspan="2">
                <b>ADDRESS :</b> ${c.address}
              </td>
            </tr>
          </table>

          <!-- ITEMS TABLE -->
          <table>
            <tr class="center bold">
              <th>ORNAMENT TYPE</th>
              <th>CODE</th>
              <th>GROSS WEIGHT</th>
              <th>STONE / WAX</th>
              <th>NET WEIGHT</th>
              <th>PURITY</th>
              <th>GROSS AMOUNT</th>
            </tr>

            <tr class="center">
              <td>${r.ornamentType}</td>
              <td>${r.ornamentCode}</td>
              <td>${r.grams} g</td>
              <td>${r.stone} g</td>
              <td>${r.net} g</td>
              <td>${r.purityLabel}</td>
              <td>₹ ${Number(r.finalPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>

            <tr class="center bold">
              <td colspan="2">GRAND TOTAL</td>
              <td>${r.grams}</td>
              <td>${r.stone}</td>
              <td>${r.net}</td>
              <td>-</td>
              <td>₹ ${Number(r.finalPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>

          <!-- TERMS + AMOUNTS SIDE BY SIDE -->
          <table>
            <tr>
              <!-- LEFT: TERMS -->
              <td style="width:65%; vertical-align:top; padding:10px;">
                <div class="bold center">TERMS & CONDITIONS</div>
                <div style="font-size:13px; line-height:1.4;">
                  1. Ornaments once purchased shall not be returned under any circumstances. <br>
                  2. If any losses are arising out of this purchase, then you are liable to settle full amount. <br>
                  3. Selling stolen gold, silver or fake gold is a criminal offence; if found will be reported. <br>
                  4. You declare full ownership of the ornaments sold & indemnify Sujana Gold Company. <br>
                  5. Check cash before leaving the counter; no claims accepted afterward.
                </div>
                <br>
                <div class="bold center">షరతులు మరియు నిబంధనలు</div>
                <div style="font-size:13px; line-height:1.6;">
                  1. ఒకసారి కొనుగోలు చేసిన ఆభరణాలు తిరిగి స్వీకరించబడవు. <br>
                  2. ఈ కొనుగోలుతో సంబంధిత నష్టాలకు మీరు బాధ్యత వహించాలి. <br>
                  3. నకిలీ లేదా దొంగతనం చేసిన బంగారం అమ్మడం నేరం. <br>
                  4. అమ్మిన ఆభరణాల యాజమాన్యం మీదే అని మీరు ప్రకటిస్తున్నారు. <br>
                  5. కౌంటర్ వదిలే ముందు నగదు సరిచూసుకోండి.
                </div>
              </td>

              <!-- RIGHT: SIGNATURES -->
              <td style="width:35%; padding:0; vertical-align:top;">
                <!-- SIGNATURE SECTION -->
                <table style="width:100%; border-collapse: collapse; margin-top:10px;">
                  <tr>
                    <td style="width:50%; height:90px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding-bottom:10px;">
                      CUSTOMER THUMB
                    </td>
                    <td style="width:50%; height:90px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding-bottom:10px;">
                      CUSTOMER SIGNATURE
                    </td>
                  </tr>
                  <tr>
                    <td style="width:50%; height:90px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding-bottom:10px;">
                      EmployeeThumbImpression
                    </td>
                    <td style="width:50%; height:90px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding-bottom:10px;">
                      Employee Signature
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- AMOUNT IN WORDS -->
            <table>
              <tr>
                <td><b>AMOUNT IN WORDS :</b> ${numberToWords(Math.round(r.finalPayout))}</td>
              </tr>
            </table>
          </table>
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const menuItems = [

    {
      title: 'Gold Vault',
      icon: <FaCoins />,
      content: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Gold Vault (Today)</h2>
            <div className="text-gray-600 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            View gold inventory details for today. Data resets daily.
          </p>

          {/* Filter Billings for Today */}
          {(() => {
            const today = new Date().toDateString();
            const todaysBillings = billings.filter(b => 
              new Date(b.createdAt || b.date).toDateString() === today
            );

            return (
              <>
                {/* Gold Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                    <h3 className="font-semibold text-yellow-800">Today's Gross Weight</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {todaysBillings
                        .reduce((acc, curr) => acc + (curr.goldDetails?.weight || 0), 0)
                        .toFixed(3)} g
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
                    <h3 className="font-semibold text-orange-800">Today's Stone Weight</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {todaysBillings
                        .reduce((acc, curr) => acc + (curr.goldDetails?.stoneWeight || 0), 0)
                        .toFixed(3)} g
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <h3 className="font-semibold text-green-800">Today's Net Weight</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {todaysBillings
                        .reduce((acc, curr) => {
                          const gross = curr.goldDetails?.weight || 0;
                          const stone = curr.goldDetails?.stoneWeight || 0;
                          return acc + (gross - stone);
                        }, 0)
                        .toFixed(3)} g
                    </p>
                  </div>
                </div>

                {/* Gold Transactions Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-700">Today's Transactions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Time</th>
                          <th className="py-3 px-6 text-left">Invoice No</th>
                          <th className="py-3 px-6 text-left">Customer</th>
                          <th className="py-3 px-6 text-left">Ornament</th>
                          <th className="py-3 px-6 text-left">Code</th>
                          <th className="py-3 px-6 text-left">Purity</th>
                          <th className="py-3 px-6 text-right">Gross Wt (g)</th>
                          <th className="py-3 px-6 text-right">Stone Wt (g)</th>
                          <th className="py-3 px-6 text-right">Net Wt (g)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {todaysBillings.map((billing) => {
                          const gross = billing.goldDetails?.weight || 0;
                          const stone = billing.goldDetails?.stoneWeight || 0;
                          const net = gross - stone;
                          return (
                            <tr key={billing._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                              <td className="py-3 px-6 text-left whitespace-nowrap">
                                {new Date(billing.createdAt || billing.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 px-6 text-left font-medium text-blue-600">
                                {billing.invoiceNo}
                              </td>
                              <td className="py-3 px-6 text-left">
                                {billing.customer?.name}
                              </td>
                              <td className="py-3 px-6 text-left">
                                <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                                  {billing.goldDetails?.ornamentType}
                                </span>
                              </td>
                              <td className="py-3 px-6 text-left font-mono">
                                {billing.goldDetails?.ornamentCode}
                              </td>
                              <td className="py-3 px-6 text-left">
                                {billing.goldDetails?.purityLabel}
                              </td>
                              <td className="py-3 px-6 text-right font-bold">
                                {gross.toFixed(3)}
                              </td>
                              <td className="py-3 px-6 text-right text-red-500">
                                {stone.toFixed(3)}
                              </td>
                              <td className="py-3 px-6 text-right font-bold text-green-600">
                                {net.toFixed(3)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {todaysBillings.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No gold transactions for today.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      ),
    },
    {
      title: 'Cash Volt',
      icon: <FaMoneyBillWave />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Cash Transactions</h2>
          <p className="text-gray-600 mb-4">Cash inflow and outflow details.</p>

          {/* Add Cash Form */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-4">Add Cash Entry</h3>
            <form
              className="flex gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await cashAPI.addCash(cashAmount);
                  setCashAmount('');
                  fetchCashVault();
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
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-300"
              >
                Add Cash
              </button>
            </form>
          </div>

          {/* Cash Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold">Total Cash In Vault</h3>
              <p className="text-2xl font-bold text-green-700">
                ₹
                {cashEntries
                  .filter((e) => e.type === 'cash')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold">Total Remaining Cash</h3>
              <p className="text-2xl font-bold text-yellow-700">
                ₹
                {cashEntries
                  .filter((e) => e.type === 'remaining')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Amount
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Added By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cashEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 capitalize">
                        {entry.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {entry.addedBy?.name || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'User Vault',
      icon: <FaFileInvoice />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Billing History</h2>
          <p className="text-gray-600 mb-6">
            View all billing records, search by customer name or invoice number, and print invoices.
          </p>

          {/* Search Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-4">Search Billings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Search by customer name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="Search by invoice number"
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition duration-300"
                >
                  Search
                </button>
                <button
                  onClick={clearSearch}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition duration-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading billings...</p>
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">
                {billings.length === 0 ? 'No billings found.' : 'No billings match your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Invoice No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ornament</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Weight (g)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBillings.map((billing) => (
                    <tr key={billing._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        {billing.invoiceNo}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(billing.createdAt || billing.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {billing.customer.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {billing.goldDetails.ornamentType}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {billing.goldDetails.weight}g
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        ₹{billing.calculation.finalPayout.toLocaleString('en-IN')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => printInvoice(billing)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          title="Print Invoice"
                        >
                          🖨️ Print
                        </button>
                        <button
                          onClick={() => deleteBillingRecord(billing._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          title="Delete Billing"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
   
    {
      title: 'Total Amount',
      icon: <FaCalculator />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Total Amount</h2>
          <p className="text-gray-600 mb-4">Overall financial summary.</p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold">Grand Total</h3>
            <p className="text-2xl">₹2,00,000</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Employee Management',
      icon: <FaUsers />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
          <p className="text-gray-600 mb-6">
            Create and manage employee accounts for the billing system.
          </p>

          {/* Create New Employee Form */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-4">Create New Employee</h3>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await authAPI.createEmployee(
                    newEmployee.name,
                    newEmployee.email,
                    newEmployee.password
                  );
                  setNewEmployee({ name: '', email: '', password: '' });
                  fetchEmployees();
                  alert('Employee created successfully!');
                } catch (error) {
                  alert(error.message);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={newEmployee.name}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, name: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  type="email"
                  placeholder="Employee Email"
                  value={newEmployee.email}
                  onChange={(e) =>
                    setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <input
                type="password"
                placeholder="Employee Password"
                value={newEmployee.password}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-300"
              >
                Create Employee Account
              </button>
            </form>
          </div>

          {/* Existing Employees List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Existing Employees</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No employees found. Create your first employee above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Email
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Created Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {employee.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {employee.email}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <button className="text-blue-500 hover:text-blue-700 mr-2">
                            <FaEdit />
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  'Are you sure you want to delete this employee?'
                                )
                              ) {
                                try {
                                  await authAPI.deleteEmployee(employee._id);
                                  fetchEmployees();
                                } catch (error) {
                                  alert(error.message);
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ),
    },
    { title: 'Sign Out', icon: <FaSignOutAlt />, action: logout },
  ];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashVault = async () => {
    try {
      const response = await cashAPI.getCashVault();
      if (response.success) {
        setCashEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching cash vault:', error);
    }
  };

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getAllBillings();
      if (response.success) {
        setBillings(response.data);
        setFilteredBillings(response.data);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      alert('Failed to load billings');
    } finally {
      setLoading(false);
    }
  };

  const loadCompany = async () => {
    try {
      const res = await fetch('/data/data.json');
      const json = await res.json();
      setCompany(json);
    } catch (e) {
      console.warn('Company load error', e);
    }
  };

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      fetchEmployees();
      fetchCashVault();
      fetchBillings();
      loadCompany();
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          open ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-yellow-400 to-yellow-600 text-white duration-300 p-4 shadow-xl relative`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-6 bg-yellow-100 hover:bg-yellow-600 text-white shadow-lg p-2 rounded-md border border-yellow-100 transition-colors"
        >
          {open ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        {/* Profile */}
        <div className="flex flex-col justify-center items-center mt-2 mb-10">
          <img
            src="/images/logo.png"
            className="rounded-full w-20 h-20 object-cover border-2 border-gray-900 shadow-md"
            alt="profile"
          />
        </div>

        {/* Menu */}
        <ul className="space-y-2">
          {menuItems.map((item, i) => (
            <li
              key={i}
              className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg transition ${
                activeItem === item.title
                  ? 'bg-yellow-300'
                  : 'hover:bg-yellow-700'
              }`}
              onClick={() =>
                item.action ? item.action() : setActiveItem(item.title)
              }
            >
              <span className="text-lg">{item.icon}</span>
              {open && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your gold trading operations from this admin dashboard.
          </p>
        </div>
        <div className="bg-white w-full h-[75vh] rounded-xl shadow-md p-10 overflow-y-auto">
          {menuItems.find((item) => item.title === activeItem)?.content}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
