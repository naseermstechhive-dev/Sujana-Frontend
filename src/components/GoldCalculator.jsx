import React, { useEffect, useState, useRef } from "react";
import { useAdmin } from "../contexts/AdminContext";
import jsPDF from "jspdf";

/**
 Expected structure of public/data/data.json (this component is flexible if fields are missing):
 {
   "companyName": "Sujana Gold Pvt Ltd",
   "addressLine1": "#24, MG Road",
   "addressLine2": "Bengaluru, Karnataka - 560001",
   "phone": "+91 98765 43210",
   "email": "support@sujanagold.in",
   "gstNumber": "29ABCDE1234F1Z5",
   "logoFile": "logo.png"   // must exist in /public/images/
 }
*/

const PURITIES = [
  { label: "24K — 100%", multiplier: 1.0 },
  { label: "22K — 91.6%", multiplier: 0.916 },
  { label: "20K — 83.3%", multiplier: 0.833 },
  { label: "18K — 75%", multiplier: 0.75 },
];

export default function GoldCalculator() {
  const { goldPrices } = useAdmin();
  const [weight, setWeight] = useState("");
  const [purityIndex, setPurityIndex] = useState(0);
  const [result, setResult] = useState(null);

  // company data loaded from public/data/data.json
  const [company, setCompany] = useState(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  // Deduction per gram as you specified
  const DEDUCTION_PER_GRAM = 400;

  // ref for printable receipt container (optional)
  const receiptRef = useRef(null);

  // load company data and logo on mount
  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch("/data/data.json");
        if (!res.ok) throw new Error("Failed to load company data");
        const json = await res.json();
        setCompany(json || null);

        // if logoFile present, fetch logo and convert to dataURL
        if (json && json.logoFile) {
          const logoPath = `/images/${json.logoFile}`;
          try {
            const imgRes = await fetch(logoPath);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const dataUrl = await blobToDataURL(blob);
              setLogoDataUrl(dataUrl);
            } else {
              console.warn("Logo not found at", logoPath);
            }
          } catch (e) {
            console.warn("Failed to fetch logo:", e);
          }
        }
      } catch (e) {
        console.warn("Company data load error:", e);
      }
    }
    loadCompany();
  }, []);


  // helper to convert blob->dataURL
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = (err) => reject(err);
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  function formatCurrency(val) {
    if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
    return Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  function calculate() {
    const grams = parseFloat(weight || 0);
    if (!grams || grams <= 0) {
      setResult(null);
      return;
    }

    const purity = PURITIES[purityIndex];
    const selectedRatePerGram = goldPrices[purity.label.split(' ')[0]] || 5000;

    // All calculations use selected purity rate
    const gross = grams * selectedRatePerGram;
    const deduction = grams * DEDUCTION_PER_GRAM;
    const finalPayout = Math.max(0, gross - deduction);

    // store a detailed result object for PDF / print
    setResult({
      purityLabel: purity.label,
      selectedRatePerGram,
      finalPayout,
      grams,
      date: new Date(),
      invoiceNo: generateInvoiceNo(),
    });
  }

  function generateInvoiceNo() {
    // simple invoice number generator: YMD + random 4 digits
    const d = new Date();
    const y = d.getFullYear().toString().slice(-2);
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = String(Math.floor(1000 + Math.random() * 9000));
    return `INV-${y}${mo}${day}-${rand}`;
  }

  // Save a systematic PDF with logo, company details and calculation breakdown
  async function savePdf() {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const marginLeft = 40;
    let cursorY = 40;

    // header: logo (if available) + company name/details
    if (logoDataUrl) {
      // fit logo in 100x50 box
      doc.addImage(logoDataUrl, "PNG", marginLeft, cursorY, 100, 50);
    }
    // company text start X (right of logo)
    const companyTextX = marginLeft + (logoDataUrl ? 120 : 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const compName = (company && company.companyName) || "Company Name";
    doc.text(compName, companyTextX, cursorY + 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const addr1 = (company && company.addressLine1) || "";
    const addr2 = (company && company.addressLine2) || "";
    const phone = (company && company.phone) || "";
    const email = (company && company.email) || "";
    const gst = (company && company.gstNumber) || "";

    const infoLines = [];
    if (addr1) infoLines.push(addr1);
    if (addr2) infoLines.push(addr2);
    if (phone) infoLines.push(`Phone: ${phone}`);
    if (email) infoLines.push(`Email: ${email}`);
    if (gst) infoLines.push(`GST: ${gst}`);

    // print company info lines
    let ly = cursorY + 36;
    infoLines.forEach((ln) => {
      doc.text(ln, companyTextX, ly);
      ly += 12;
    });

    // invoice meta (right aligned)
    const pageWidth = doc.internal.pageSize.getWidth();
    const metaX = pageWidth - marginLeft;
    doc.setFontSize(10);
    doc.text(`Date: ${result.date.toLocaleDateString()}`, metaX - 0, cursorY + 18, { align: "right" });
    doc.text(`Invoice: ${result.invoiceNo}`, metaX - 0, cursorY + 33, { align: "right" });

    cursorY = Math.max(ly, cursorY + 70);

    // separator
    cursorY += 10;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, cursorY, pageWidth - marginLeft, cursorY);
    cursorY += 18;

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Gold Invoice", marginLeft, cursorY);
    cursorY += 20;

    // Invoice Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    // Table headers
    const col1X = marginLeft;
    const col2X = marginLeft + 150;
    const col3X = pageWidth - marginLeft;

    doc.text("Purity", col1X, cursorY);
    doc.text("Weight (grams)", col2X, cursorY);
    doc.text("Final Pay", col3X, cursorY, { align: "right" });
    cursorY += 15;

    // Table row
    doc.setFont("helvetica", "normal");
    doc.text(result.purityLabel, col1X, cursorY);
    doc.text(`${result.grams} g`, col2X, cursorY);
    doc.text(`₹ ${formatCurrency(result.finalPayout)}`, col3X, cursorY, { align: "right" });
    cursorY += 20;

    // Notes
    doc.setFontSize(10);
    doc.text("Notes:", marginLeft, cursorY);
    cursorY += 12;
    doc.setFontSize(9);
    doc.text("• This is a computed invoice. Final settlement subject to physical verification.", marginLeft, cursorY);

    // footer (company)
    cursorY = doc.internal.pageSize.getHeight() - 60;
    doc.setFontSize(9);
    doc.text((company && company.companyName) || "", marginLeft, cursorY);
    if (gst) doc.text(`GST: ${gst}`, pageWidth - marginLeft, cursorY, { align: "right" });

    doc.save(`${(company && company.companyName?.replace(/\s+/g, "_")) || "company"}_GoldPayout_${result.invoiceNo}.pdf`);
  }

  // Print: open a small new window with printable HTML and call print()
  async function printReceipt() {
    if (!result) return;

    // build printable HTML using company and result data
    const compName = (company && company.companyName) || "Company Name";
    const addr1 = (company && company.addressLine1) || "";
    const addr2 = (company && company.addressLine2) || "";
    const phone = (company && company.phone) || "";
    const email = (company && company.email) || "";
    const gst = (company && company.gstNumber) || "";
    const logoSrc = company && company.logoFile ? `/images/${company.logoFile}` : null;

    const html = `
      <html>
      <head>
        <title>Invoice - ${result.invoiceNo}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { display:flex; gap:12px; align-items:center; }
          .logo { width:80px; height:auto; object-fit:contain; }
          .company { font-size:18px; font-weight:700; }
          .meta { text-align:right; font-size:12px; }
          .hr { border-top:1px solid #ddd; margin: 12px 0; }
          table { width:100%; border-collapse: collapse; margin-top:20px; }
          th, td { border:1px solid #ddd; padding:8px; text-align:left; }
          th { background-color:#f2f2f2; font-weight:700; }
          .total { font-size:20px; font-weight:700; color: #14632a; text-align:center; margin-top:12px; }
          .small { font-size:12px; color:#666; margin-top:8px; text-align:center; }
          @media print {
            button { display: none; }
            body { margin: 0; padding: 4mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${logoSrc ? `<img src="${logoSrc}" class="logo" />` : ""}
            <div>
              <div class="company">${compName}</div>
              <div style="font-size:12px; margin-top:6px;">${addr1 ? addr1 + "<br/>" : ""}${addr2 ? addr2 + "<br/>" : ""}${phone ? "Phone: "+phone + "<br/>" : ""}${email ? "Email: "+email : ""}</div>
            </div>
            <div class="meta">
              <div>${result.date.toLocaleDateString()}</div>
              <div>Invoice: ${result.invoiceNo}</div>
            </div>
          </div>

          <div class="hr"></div>

          <h2 style="text-align:center;">Gold Invoice</h2>

          <table>
            <thead>
              <tr>
                <th>Purity</th>
                <th>Weight (grams)</th>
                <th>Final Pay</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${result.purityLabel}</td>
                <td>${result.grams} g</td>
                <td>₹ ${formatCurrency(result.finalPayout)}</td>
              </tr>
            </tbody>
          </table>

          <div class="small">This is a computed invoice. Final settlement subject to physical verification.</div>

          <div style="text-align:center; margin-top:18px;">
            <button onclick="window.print()">Print</button>
          </div>
        </div>
      </body>
      </html>
    `;

    // open new window and print
    const newWin = window.open("", "_blank", "width=600,height=800");
    if (!newWin) {
      alert("Please allow popups for this website to enable printing.");
      return;
    }
    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();
    // give the content a short moment to load resources like logo
    newWin.focus();
    setTimeout(() => {
      newWin.print();
      // optionally close after printing:
      // newWin.close();
    }, 500);
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams)</label>
          <input
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
            type="number"
            step="0.001"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 22.300"
          />
        </div>

        {/* Purity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purity</label>
          <select
            value={purityIndex}
            onChange={(e) => setPurityIndex(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
          >
            {PURITIES.map((p, index) => (
              <option key={p.label} value={index}>
                {p.label}
              </option>
            ))}
          </select>
        </div>



        {/* Calculate button */}
        <button
          onClick={calculate}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/50"
        >
          Calculate Payout
        </button>

        {/* Result card */}
        {result && (
          <div className="space-y-3">
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-2">Final Payout Amount</div>
              <div className="text-3xl font-bold text-green-600">₹{formatCurrency(result.finalPayout)}</div>
              <div className="text-xs text-gray-500 mt-2">For {result.grams} g {result.purityLabel}</div>
            </div>

            {/* Action Buttons: Print and Save PDF */}
            <div className="grid grid-cols-1 gap-3">
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                onClick={printReceipt}
              >
                🖨️ Print Receipt
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
