import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { billingAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { numberToWords } from '../utils/numberUtils';

const UserVault = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);

  // Load company data
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

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getUserBillings();
      if (response.success) {
        setBillings(response.data);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      alert('Failed to load billings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBillings();
    }
  }, [user]);

  const printInvoice = (billing) => {
    if (!company) return alert('Company data not loaded');

    const comp = company;
    const c = billing.customer;
    const r = {
      ...billing.calculation,
      invoiceNo: billing.invoiceNo,
      date: billing.date,
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

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Vault - Billing History</h1>
            <button
              onClick={() => navigate('/user-dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your billings...</p>
            </div>
          ) : billings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No billings found.</p>
              <button
                onClick={() => navigate('/billing')}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
              >
                Create First Billing
              </button>
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
                  {billings.map((billing) => (
                    <tr key={billing._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-bold">
                        {billing.invoiceNo}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(billing.date).toLocaleDateString()}
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
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <button
                          onClick={() => printInvoice(billing)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          🖨️ Print
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
    </div>
  );
};

export default UserVault;