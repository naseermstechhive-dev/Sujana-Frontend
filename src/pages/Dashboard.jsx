import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, cashAPI, billingAPI, renewalAPI, takeoverAPI } from '../services/api';
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
  const [activeItem, setActiveItem] = useState('');
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
  const [renewals, setRenewals] = useState([]);
  const [takeovers, setTakeovers] = useState([]);
  const [company, setCompany] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [goldVaultTab, setGoldVaultTab] = useState('physical');
  const [marginData, setMarginData] = useState(null);
  const [dailyTransactions, setDailyTransactions] = useState(null);
  const [hasInitialCash, setHasInitialCash] = useState(false);

  const handleSearch = () => {
    let filtered = billings;

    if (searchName.trim()) {
      filtered = filtered.filter(billing =>
        billing.customer.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDate.trim()) {
      filtered = filtered.filter(billing => {
        const billingDate = new Date(billing.createdAt || billing.date);
        const searchDateObj = new Date(searchDate);

        // Compare year, month, and day
        return billingDate.getFullYear() === searchDateObj.getFullYear() &&
               billingDate.getMonth() === searchDateObj.getMonth() &&
               billingDate.getDate() === searchDateObj.getDate();
      });
    }

    setFilteredBillings(filtered);
  };

  const clearSearch = () => {
    setSearchName('');
    setSearchDate('');
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

  const resetInitialCash = async () => {
    if (!window.confirm('Are you sure you want to reset initial cash? This will allow employees to add new initial cash.')) {
      return;
    }

    try {
      const response = await cashAPI.resetInitialCash();
      if (response.success) {
        alert('Initial cash reset successfully');
        setHasInitialCash(false);
        fetchCashVault();
      }
    } catch (error) {
      alert('Failed to reset initial cash: ' + error.message);
    }
  };

  const resetGoldTransactions = async () => {
    if (!window.confirm('Are you sure you want to reset ALL gold transactions? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await billingAPI.resetGoldTransactions();
      if (response.success) {
        alert('All gold transactions reset successfully');
        fetchBillings();
        fetchRenewals();
        fetchTakeovers();
        fetchCashVault();
      }
    } catch (error) {
      alert('Failed to reset gold transactions: ' + error.message);
    }
  };

  const fetchMargin = async () => {
    try {
      const response = await cashAPI.getMargin();
      if (response.success) {
        setMarginData(response.data);
      }
    } catch (error) {
      console.error('Error fetching margin:', error);
      alert('Failed to fetch margin data');
    }
  };

  const fetchDailyTransactions = async () => {
    try {
      const response = await billingAPI.getDailyTransactions();
      if (response.success) {
        setDailyTransactions(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily transactions:', error);
      alert('Failed to fetch daily transactions');
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
            <h2 className="text-2xl font-bold">Gold Vault</h2>
            <div className="text-gray-600 font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Manage all gold transactions: Physical sales, Bank renewals, and Takeovers.
          </p>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setGoldVaultTab('physical')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                goldVaultTab === 'physical'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Physical Sales
            </button>
            <button
              onClick={() => setGoldVaultTab('renewal')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                goldVaultTab === 'renewal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bank Renewals
            </button>
            <button
              onClick={() => setGoldVaultTab('takeover')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                goldVaultTab === 'takeover'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Takeovers
            </button>
          </div>

          {/* Tab Content */}
          {goldVaultTab === 'physical' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Physical Gold Sales</h3>
              <p className="text-gray-600 mb-4">Customers coming to shop to sell their gold.</p>

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
                        <h4 className="font-semibold text-yellow-800">Today's Gross Weight</h4>
                        <p className="text-2xl font-bold text-yellow-600">
                          {todaysBillings
                            .reduce((acc, curr) => acc + (curr.goldDetails?.weight || 0), 0)
                            .toFixed(3)} g
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
                        <h4 className="font-semibold text-orange-800">Today's Stone Weight</h4>
                        <p className="text-2xl font-bold text-orange-600">
                          {todaysBillings
                            .reduce((acc, curr) => acc + (curr.goldDetails?.stoneWeight || 0), 0)
                            .toFixed(3)} g
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                        <h4 className="font-semibold text-green-800">Today's Net Weight</h4>
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

                    {/* Physical Sales Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h4 className="font-semibold text-lg text-gray-700">Today's Physical Sales</h4>
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
                          No physical gold sales for today.
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {goldVaultTab === 'renewal' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Bank Gold Renewals</h3>
              <p className="text-gray-600 mb-4">Customers with gold in bank who need renewal assistance.</p>

              {/* Renewal Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                  <h4 className="font-semibold text-blue-800">Total Renewals</h4>
                  <p className="text-2xl font-bold text-blue-600">{renewals.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                  <h4 className="font-semibold text-green-800">Total Commission</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{renewals.reduce((acc, r) => acc + (r.renewalDetails?.commissionAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                  <h4 className="font-semibold text-purple-800">Total Gold Weight</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {renewals.reduce((acc, r) => acc + (r.goldDetails?.weight || 0), 0).toFixed(3)} g
                  </p>
                </div>
              </div>

              {/* Renewals Table */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-lg text-gray-700">Renewal Transactions</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Renewal No</th>
                        <th className="py-3 px-6 text-left">Customer</th>
                        <th className="py-3 px-6 text-left">Bank</th>
                        <th className="py-3 px-6 text-left">Loan Amount</th>
                        <th className="py-3 px-6 text-left">Commission</th>
                        <th className="py-3 px-6 text-right">Gold Weight (g)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {renewals.map((renewal) => (
                        <tr key={renewal._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                          <td className="py-3 px-6 text-left whitespace-nowrap">
                            {new Date(renewal.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 text-left font-medium text-blue-600">
                            {renewal.renewalNo}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {renewal.customer?.name}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {renewal.bankDetails?.bankName}
                          </td>
                          <td className="py-3 px-6 text-left font-bold">
                            ₹{renewal.bankDetails?.loanAmount?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-6 text-left text-green-600 font-bold">
                            ₹{renewal.renewalDetails?.commissionAmount?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-6 text-right font-bold">
                            {renewal.goldDetails?.weight?.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renewals.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No renewal transactions found.
                  </div>
                )}
              </div>
            </div>
          )}

          {goldVaultTab === 'takeover' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Gold Takeovers</h3>
              <p className="text-gray-600 mb-4">Take over gold from banks/other parties at today's rates.</p>

              {/* Takeover Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                  <h4 className="font-semibold text-red-800">Total Takeovers</h4>
                  <p className="text-2xl font-bold text-red-600">{takeovers.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
                  <h4 className="font-semibold text-orange-800">Total Takeover Amount</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{takeovers.reduce((acc, t) => acc + (t.takeoverDetails?.takeoverAmount || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 shadow-sm">
                  <h4 className="font-semibold text-indigo-800">Total Gold Weight</h4>
                  <p className="text-2xl font-bold text-indigo-600">
                    {takeovers.reduce((acc, t) => acc + (t.goldDetails?.weight || 0), 0).toFixed(3)} g
                  </p>
                </div>
              </div>

              {/* Takeovers Table */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-lg text-gray-700">Takeover Transactions</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Takeover No</th>
                        <th className="py-3 px-6 text-left">Customer</th>
                        <th className="py-3 px-6 text-left">Pledged To</th>
                        <th className="py-3 px-6 text-left">Takeover Amount</th>
                        <th className="py-3 px-6 text-left">Profit/Loss</th>
                        <th className="py-3 px-6 text-right">Gold Weight (g)</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                      {takeovers.map((takeover) => (
                        <tr key={takeover._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                          <td className="py-3 px-6 text-left whitespace-nowrap">
                            {new Date(takeover.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 text-left font-medium text-blue-600">
                            {takeover.takeoverNo}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {takeover.customer?.name}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {takeover.pledgeDetails?.pledgedTo}
                          </td>
                          <td className="py-3 px-6 text-left font-bold">
                            ₹{takeover.takeoverDetails?.takeoverAmount?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-6 text-left font-bold">
                            <span className={takeover.takeoverDetails?.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₹{takeover.takeoverDetails?.profitLoss?.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-bold">
                            {takeover.goldDetails?.weight?.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {takeovers.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No takeover transactions found.
                  </div>
                )}
              </div>
            </div>
          )}
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
                <div className="flex gap-3">
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
                </div>
              </div>
            )}
          </div>

          {/* Cash Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold">Initial Cash</h3>
              <p className="text-2xl font-bold text-green-700">
                ₹
                {cashEntries
                  .filter((e) => e.type === 'initial')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold">Total Billings</h3>
              <p className="text-2xl font-bold text-red-700">
                ₹
                {cashEntries
                  .filter((e) => e.type === 'billing')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold">Remaining Cash</h3>
              <p className="text-2xl font-bold text-blue-700">
                ₹
                {(() => {
                  const initialCash = cashEntries
                    .filter((e) => e.type === 'initial')
                    .reduce((acc, curr) => acc + curr.amount, 0);
                  const totalBillings = cashEntries
                    .filter((e) => e.type === 'billing')
                    .reduce((acc, curr) => acc + curr.amount, 0);
                  return (initialCash - totalBillings).toLocaleString('en-IN');
                })()}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold">Margin</h3>
              <p className="text-2xl font-bold text-purple-700">
                ₹
                {cashEntries
                  .filter((e) => e.type === 'billing')
                  .reduce((acc, curr) => acc + curr.amount, 0)
                  .toLocaleString('en-IN')}
              </p>
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
                  <div className="text-sm text-gray-600">Renewals</div>
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
                      Description
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
                      <td className="border border-gray-300 px-4 py-2">
                        {entry.type === 'initial' ? 'Initial cash added' :
                         entry.type === 'billing' ? 'Billing deduction' :
                         entry.type === 'remaining' ? 'Remaining cash added' : entry.type}
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
            View all billing records, search by customer name or date, and print invoices.
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
                  Date
                </label>
                <input
                  type="date"
                  placeholder="Search by date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
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
      title: 'Employee Management',
      icon: <FaUsers />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
          <p className="text-gray-600 mb-6">
            Create and manage employee accounts for the billing system.
          </p>

          {/* Create New Employee Form - Admin Only */}
          {user.role === 'admin' && (
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
          )}

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

  const fetchRenewals = async () => {
    try {
      const response = await renewalAPI.getAllRenewals();
      if (response.success) {
        setRenewals(response.data);
      }
    } catch (error) {
      console.error('Error fetching renewals:', error);
    }
  };

  const fetchTakeovers = async () => {
    try {
      const response = await takeoverAPI.getAllTakeovers();
      if (response.success) {
        setTakeovers(response.data);
      }
    } catch (error) {
      console.error('Error fetching takeovers:', error);
    }
  };

  const checkInitialCashStatus = async () => {
    try {
      const response = await cashAPI.checkInitialCashExists();
      if (response.success) {
        setHasInitialCash(response.hasInitialCash);
      }
    } catch (error) {
      console.error('Error checking initial cash:', error);
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
      fetchRenewals();
      fetchTakeovers();
      checkInitialCashStatus();
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
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/Sujana-Gold-Logo.jpeg"
              className="w-20 h-20 object-contain border-2 border-gray-900 shadow-md rounded-lg"
              alt="logo"
            />
          </button>
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
          {activeItem === '' ? (
            <div className="text-center py-20">
              <div className="mb-8">
                <img
                  src="/images/Sujana-Gold-Logo.jpeg"
                  alt="Sujana Gold Logo"
                  className="w-32 h-32 mx-auto mb-6 object-contain shadow-lg rounded-lg"
                />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome to Sujana Gold Dashboard
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Your comprehensive gold trading management system
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg text-white">
                  <FaCoins className="text-3xl mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Gold Vault</h3>
                  <p className="text-sm opacity-90">Manage physical sales, renewals, and takeovers</p>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-lg text-white">
                  <FaMoneyBillWave className="text-3xl mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Cash Management</h3>
                  <p className="text-sm opacity-90">Track cash flow and margins</p>
                </div>

                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-lg text-white">
                  <FaFileInvoice className="text-3xl mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Billing History</h3>
                  <p className="text-sm opacity-90">View and manage all transactions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-lg text-white">
                  <FaUsers className="text-3xl mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Employee Management</h3>
                  <p className="text-sm opacity-90">Manage your team</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setActiveItem('Gold Vault')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                  >
                    View Gold Vault
                  </button>
                  <button
                    onClick={() => setActiveItem('Cash Volt')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                  >
                    Manage Cash
                  </button>
                  <button
                    onClick={() => setActiveItem('User Vault')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                  >
                    View Billings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            menuItems.find((item) => item.title === activeItem)?.content
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
