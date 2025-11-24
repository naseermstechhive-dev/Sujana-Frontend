import React, { useEffect, useState, useRef } from "react";
import { useAdmin } from "../contexts/AdminContext";

const PURITIES = [
  { label: "24K — 100%", multiplier: 1.0 },
  { label: "22K — 91.6%", multiplier: 0.916 },
  { label: "20K — 83.3%", multiplier: 0.833 },
  { label: "18K — 75%", multiplier: 0.75 },
];

const DEDUCTION_PER_GRAM = 400;

const Billing = () => {
  const { goldPrices } = useAdmin();
  const [showForm, setShowForm] = useState(true);
  const [company, setCompany] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
    aadhar: "",
    pan: "",
    gender: "",
    address: "",
  });

  // ✅ FIXED
  const [weight, setWeight] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [purityIndex, setPurityIndex] = useState(0);

  const [result, setResult] = useState(null);

  // load company data
  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch("/data/data.json");
        const json = await res.json();
        setCompany(json);

        if (json.logoFile) {
          const imgRes = await fetch(`/images/${json.logoFile}`);
          const blob = await imgRes.blob();
          const reader = new FileReader();
          reader.onload = () => setLogoDataUrl(reader.result);
          reader.readAsDataURL(blob);
        }
      } catch (e) {
        console.warn("Company load error", e);
      }
    }
    loadCompany();
  }, []);


  function calculate() {
    const grossW = parseFloat(weight || 0);
    const stoneW = parseFloat(stoneWeight || 0);
    const netW = grossW - stoneW;

    if (grossW <= 0 || netW <= 0) {
      setResult(null);
      return;
    }

    const purity = PURITIES[purityIndex];
    const purityKey = purity.label.split(" ")[0];

    const selectedRate =
      goldPrices?.[purityKey] || 5000; // fallback if admin not set

    const gross = netW * selectedRate;
    const deduction = netW * DEDUCTION_PER_GRAM;
    const finalPayout = Math.max(0, gross - deduction);

    setResult({
      purityLabel: purity.label,
      selectedRatePerGram: selectedRate,
      grams: grossW,
      stone: stoneW,
      net: netW,
      finalPayout,
      date: new Date(),
      invoiceNo: generateInvoiceNo(),
    });
  }

  function generateInvoiceNo() {
    const d = new Date();
    return (
      "INV-" +
      d.getFullYear().toString().slice(-2) +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      d.getDate().toString().padStart(2, "0") +
      "-" +
      Math.floor(Math.random() * 9000 + 1000)
    );
  }

  function printInvoice() {
    if (!result) return alert("Please calculate the amount first!");

    const comp = company;
    const c = customer;
    const r = result;

    const html = `
      <html>
      <head>
        <title>${r.invoiceNo}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; }
          .header { text-align: center; margin-bottom: 10px; }
          .terms { margin-top: 20px; font-size: 12px; }
          @media print { button { display:none; } }
        </style>
      </head>

      <body>

        <div class="header">
          <img src="/images/${comp.logoFile}" width="80" />
          <h2>${comp.companyName}</h2>
          <p>${comp.addressLine1}<br/>${comp.addressLine2}<br/>Phone: ${comp.phone}</p>
        </div>

        <h3>Customer Details</h3>
        <p><b>Name:</b> ${c.name}</p>
        <p><b>Mobile:</b> ${c.mobile}</p>
        <p><b>Aadhar:</b> ${c.aadhar}</p>
        <p><b>PAN:</b> ${c.pan}</p>
        <p><b>Gender:</b> ${c.gender}</p>
        <p><b>Address:</b> ${c.address}</p>

        <h3>Gold Details</h3>

        <table>
          <tr>
            <th>Purity</th>
            <th>Gross Weight</th>
            <th>Stone Wt</th>
            <th>Net Wt</th>
            <th>Final Payout</th>
          </tr>

          <tr>
            <td>${r.purityLabel}</td>
            <td>${r.grams} g</td>
            <td>${r.stone} g</td>
            <td>${r.net} g</td>
            <td>₹ ${Number(r.finalPayout).toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}</td>
          </tr>
        </table>

        <div class="terms">
          <h4>Terms & Conditions</h4>

          <p><b>ENGLISH</b></p>
          <p>Ornaments once sold to Sujana Gold Company shall not be returned under any circumstances.</p>
          <p>If any losses arise out of this transaction, you shall be fully liable to settle the entire amount.</p>
          <p>Selling stolen, counterfeit, or fake gold/silver is a criminal offence. If such items are identified, the matter will be reported to the authorities.</p>
          <p>Ornaments are being purchased from you based on your declaration that you are the rightful owner and possess full saleable title to the items. You fully agree to indemnify Sujana Gold Company and its employees against any claims, disputes, or criminal liabilities arising in the future related to this transaction.</p>
          <p>Please verify the cash before leaving the counter. No claims regarding shortages or discrepancies will be accepted thereafter.</p>

          <p><b>TELUGU (తెలుగు)</b></p>
          <p>సుజనా గోల్డ్ కంపెనీకి ఒకసారి అమ్మిన ఆభరణాలు ఏ పరిస్థితుల్లోనూ తిరిగి ఇవ్వబడవు.</p>
          <p>ఈ లావాదేవీ నుండి ఏవైనా నష్టాలు కలిగితే, వాటిని పూర్తిగా పరిష్కరించాల్సిన బాధ్యత మీపై ఉంటుంది.</p>
          <p>దొంగిలించిన, నకిలీ లేదా నాసిరకం బంగారం/వెండి అమ్మడం క్రిమినల్ నేరం. అలాంటి వస్తువులు గుర్తించబడితే అధికారులకు సమాచారం ఇచ్చబడుతుంది.</p>
          <p>మీరు అమ్ముతున్న ఆభరణాలు మీ స్వంతం అని, వాటిపై మీకు పూర్తి హక్కు ఉందని మీరు ప్రకటించిన ఆధారంగా సుజనా గోల్డ్ కంపెనీ కొనుగోలు చేస్తోంది. ఈ లావాదేవీకి సంబంధించి భవిష్యత్తులో ఏర్పడే ఏవైనా వివాదాలు లేదా క్రిమినల్ బాధ్యతల విషయంలో సుజనా గోల్డ్ కంపెనీ మరియు దాని ఉద్యోగులను మీరు పూర్తిగా రక్షించేందుకు అంగీకరిస్తున్నారు.</p>
          <p>కౌంటర్ నుండి వెళ్లే ముందు నగదును తప్పనిసరిగా సరిచూసుకోండి. తరువాత నగదు లోటు లేదా తేడాలపై ఎలాంటి ఫిర్యాదులు స్వీకరించబడవు.</p>

          <p><b>HINDI (हिन्दी)</b></p>
          <p>एक बार सुजाना गोल्ड कंपनी को बेचे गए आभूषण किसी भी परिस्थिति में वापस नहीं लिए जाएंगे।</p>
          <p>इस लेनदेन से उत्पन्न होने वाले किसी भी प्रकार के नुकसान की पूरी जिम्मेदारी आपकी होगी और आपको पूरा भुगतान करना होगा।</p>
          <p>चोरी का, नकली या मिलावटी सोना/चांदी बेचना एक दंडनीय अपराध है। ऐसे सामान पाए जाने पर इसकी सूचना संबंधित अधिकारियों को दी जाएगी।</p>
          <p>आपके द्वारा दिए गए इस घोषणा-पत्र के आधार पर सुजाना गोल्ड कंपनी आभूषण खरीद रही है कि आप इन आभूषणों के असली मालिक हैं और इन्हें बेचने का पूरा अधिकार आपको है। इस लेनदेन से संबंधित भविष्य में होने वाले किसी भी दावे, विवाद या आप पर लगने वाली किसी भी आपराधिक ज़िम्मेदारी से सुजाना गोल्ड कंपनी और उसके कर्मचारियों को आप पूर्ण रूप से मुक्त रखेंगे।</p>
          <p>काउंटर छोड़ने से पहले कृपया नकदी अवश्य जाँच लें। बाद में किसी भी प्रकार की कमी या गड़बड़ी की शिकायत स्वीकार नहीं की जाएगी</p>

          <div style="margin-top:40px; text-align:right;">
            ________________________ <br/>
            Signature
          </div>
        </div>

        <button onclick="window.print()">Print</button>

      </body></html>
    `;

    const win = window.open("", "_blank");
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

      {/* Form */}
      {showForm && (
        <div className="mt-10 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4">
            <h3 className="text-xl font-bold text-white text-center">Gold Billing Form</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Gold Calculation Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Gold Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gross Weight (g)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stone Weight (g)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purity</label>
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
                  <div className="text-sm text-gray-600 mb-2">Final Payout Amount</div>
                  <div className="text-3xl font-bold text-green-600">₹{Number(result.finalPayout).toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}</div>
                </div>
              )}
            </div>

            {/* Customer Details Section */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.mobile}
                    onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit Aadhar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.aadhar}
                    onChange={(e) => setCustomer({ ...customer, aadhar: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    placeholder="Enter PAN number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={customer.pan}
                    onChange={(e) => setCustomer({ ...customer, pan: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={customer.gender}
                    onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    placeholder="Enter complete address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows="3"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
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
