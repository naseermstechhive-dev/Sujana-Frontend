import React, { useState } from 'react';
import { numberToWords } from '../../utils/numberUtils';
import { billingAPI } from '../../services/api';

const UserVault = ({
  billings,
  filteredBillings,
  setFilteredBillings,
  loading,
  company
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

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

  const uploadImage = (billing) => {
    setSelectedBilling(billing);
    setCustomerPhoto(null);
    setPhotoPreview(null);
    setShowPhotoModal(true);
  };

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomerPhoto(file);
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setCustomerPhoto(null);
    setPhotoPreview(null);
  };

  const savePhoto = () => {
    if (!photoPreview) {
      alert('Please select an image first');
      return;
    }

    alert('Photo uploaded successfully for printing!');
    setShowPhotoModal(false);
    // Photo is now stored in photoPreview state for printing
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
          .invoice-container { width: 1140px; min-height: 1425px; margin: auto; border: 1px solid black; padding: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th, td { border: 1px solid black; padding: 6px; text-align: left; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header-table td { border: none; }
          .no-border td { border: none !important; }
          .logo { text-align: center; margin-bottom: 10px; }
          .logo img { width: 80px; height: 60px; object-fit: contain; }
          .terms-signatures { margin-top: 15px; }
          @page {
            margin: 0.5cm;
            size: A4;
          }
          @media print {
            .no-print { display: none; }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .invoice-container {
              width: 100% !important;
              max-width: 18cm !important;
              height: auto !important;
              min-height: auto !important;
              margin: 0 !important;
              border: 1px solid black !important;
              padding: 8px !important;
              box-sizing: border-box !important;
            }
          }
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
                <div class="bold" style="font-size:24px; margin-top:5px;">
                  ${comp.companyName}
                </div>
                <div style="font-size:12px; margin-top:5px; line-height:1.4;">
                  ${comp.addressLine1} <br>
                  ${comp.addressLine2} <br>
                  <b>Phone:</b> ${comp.phone}
                </div>
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
                <div style="width:100%; height:130px; border-bottom:1px solid black; display:flex; align-items:center; justify-content:center;">
                  ${photoPreview ? `<img src="${photoPreview}" style="width:100%; height:100%; object-fit:cover;" alt="Customer Photo" />` : '<div style="text-align:center; color:#999;">Photo</div>'}
                </div>
                <!-- ID PROOF ROW -->
                <div style="border-bottom:1px solid black; padding:6px; font-size:13px;">
                  <b>ID PROOF</b><br>
                  <div style="margin-top:4px; width:100%; border:1px solid black; height:28px; text-align:center; padding-top:4px;">
                    ${c.aadhar || '____________'}
                  </div>
                </div>
                <!-- ADDRESS PROOF ROW -->
                <div style="padding:6px; font-size:13px;">
                  <b>PAN NO</b><br>
                  <div style="margin-top:4px; width:100%; border:1px solid black; height:28px; text-align:center; padding-top:4px;">
                    ${c.pan || '____________'}
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
              <td colspan="2"><b>CONTACT</b><br> ${c.mobile}</td>
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
          <table class="terms-signatures">
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
                    <td style="width:100%; height:120px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding:15px 10px 10px 10px; position:relative;">
                      <div style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:13px;">
                        CUSTOMER SIGNATURE
                      </div>
                      <div style="height: 70%; display:flex; align-items:center; justify-content:center; font-size:11px; color:#666; margin-bottom:20px;">
                        Please sign here
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width:100%; height:120px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding:15px 10px 10px 10px; position:relative;">
                      <div style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:13px;">
                        EMPLOYEE SIGNATURE
                      </div>
                      <div style="height: 70%; display:flex; align-items:center; justify-content:center; font-size:11px; color:#666; margin-bottom:20px;">
                        Employee signature required
                      </div>
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

    const win = window.open('', '_blank', 'width=1200,height=800');
    win.document.title = `Invoice - ${r.invoiceNo}`;
    win.document.write(html);
    win.document.close();
  };

  return (
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
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
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
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Invoice No</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Date</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Customer</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Ornament</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Weight (g)</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-left text-xs md:text-sm">Amount</th>
                <th className="border border-gray-300 px-2 md:px-4 py-2 text-center text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillings.map((billing) => (
                <tr key={billing._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 md:px-4 py-2 font-bold text-xs md:text-sm">
                    {billing.invoiceNo}
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {new Date(billing.createdAt || billing.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {billing.customer.name}
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {billing.goldDetails.ornamentType}
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 text-xs md:text-sm">
                    {billing.goldDetails.weight}g
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 font-bold text-xs md:text-sm">
                    ₹{billing.calculation.finalPayout.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 px-2 md:px-4 py-2 text-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => printInvoice(billing)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      title="Print Invoice"
                    >
                      🖨️ Print
                    </button>
                    <button
                      onClick={() => uploadImage(billing._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      title="Upload Image"
                    >
                      📤 Upload
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

      {/* Photo Upload Modal */}
      {showPhotoModal && selectedBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Upload Photo for {selectedBilling.customer?.name}
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoCapture}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear photo of the customer (max 5MB, JPG/PNG/WebP)
                </p>
              </div>

              {photoPreview && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={photoPreview}
                    alt="Customer Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Photo selected successfully</p>
                    <button
                      onClick={removePhoto}
                      className="text-red-500 hover:text-red-700 text-sm font-medium mt-1"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={savePhoto}
                  disabled={!photoPreview}
                  className={`flex-1 font-bold py-2 px-4 rounded-lg transition duration-300 ${
                    !photoPreview
                      ? 'bg-green-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  💾 Save Photo
                </button>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 font-bold py-2 px-4 rounded-lg transition duration-300 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVault;