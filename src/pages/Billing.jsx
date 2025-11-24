import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { numberToWords } from '../utils/numberUtils';
import { billingAPI } from '../services/api';

const PURITIES = [
  { label: '24K — 100%', multiplier: 1.0 },
  { label: '22K — 91.6%', multiplier: 0.916 },
  { label: '20K — 83.3%', multiplier: 0.833 },
  { label: '18K — 75%', multiplier: 0.75 },
];

const DEDUCTION_PER_GRAM = 400;

const Billing = () => {
  const { goldPrices } = useAdmin();
  const [showForm, setShowForm] = useState(true);
  const [company, setCompany] = useState(null);

  const [customer, setCustomer] = useState({
    name: '',
    mobile: '',
    aadhar: '',
    pan: '',
    gender: '',
    address: '',
  });

  // ✅ FIXED
  const [weight, setWeight] = useState('');
  const [stoneWeight, setStoneWeight] = useState('');
  const [purityIndex, setPurityIndex] = useState(0);
  const [ornamentType, setOrnamentType] = useState('Gold Ornament');
  const [ornamentCode, setOrnamentCode] = useState(() =>
    Math.floor(100 + Math.random() * 900).toString()
  );

  // New State for Billing Requirements
  const [billingType, setBillingType] = useState('Physical');
  const [bankName, setBankName] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(2);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [renewalAmount, setRenewalAmount] = useState(100000); // Default 1 Lakh

  // Removed useEffect for auto-calculation
  // useEffect(() => { ... }, [commissionPercentage]);

  const [result, setResult] = useState(null);

  // load company data
  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch('/data/data.json');
        const json = await res.json();
        setCompany(json);
      } catch (e) {
        console.warn('Company load error', e);
      }
    }
    loadCompany();
  }, []);

  async function getNextInvoice() {
    try {
      const res = await billingAPI.getNextInvoice();
      if (res.success) {
        return res.invoiceNo;
      }
    } catch (error) {
      console.error("Failed to get next invoice", error);
    }
    return 'INV0001'; // Fallback
  }

  async function calculate() {
    const grossW = parseFloat(weight || 0);
    const stoneW = parseFloat(stoneWeight || 0);
    const netW = grossW - stoneW;

    if (grossW <= 0 || netW <= 0) {
      setResult(null);
      return;
    }

    let calculatedCommission = 0;
    if (billingType === 'Renewal') {
      try {
        const res = await billingAPI.calculateRenewal(commissionPercentage, renewalAmount);
        if (res.success) {
          calculatedCommission = res.commissionAmount;
          setCommissionAmount(calculatedCommission);
        }
      } catch (error) {
        console.error("Failed to calculate commission", error);
        alert("Failed to calculate commission from backend");
        return;
      }
    }

    const purity = PURITIES[purityIndex];
    const purityKey = purity.label.split(' ')[0];

    const selectedRate = goldPrices?.[purityKey] || 5000; // fallback if admin not set

    const gross = netW * selectedRate;
    const deduction = netW * DEDUCTION_PER_GRAM;
    const finalPayout = Math.max(0, gross - deduction);

    const currentInvoiceNo = result?.invoiceNo || await getNextInvoice();

    setResult({
      purityLabel: purity.label,
      selectedRatePerGram: selectedRate,
      grams: grossW,
      stone: stoneW,
      net: netW,
      finalPayout,
      date: new Date(),
      invoiceNo: currentInvoiceNo,
      ornamentType,
      ornamentCode,
      // Add commission to result for display/invoice
      commissionAmount: calculatedCommission,
    });
  }

  // Removed generateInvoiceNo using localStorage
  // function generateInvoiceNo() { ... }

  async function printInvoice() {
    if (!result) return alert('Please calculate the amount first!');

    try {
      // Save billing to database
      const billingData = {
        customer,
        goldDetails: {
          weight: parseFloat(weight),
          stoneWeight: parseFloat(stoneWeight),
          purityIndex,
          purityLabel: result.purityLabel,
          ornamentType,
          ornamentCode,
        },
        calculation: {
          selectedRatePerGram: result.selectedRatePerGram,
          grams: result.grams,
          stone: result.stone,
          net: result.net,
          finalPayout: result.finalPayout,
        },
        invoiceNo: result.invoiceNo,
        // New Fields
        billingType,
        bankName: billingType !== 'Physical' ? bankName : undefined,
        commissionPercentage: billingType === 'Renewal' ? commissionPercentage : undefined,
        commissionAmount: billingType === 'Renewal' ? commissionAmount : undefined,
      };

      await billingAPI.createBilling(billingData);
      alert('Billing saved successfully!');
    } catch (error) {
      alert('Failed to save billing: ' + error.message);
      return;
    }

    const comp = company;
    const c = customer;
    const r = result;

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
  }

  return (
    <div className="w-full px-6 py-10">
      {/* Header stays unchanged */}
      {company && (
        <div className="text-center mb-10">
          <img
            src={`/images/${company.logoFile}`}
            className="mx-auto w-24 mb-2"
          />
          <h1 className="text-2xl font-bold">{company.companyName}</h1>
          <p>{company.addressLine1}</p>
          <p>{company.addressLine2}</p>
          <p>Phone: {company.phone}</p>
        </div>
      )}

      {result && (
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Invoice Number: {result.invoiceNo}
          </h2>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mt-10 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4">
            <h3 className="text-xl font-bold text-white text-center">
              Gold Billing Form
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Gold Calculation Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Gold Details
              </h4>

              {/* Billing Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Type
                </label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="Physical">Physical</option>
                  <option value="Renewal">Renewal</option>
                  <option value="TakeOver">Take Over</option>
                </select>
              </div>

              {/* Conditional Fields for Renewal */}
              {billingType === 'Renewal' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Enter Bank Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renewal Amount
                    </label>
                    <input
                      type="number"
                      value={renewalAmount}
                      onChange={(e) => setRenewalAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Enter Amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission %
                    </label>
                    <select
                      value={commissionPercentage}
                      onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      <option value={2}>2%</option>
                      <option value={3}>3%</option>
                      <option value={4}>4%</option>
                      <option value={5}>5%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Amount
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 font-bold">
                      {/* Show 0 or placeholder until calculated */}
                      ₹ {commissionAmount ? commissionAmount.toLocaleString('en-IN') : '0'}
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields for Take Over */}
              {billingType === 'TakeOver' && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Enter Bank Name"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ornament Type
                  </label>
                  <input
                    type="text"
                    value={ornamentType}
                    onChange={(e) => setOrnamentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="e.g. Chain, Ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ornament Code
                  </label>
                  <input
                    type="text"
                    value={ornamentCode}
                    onChange={(e) => setOrnamentCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="e.g. 1001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Weight (g)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="0.00"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stone Weight (g)
                  </label>
                  <input
                    type="number"
                    value={stoneWeight}
                    onChange={(e) => setStoneWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="0.00"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purity
                  </label>
                  <select
                    value={purityIndex}
                    onChange={(e) => setPurityIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    {PURITIES.map((p, i) => (
                      <option value={i} key={i}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={calculate}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Calculate Final Amount
                </button>
              </div>

              {result && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Final Payout Amount
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ₹
                    {Number(result.finalPayout).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    }) || '0.00'}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.mobile}
                    onChange={(e) =>
                      setCustomer({ ...customer, mobile: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit Aadhar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.aadhar}
                    onChange={(e) =>
                      setCustomer({ ...customer, aadhar: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter PAN number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.pan}
                    onChange={(e) =>
                      setCustomer({ ...customer, pan: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={customer.gender}
                    onChange={(e) =>
                      setCustomer({ ...customer, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    placeholder="Enter complete address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows="3"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={printInvoice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
