import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { numberToWords } from '../utils/numberUtils';
import { billingAPI } from '../services/api';
import html2pdf from 'html2pdf.js';

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

  // Multiple items support
  const [items, setItems] = useState([
    {
      id: 1,
      weight: '',
      stoneWeight: '',
      purityIndex: 0,
      ornamentType: 'Gold Ornament',
      kdmType: 'KDM',
      calculatedAmount: 0,
      editedAmount: '',
    }
  ]);

  // New State for Billing Requirements
  const [billingType, setBillingType] = useState('Physical');
  const [bankName, setBankName] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(2);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [renewalAmount, setRenewalAmount] = useState(100000); // Default 1 Lakh
  const [editableAmount, setEditableAmount] = useState(''); // Editable final combined amount

  // Removed useEffect for auto-calculation
  // useEffect(() => { ... }, [commissionPercentage]);

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBillingSaved, setIsBillingSaved] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

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

  // Update result calculation editedAmount when editableAmount changes
  useEffect(() => {
    if (result && editableAmount) {
      const parsedAmount = parseFloat(editableAmount) || result.totalAmount;
      // Round to 2 decimal places
      const newEditedAmount = Math.round(parsedAmount * 100) / 100;
      const currentEditedAmount = result.calculation?.editedAmount;
      // Only update if the value actually changed to prevent infinite loop
      if (currentEditedAmount !== newEditedAmount && !isNaN(newEditedAmount)) {
        setResult(prev => ({
          ...prev,
          totalAmount: newEditedAmount,
          calculation: {
            ...prev.calculation,
            editedAmount: newEditedAmount,
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableAmount]); // Only depend on editableAmount to prevent infinite loop

  // Add new item
  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        weight: '',
        stoneWeight: '',
        purityIndex: 0,
        ornamentType: 'Gold Ornament',
        kdmType: 'KDM',
        calculatedAmount: 0,
        editedAmount: '',
      }
    ]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert('At least one item is required');
    }
  };

  // Update item field
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Update item edited amount
  const updateItemAmount = (id, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const parsed = parseFloat(value) || 0;
        const rounded = Math.round(parsed * 100) / 100;
        return { ...item, editedAmount: rounded.toFixed(2) };
      }
      return item;
    });
    setItems(updatedItems);
    
    // Recalculate total using updated items
    if (result) {
      const total = updatedItems.reduce((sum, item) => {
        return sum + parseFloat(item.editedAmount || item.calculatedAmount || 0);
      }, 0);
      const totalRounded = Math.round(total * 100) / 100;
      setEditableAmount(totalRounded.toFixed(2));
      
      // Update result total
      setResult(prev => ({
        ...prev,
        totalAmount: totalRounded,
        calculation: {
          ...prev.calculation,
          editedAmount: totalRounded,
        },
      }));
    }
  };

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
    // Calculate commission for Release type
    let calculatedCommission = 0;
    if (billingType === 'Release') {
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

    // Calculate each item
    const calculatedItems = items.map(item => {
      const grossW = parseFloat(item.weight || 0);
      const stoneW = parseFloat(item.stoneWeight || 0);
      const netW = grossW - stoneW;

      if (grossW <= 0 || netW <= 0) {
        return {
          ...item,
          calculatedAmount: 0,
          net: 0,
          grams: 0,
          stone: 0,
          purityLabel: '',
          selectedRatePerGram: 0,
        };
      }

      const purity = PURITIES[item.purityIndex];
      const purityKey = purity.label.split(' ')[0];
      const selectedRate = goldPrices?.[purityKey] || 5000;

      const gross = netW * selectedRate;
      const deduction = netW * DEDUCTION_PER_GRAM;
      const finalPayout = Math.max(0, gross - deduction);
      const finalPayoutRounded = Math.round(finalPayout * 100) / 100;

      return {
        ...item,
        calculatedAmount: finalPayoutRounded,
        editedAmount: item.editedAmount || finalPayoutRounded.toFixed(2),
        net: netW,
        grams: grossW,
        stone: stoneW,
        purityLabel: purity.label,
        selectedRatePerGram: selectedRate,
      };
    });

    // Check if at least one item is valid
    const validItems = calculatedItems.filter(item => item.grams > 0);
    if (validItems.length === 0) {
      setResult(null);
      return;
    }

    // Calculate total combined amount
    const totalAmount = calculatedItems.reduce((sum, item) => {
      const amount = parseFloat(item.editedAmount || item.calculatedAmount || 0);
      return sum + amount;
    }, 0);
    const totalAmountRounded = Math.round(totalAmount * 100) / 100;

    // Update items with calculated values
    setItems(calculatedItems);

    const currentInvoiceNo = result?.invoiceNo || await getNextInvoice();

    setResult({
      items: calculatedItems,
      totalAmount: totalAmountRounded,
      date: new Date(),
      invoiceNo: currentInvoiceNo,
      commissionAmount: calculatedCommission,
      calculation: {
        editedAmount: totalAmountRounded,
      },
    });

    // Set editable amount to the calculated total (formatted to 2 decimal places)
    setEditableAmount(totalAmountRounded.toFixed(2));
  }

  // Image compression function
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Photo handling functions
  const handlePhotoCapture = async (event) => {
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

      try {
        // Compress image before storing
        const compressedDataUrl = await compressImage(file, 800, 800, 0.7);
        setCustomerPhoto(file);
        setPhotoPreview(compressedDataUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setCustomerPhoto(file);
          setPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = () => {
    setCustomerPhoto(null);
    setPhotoPreview(null);
  };

  // Signature handling functions
  const handleSignatureCapture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Signature size should be less than 2MB');
        return;
      }

      try {
        // Compress signature image (smaller dimensions for signature)
        const compressedDataUrl = await compressImage(file, 600, 300, 0.8);
        setCustomerSignature(file);
        setSignaturePreview(compressedDataUrl);
      } catch (error) {
        console.error('Error compressing signature:', error);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          setCustomerSignature(file);
          setSignaturePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeSignature = () => {
    setCustomerSignature(null);
    setSignaturePreview(null);
  };

  // Initialize form data tracking
  useEffect(() => {
    setInitialFormData({
      customer,
      billingType,
      bankName,
      renewalAmount,
      commissionPercentage,
      items,
      customerPhoto: photoPreview,
      customerSignature: signaturePreview,
      editableAmount,
    });
  }, []);

  // Check if form has changes
  const hasFormChanged = () => {
    if (!initialFormData) return false;

    const currentData = {
      customer,
      billingType,
      bankName,
      renewalAmount,
      commissionPercentage,
      items,
      customerPhoto: photoPreview,
      customerSignature: signaturePreview,
      editableAmount,
    };

    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(initialFormData);

    // Reset billing saved state if form has changed
    if (hasChanged && isBillingSaved) {
      setIsBillingSaved(false);
    }

    return hasChanged;
  };

  // Check for duplicates in database
  const checkForDuplicates = async () => {
    try {
      // Check if invoice number already exists (if result exists)
      if (result?.invoiceNo) {
        const existingBillings = await billingAPI.getAllBillings();
        if (existingBillings.success) {
          const duplicate = existingBillings.data.find(billing =>
            billing.invoiceNo === result.invoiceNo
          );
          if (duplicate) {
            return { hasDuplicate: true, message: 'Invoice number already exists in database' };
          }
        }
      }

      // Check for duplicate customer + gold details (same customer, same weight, same day)
      const today = new Date().toDateString();
      const existingBillings = await billingAPI.getAllBillings();
      if (existingBillings.success) {
        const duplicate = existingBillings.data.find(billing => {
          const billingDate = new Date(billing.createdAt || billing.date).toDateString();
          return billingDate === today &&
                 billing.customer?.name === customer.name &&
                 billing.customer?.mobile === customer.mobile &&
                 billing.goldDetails?.weight === parseFloat(weight);
        });
        if (duplicate) {
          return {
            hasDuplicate: true,
            message: 'Similar billing already exists for this customer today with same weight'
          };
        }
      }

      return { hasDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { hasDuplicate: false }; // Allow save if check fails
    }
  };

  // Save billing data function
  const saveBilling = async () => {
    if (!result) {
      alert('Please calculate the amount first!');
      return;
    }

    // Check if form has changes
    if (!hasFormChanged()) {
      alert('No changes detected. Please modify the form before saving.');
      return;
    }

    // Validate form
    if (!validateForm()) {
      alert('Please fix the validation errors before saving.');
      return;
    }

    // Check for duplicates
    const duplicateCheck = await checkForDuplicates();
    if (duplicateCheck.hasDuplicate) {
      alert(`Cannot save: ${duplicateCheck.message}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare items data for backend
      const itemsData = result.items.map(item => ({
        weight: parseFloat(item.weight),
        stoneWeight: parseFloat(item.stoneWeight),
        purityIndex: item.purityIndex,
        purityLabel: item.purityLabel,
        ornamentType: item.ornamentType,
        kdmType: item.kdmType,
        selectedRatePerGram: item.selectedRatePerGram,
        grams: item.grams,
        stone: item.stone,
        net: item.net,
        finalPayout: item.calculatedAmount,
        editedAmount: parseFloat(item.editedAmount) || item.calculatedAmount,
      }));

      // Calculate totals
      const totalGrams = itemsData.reduce((sum, item) => sum + item.grams, 0);
      const totalStone = itemsData.reduce((sum, item) => sum + item.stone, 0);
      const totalNet = itemsData.reduce((sum, item) => sum + item.net, 0);
      
      // For backward compatibility, use first item's rate or calculate weighted average
      const firstItem = itemsData[0];
      const selectedRatePerGram = firstItem?.selectedRatePerGram || 5000;

      const billingData = {
        customer,
        goldDetails: {
          items: itemsData,
          // Keep backward compatibility - use totals for single item fields
          weight: totalGrams,
          stoneWeight: totalStone,
          purityIndex: itemsData[0]?.purityIndex || 0,
          purityLabel: itemsData[0]?.purityLabel || '',
          ornamentType: itemsData[0]?.ornamentType || 'Gold Ornament',
          kdmType: itemsData[0]?.kdmType || 'KDM',
        },
        calculation: {
          // Required fields for backward compatibility
          selectedRatePerGram: selectedRatePerGram,
          grams: totalGrams,
          stone: totalStone,
          net: totalNet,
          finalPayout: result.totalAmount,
          editedAmount: parseFloat(editableAmount) || result.totalAmount,
          // Additional fields for multiple items support
          items: itemsData,
          totalGrams,
          totalStone,
          totalNet,
        },
        invoiceNo: result.invoiceNo,
        billingType,
        bankName: billingType !== 'Physical' ? bankName : undefined,
        commissionPercentage: billingType === 'Release' ? commissionPercentage : undefined,
        commissionAmount: billingType === 'Release' ? commissionAmount : undefined,
        customerPhoto: photoPreview, // Save customer photo
        customerSignature: signaturePreview, // Save customer signature
      };

      await billingAPI.createBilling(billingData);
      alert('Billing saved successfully!');
      setIsBillingSaved(true);

      // Update initial form data to current state
      setInitialFormData({
        customer,
        billingType,
        bankName,
        renewalAmount,
        commissionPercentage,
        items,
        customerPhoto: photoPreview,
        customerSignature: signaturePreview,
        editableAmount,
      });

    } catch (error) {
      alert('Failed to save billing: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Customer Name validation
    if (!customer.name.trim()) {
      newErrors.name = 'Customer name is required';
    } else if (customer.name.trim().length < 2) {
      newErrors.name = 'Customer name must be at least 2 characters';
    }

    // Mobile validation
    if (!customer.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(customer.mobile.trim())) {
      newErrors.mobile = 'Mobile number must be 10 digits starting with 6-9';
    }

    // Aadhar validation
    if (!customer.aadhar.trim()) {
      newErrors.aadhar = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(customer.aadhar.trim())) {
      newErrors.aadhar = 'Aadhar number must be exactly 12 digits';
    }

    // PAN validation (optional)
    if (customer.pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(customer.pan.trim().toUpperCase())) {
      newErrors.pan = 'PAN number must be 10 characters: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)';
    }

    // Gender validation
    if (!customer.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Address validation
    if (!customer.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (customer.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    // Gold details validation for all items
    items.forEach((item, index) => {
      if (!item.weight || parseFloat(item.weight) <= 0) {
        newErrors[`weight_${item.id}`] = `Item ${index + 1}: Gross weight must be greater than 0`;
      }

      if (parseFloat(item.stoneWeight || 0) >= parseFloat(item.weight || 0)) {
        newErrors[`stoneWeight_${item.id}`] = `Item ${index + 1}: Stone weight cannot be greater than or equal to gross weight`;
      }

      if (!item.ornamentType.trim()) {
        newErrors[`ornamentType_${item.id}`] = `Item ${index + 1}: Ornament type is required`;
      }

      if (!item.kdmType) {
        newErrors[`kdmType_${item.id}`] = `Item ${index + 1}: KDM type is required`;
      }
    });

    // Billing type specific validations
    if (billingType === 'Release' || billingType === 'TakeOver') {
      if (!bankName.trim()) {
        newErrors.bankName = 'Bank name is required for release/takeover';
      }
    }

    if (billingType === 'Release') {
      if (!renewalAmount || parseFloat(renewalAmount) <= 0) {
        newErrors.renewalAmount = 'Release amount must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  // Reset/Clear form function
  const resetForm = () => {
    // Reset customer details
    setCustomer({
      name: '',
      mobile: '',
      aadhar: '',
      pan: '',
      gender: '',
      address: '',
    });

    // Reset items to single empty item
    setItems([
      {
        id: 1,
        weight: '',
        stoneWeight: '',
        purityIndex: 0,
        ornamentType: 'Gold Ornament',
        kdmType: 'KDM',
        calculatedAmount: 0,
        editedAmount: '',
      }
    ]);

    // Reset billing details
    setBillingType('Physical');
    setBankName('');
    setCommissionPercentage(2);
    setCommissionAmount(0);
    setRenewalAmount(100000);
    setEditableAmount('');

    // Reset calculation result
    setResult(null);

    // Reset errors
    setErrors({});

    // Reset billing saved status
    setIsBillingSaved(false);

    // Reset photo
    setCustomerPhoto(null);
    setPhotoPreview(null);
    
    // Reset signature
    setCustomerSignature(null);
    setSignaturePreview(null);
    
    // Reset signature
    setCustomerSignature(null);
    setSignaturePreview(null);

    // Reset initial form data
    setInitialFormData(null);
  };

  // Removed generateInvoiceNo using localStorage
  // function generateInvoiceNo() { ... }

  // Common invoice styles
  const getInvoiceStyles = () => `
    body { font-family: Arial, sans-serif; padding: 0; margin: 0; background: white; }
    .invoice-container { width: 1000px; min-height: 1425px; margin: auto; border: 1px solid black; padding: 10px; }
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
  `;

  // Common header section
  const getInvoiceHeader = (comp, r) => `
    <table class="header-table">
      <tr>
        <td class="center" colspan="3">
          <div class="logo">
            <img src="/images/${comp.logoFile}" alt="${comp.companyName}" style="width: 80px; height: 60px; object-fit: contain; max-width: 80px; max-height: 60px;" />
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
    <table>
      <tr>
        <td><b>BRANCH :</b> Kadapa - Central</td>
        <td><b>CONTACT :</b> ${comp.phone}</td>
        <td><b>INVOICE NO :</b> ${r.invoiceNo}</td>
      </tr>
    </table>
  `;

  // Common customer info section
  const getCustomerInfo = (c, r, photoPreview) => `
    <table>
      <tr>
        <td><b>CUSTOMER ID</b><br> SUJANA-${r.invoiceNo.split('-').pop()}</td>
        <td><b>DATE / TIME</b><br> ${new Date(r.date).toLocaleString()}</td>
        <td rowspan="4" style="width:180px; padding:0; margin:0; border:1px solid black; vertical-align:top;">
          <div style="width:100%; height:130px; border-bottom:1px solid black; display:flex; align-items:center; justify-content:center;">
            ${photoPreview ? `<img src="${photoPreview}" style="width:100%; height:100%; object-fit:cover;" alt="Customer Photo" />` : '<div style="text-align:center; color:#999;">Photo</div>'}
          </div>
          <div style="border-bottom:1px solid black; padding:6px; font-size:13px;">
            <b>ID PROOF</b><br>
            <div style="margin-top:4px; width:100%; border:1px solid black; height:28px; text-align:center; padding-top:4px;">
              ${c.aadhar || '____________'}
            </div>
          </div>
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
  `;

  // Common items table
  const getItemsTable = (r) => {
    const items = r.items || [];
    // Backward compatibility: if no items array, use single item format
    if (items.length === 0 && r.ornamentType) {
      return `
        <table>
          <tr class="center bold">
            <th>ORNAMENT TYPE</th>
            <th>KDM TYPE</th>
            <th>GROSS WEIGHT</th>
            <th>STONE / WAX</th>
            <th>NET WEIGHT</th>
            <th>PURITY</th>
            <th>GROSS AMOUNT</th>
          </tr>
          <tr class="center">
            <td>${r.ornamentType}</td>
            <td>${r.kdmType}</td>
            <td>${parseFloat(r.grams || 0).toFixed(3)} g</td>
            <td>${parseFloat(r.stone || 0).toFixed(3)} g</td>
            <td>${parseFloat(r.net || 0).toFixed(3)} g</td>
            <td>${r.purityLabel}</td>
            <td>₹ ${Number(r.calculation?.editedAmount || r.finalPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="center bold">
            <td colspan="2">GRAND TOTAL</td>
            <td>${parseFloat(r.grams || 0).toFixed(3)}</td>
            <td>${parseFloat(r.stone || 0).toFixed(3)}</td>
            <td>${parseFloat(r.net || 0).toFixed(3)}</td>
            <td>-</td>
            <td>₹ ${Number(r.calculation?.editedAmount || r.finalPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      `;
    }

    // Calculate totals
    const totalGrams = items.reduce((sum, item) => sum + parseFloat(item.grams || 0), 0);
    const totalStone = items.reduce((sum, item) => sum + parseFloat(item.stone || 0), 0);
    const totalNet = items.reduce((sum, item) => sum + parseFloat(item.net || 0), 0);
    const totalAmount = r.totalAmount || r.calculation?.editedAmount || r.finalPayout || 0;

    // Generate rows for each item
    const itemRows = items.map(item => `
      <tr class="center">
        <td>${item.ornamentType}</td>
        <td>${item.kdmType}</td>
        <td>${parseFloat(item.grams || 0).toFixed(3)} g</td>
        <td>${parseFloat(item.stone || 0).toFixed(3)} g</td>
        <td>${parseFloat(item.net || 0).toFixed(3)} g</td>
        <td>${item.purityLabel}</td>
        <td>₹ ${Number(item.editedAmount || item.calculatedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    return `
      <table>
        <tr class="center bold">
          <th>ORNAMENT TYPE</th>
          <th>KDM TYPE</th>
          <th>GROSS WEIGHT</th>
          <th>STONE / WAX</th>
          <th>NET WEIGHT</th>
          <th>PURITY</th>
          <th>GROSS AMOUNT</th>
        </tr>
        ${itemRows}
        <tr class="center bold">
          <td colspan="2">GRAND TOTAL</td>
          <td>${totalGrams.toFixed(3)}</td>
          <td>${totalStone.toFixed(3)}</td>
          <td>${totalNet.toFixed(3)}</td>
          <td>-</td>
          <td>₹ ${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    `;
  };

  // Common terms and signatures
  const getTermsAndSignatures = (r, signaturePreview) => `
    <table class="terms-signatures">
      <tr>
        <td style="width:65%; vertical-align:top; padding:8px;">
          <div class="bold center" style="margin-bottom:5px;">TERMS & CONDITIONS</div>
          <div style="font-size:12px; line-height:1.3;">
            1. Ornaments once purchased shall not be returned under any circumstances. <br>
            2. If any losses are arising out of this purchase, then you are liable to settle full amount. <br>
            3. Selling stolen gold, silver or fake gold is a criminal offence, if found will be reported to authorities. <br>
            4. Ornaments were purchased from you based on the declaration that you hold the ownership and saleable title on the ornaments and you completely agree to indemnify Sujana Gold and its employees from any further claim arising out of dispute or due to any criminal liabilities framed against you. <br>
            5. Kindly ensure the correctness of cash before leaving the counter, No claims for shortfall will be entertained thereafter.
          </div>
          <div style="margin-top:8px; margin-bottom:5px;" class="bold center">షరతులు మరియు నిబంధనలు</div>
          <div style="font-size:12px; line-height:1.4;">
            1. ఒకసారి కొనుగోలు చేసిన ఆభరణాలను ఎట్టి పరిస్థితుల్లోనూ తిరిగి ఇవ్వబడదు. <br>
            2. మీ కొనుగోలుతో ఏవైనా నష్టం జరిగితే, మీరు మొత్తం మొత్తాన్ని చెల్లించాల్సి ఉంటుంది. <br>
            3. దొంగతనం చేసిన బంగారం, వెండి లేదా నకిలీ బంగారం అమ్మడం క్రిమినల్ నేరం. ఇది బయటపడిన పక్షంలో పోలీసులకు సమాచారం ఇవ్వబడుతుంది. <br>
            4. మీరు బంగారం అమ్మినప్పుడు, మీకు ఆ ఆభరణాల యజమాన్యం ఉందని మరియు అమ్మే హక్కు ఉందని మీరు ప్రకటించినట్టుగా భావిస్తాము. ఏవైనా వివాదాలు లేదా క్రిమినల్ కేసులు వస్తే, సుజనా గోల్డ్ మరియు దాని ఉద్యోగులను మీరు పూర్తిగా బాధ్యతల నుంచి విముక్తులు చేయాలి. <br>
            5. కౌంటర్‌ను వదిలి వెళ్లే ముందు మీరు పొందిన నగదును పరీక్షించుకోండి. తర్వాత ఏవైనా తక్కువ వచ్చినట్లయితే దాని గురించి అభ్యర్థనలు అంగీకరించబడవు.
          </div>
        </td>
        <td style="width:35%; padding:0; vertical-align:top;">
          <table style="width:100%; border-collapse: collapse; margin-top:10px;">
            <tr>
              <td style="width:100%; height:120px; border:1px solid black; text-align:center; font-weight:bold; vertical-align:bottom; padding:15px 10px 10px 10px; position:relative;">
                <div style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:13px;">
                  CUSTOMER SIGNATURE
                </div>
                <div style="height: 70%; display:flex; align-items:center; justify-content:center; margin-bottom:20px; padding:5px;">
                  ${signaturePreview ? `<img src="${signaturePreview}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Customer Signature" />` : '<div style="font-size:11px; color:#666;">Please sign here</div>'}
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
      <tr>
        <td colspan="2"><b>AMOUNT IN WORDS :</b> ${numberToWords(Math.round(r.totalAmount || r.calculation?.editedAmount || r.finalPayout || 0))}</td>
      </tr>
    </table>
  `;

  async function printInvoice() {
    if (!result) return alert('Please calculate the amount first!');

    // Check if billing is saved before printing
    if (!isBillingSaved) {
      alert('Please save the billing data first before printing the invoice.');
      return;
    }

    // Validate form before proceeding
    if (!validateForm()) {
      alert('Please fix the validation errors before printing.');
      return;
    }

    const comp = company;
    const c = customer;
    const r = result;

    // Route to appropriate invoice template based on billing type
    if (billingType === 'Release') {
      printReleaseInvoice(comp, c, r);
    } else if (billingType === 'TakeOver') {
      printTakeOverInvoice(comp, c, r);
    } else {
      printPhysicalInvoice(comp, c, r);
    }
  }

  // Physical Billing Invoice
  function printPhysicalInvoice(comp, c, r) {

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${r.invoiceNo}</title>
        <style>${getInvoiceStyles()}</style>
      </head>
      <body>
        <div class="no-print" style="text-align:center; margin:10px;">
          <button onclick="window.print()" style="padding:10px 20px; background:#d4a017; border:none; color:white; font-size:16px; cursor:pointer;">
            Print Invoice
          </button>
        </div>
        <div class="invoice-container">
          ${getInvoiceHeader(comp, r)}
          ${getCustomerInfo(c, r, photoPreview)}
          ${getItemsTable(r)}
          ${getTermsAndSignatures(r, signaturePreview)}
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=1200,height=800');
    win.document.title = `Invoice - ${r.invoiceNo}`;
    win.document.write(html);
    win.document.close();
  }

  // Release Billing Invoice (with Bank Details)
  function printReleaseInvoice(comp, c, r) {
    const bankDetailsSection = `
      <table style="margin-top:10px;">
        <tr class="bold center" style="background-color:#f0f0f0;">
          <td colspan="4">BANK DETAILS</td>
        </tr>
        <tr>
          <td><b>BANK NAME:</b></td>
          <td>${bankName || '____________'}</td>
          <td><b>RELEASE AMOUNT:</b></td>
          <td>₹ ${Number(renewalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><b>COMMISSION %:</b></td>
          <td>${commissionPercentage}%</td>
          <td><b>COMMISSION AMOUNT:</b></td>
          <td>₹ ${Number(commissionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    `;

    const invoiceHTML = `
      <div class="invoice-container">
        ${getInvoiceHeader(comp, r)}
        ${getCustomerInfo(c, r, photoPreview)}
        ${bankDetailsSection}
        ${getItemsTable(r)}
        ${getTermsAndSignatures(r, signaturePreview)}
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${r.invoiceNo} - Release</title>
        <style>${getInvoiceStyles()}</style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      </head>
      <body>
        <div class="no-print" style="text-align:center; margin:10px;">
          <button onclick="window.print()" style="padding:10px 20px; background:#d4a017; border:none; color:white; font-size:16px; cursor:pointer; margin-right:10px;">
            Print Invoice
          </button>
          <button onclick="downloadPDF()" style="padding:10px 20px; background:#28a745; border:none; color:white; font-size:16px; cursor:pointer;">
            Download PDF
          </button>
        </div>
        ${invoiceHTML}
        <script>
          function downloadPDF() {
            const element = document.querySelector('.invoice-container');
            const opt = {
              margin: [0, 0, 0, 0],
              filename: '${r.invoiceNo}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 1.5,
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: true,
                width: 1000,
                height: 1425,
                windowWidth: 1000
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save();
          }
        </script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=1200,height=800');
    win.document.title = `Release Invoice - ${r.invoiceNo}`;
    win.document.write(html);
    win.document.close();
  }

  // Download PDF Invoice function
  const downloadInvoicePDF = () => {
    if (!company || !result) {
      alert('Company data or billing result not available');
      return;
    }

    const comp = company;
    const c = customer;
    const r = result;

    // Generate bank details section if needed
    let bankDetailsSection = '';
    if (billingType === 'Release') {
      bankDetailsSection = `
        <table style="margin-top:10px;">
          <tr class="bold center" style="background-color:#f0f0f0;">
            <td colspan="4">BANK DETAILS</td>
          </tr>
          <tr>
            <td><b>BANK NAME:</b></td>
            <td>${bankName || '____________'}</td>
            <td><b>RELEASE AMOUNT:</b></td>
            <td>₹ ${Number(renewalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td><b>COMMISSION %:</b></td>
            <td>${commissionPercentage}%</td>
            <td><b>COMMISSION AMOUNT:</b></td>
            <td>₹ ${Number(commissionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      `;
    } else if (billingType === 'TakeOver') {
      bankDetailsSection = `
        <table style="margin-top:10px;">
          <tr class="bold center" style="background-color:#f0f0f0;">
            <td colspan="2">BANK DETAILS</td>
          </tr>
          <tr>
            <td><b>BANK NAME:</b></td>
            <td>${bankName || '____________'}</td>
          </tr>
        </table>
      `;
    }

    // Get the full URL for the logo to ensure it loads correctly in iframe
    const logoUrl = window.location.origin + `/images/${comp.logoFile}`;
    
    // Create header with absolute logo URL
    const invoiceHeader = `
      <table class="header-table">
        <tr>
          <td class="center" colspan="3">
            <div class="logo">
              <img src="${logoUrl}" alt="${comp.companyName}" style="width: 80px; height: 60px; object-fit: contain; max-width: 80px; max-height: 60px; display: block; margin: 0 auto;" />
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
      <table>
        <tr>
          <td><b>BRANCH :</b> Kadapa - Central</td>
          <td><b>CONTACT :</b> ${comp.phone}</td>
          <td><b>INVOICE NO :</b> ${r.invoiceNo}</td>
        </tr>
      </table>
    `;

    // Create full HTML document exactly like print invoice
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${r.invoiceNo}</title>
        <style>${getInvoiceStyles()}</style>
      </head>
      <body style="margin:0; padding:0; background:white;">
        <div class="invoice-container">
          ${invoiceHeader}
          ${getCustomerInfo(c, r, photoPreview)}
          ${bankDetailsSection}
          ${getItemsTable(r)}
          ${getTermsAndSignatures(r, signaturePreview)}
        </div>
      </body>
      </html>
    `;

    // Create iframe to render the HTML properly
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '1000px';
    iframe.style.height = '1425px';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = 'white';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(fullHTML);
    iframeDoc.close();

    // Wait for iframe to load
    iframe.onload = () => {
      // Wait for images to load
      const images = iframeDoc.querySelectorAll('img');
      let imagesLoaded = 0;
      const totalImages = images.length;

      const checkAndGenerate = () => {
        if (imagesLoaded >= totalImages) {
          setTimeout(() => {
            const invoiceElement = iframeDoc.querySelector('.invoice-container');
            
            if (!invoiceElement) {
              alert('Error: Invoice content not found');
              cleanup();
              return;
            }

            const opt = {
              margin: [0, 0, 0, 0],
              filename: `${r.invoiceNo}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 1.5,
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: true,
                width: 1000,
                height: 1425,
                windowWidth: 1000
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf()
              .set(opt)
              .from(invoiceElement)
              .save()
              .then(() => {
                cleanup();
              })
              .catch((error) => {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF: ' + error.message);
                cleanup();
              });
          }, 300);
        }
      };

      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };

      if (totalImages === 0) {
        checkAndGenerate();
      } else {
        images.forEach((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            imagesLoaded++;
            checkAndGenerate();
          } else {
            img.onload = () => {
              imagesLoaded++;
              checkAndGenerate();
            };
            img.onerror = () => {
              imagesLoaded++;
              checkAndGenerate();
            };
          }
        });
      }
    };
  };

  // TakeOver Billing Invoice (with Bank Details)
  function printTakeOverInvoice(comp, c, r) {
    const bankDetailsSection = `
      <table style="margin-top:10px;">
        <tr class="bold center" style="background-color:#f0f0f0;">
          <td colspan="2">BANK DETAILS</td>
        </tr>
        <tr>
          <td><b>BANK NAME:</b></td>
          <td>${bankName || '____________'}</td>
        </tr>
      </table>
    `;

    const invoiceHTML = `
      <div class="invoice-container">
        ${getInvoiceHeader(comp, r)}
        ${getCustomerInfo(c, r, photoPreview)}
        ${bankDetailsSection}
        ${getItemsTable(r)}
        ${getTermsAndSignatures(r, signaturePreview)}
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${r.invoiceNo} - TakeOver</title>
        <style>${getInvoiceStyles()}</style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      </head>
      <body>
        <div class="no-print" style="text-align:center; margin:10px;">
          <button onclick="window.print()" style="padding:10px 20px; background:#d4a017; border:none; color:white; font-size:16px; cursor:pointer; margin-right:10px;">
            Print Invoice
          </button>
          <button onclick="downloadPDF()" style="padding:10px 20px; background:#28a745; border:none; color:white; font-size:16px; cursor:pointer;">
            Download PDF
          </button>
        </div>
        ${invoiceHTML}
        <script>
          function downloadPDF() {
            const element = document.querySelector('.invoice-container');
            const opt = {
              margin: [0, 0, 0, 0],
              filename: '${r.invoiceNo}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 1.5,
                useCORS: true,
                logging: false,
                letterRendering: true,
                allowTaint: true,
                width: 1000,
                height: 1425,
                windowWidth: 1000
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save();
          }
        </script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=1200,height=800');
    win.document.title = `TakeOver Invoice - ${r.invoiceNo}`;
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
                  <option value="Release">Release</option>
                  <option value="TakeOver">Take Over</option>
                </select>
              </div>

              {/* Conditional Fields for Release */}
              {billingType === 'Release' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        if (errors.bankName) {
                          setErrors({ ...errors, bankName: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.bankName
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-yellow-400'
                      }`}
                      placeholder="Enter Bank Name"
                    />
                    {errors.bankName && (
                      <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Release Amount *
                    </label>
                    <input
                      type="number"
                      value={renewalAmount}
                      onChange={(e) => {
                        setRenewalAmount(e.target.value);
                        if (errors.renewalAmount) {
                          setErrors({ ...errors, renewalAmount: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.renewalAmount
                          ? 'border-red-500 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-yellow-400'
                      }`}
                      placeholder="Enter Amount"
                      min="0"
                    />
                    {errors.renewalAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.renewalAmount}</p>
                    )}
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
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      if (errors.bankName) {
                        setErrors({ ...errors, bankName: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.bankName
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    placeholder="Enter Bank Name"
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
                  )}
                </div>
              )}

              {/* Multiple Items Section */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-lg font-semibold text-gray-700">Item {index + 1}</h5>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ornament Type *
                        </label>
                        <input
                          type="text"
                          value={item.ornamentType}
                          onChange={(e) => {
                            updateItem(item.id, 'ornamentType', e.target.value);
                            if (errors[`ornamentType_${item.id}`]) {
                              setErrors({ ...errors, [`ornamentType_${item.id}`]: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                            errors[`ornamentType_${item.id}`]
                              ? 'border-red-500 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-yellow-400'
                          }`}
                          placeholder="e.g. Chain, Ring"
                        />
                        {errors[`ornamentType_${item.id}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ornamentType_${item.id}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          KDM Type *
                        </label>
                        <select
                          value={item.kdmType}
                          onChange={(e) => {
                            updateItem(item.id, 'kdmType', e.target.value);
                            if (errors[`kdmType_${item.id}`]) {
                              setErrors({ ...errors, [`kdmType_${item.id}`]: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                            errors[`kdmType_${item.id}`]
                              ? 'border-red-500 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-yellow-400'
                          }`}
                        >
                          <option value="KDM">KDM</option>
                          <option value="Non KDM">Non KDM</option>
                        </select>
                        {errors[`kdmType_${item.id}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`kdmType_${item.id}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gross Weight (g) *
                        </label>
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) => {
                            updateItem(item.id, 'weight', e.target.value);
                            if (errors[`weight_${item.id}`]) {
                              setErrors({ ...errors, [`weight_${item.id}`]: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                            errors[`weight_${item.id}`]
                              ? 'border-red-500 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-yellow-400'
                          }`}
                          placeholder="0.00"
                          step="0.001"
                          min="0"
                        />
                        {errors[`weight_${item.id}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`weight_${item.id}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stone Weight (g)
                        </label>
                        <input
                          type="number"
                          value={item.stoneWeight}
                          onChange={(e) => {
                            updateItem(item.id, 'stoneWeight', e.target.value);
                            if (errors[`stoneWeight_${item.id}`]) {
                              setErrors({ ...errors, [`stoneWeight_${item.id}`]: '' });
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                            errors[`stoneWeight_${item.id}`]
                              ? 'border-red-500 focus:ring-red-400'
                              : 'border-gray-300 focus:ring-yellow-400'
                          }`}
                          placeholder="0.00"
                          step="0.001"
                          min="0"
                        />
                        {errors[`stoneWeight_${item.id}`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`stoneWeight_${item.id}`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purity
                        </label>
                        <select
                          value={item.purityIndex}
                          onChange={(e) => updateItem(item.id, 'purityIndex', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                        >
                          {PURITIES.map((p, i) => (
                            <option value={i} key={i}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {result && result.items && result.items.find(i => i.id === item.id) && (
                        <div className="md:col-span-3">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Calculated Amount:</span>
                              <span className="text-lg font-bold text-green-600">
                                ₹ {parseFloat(result.items.find(i => i.id === item.id)?.calculatedAmount || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Edit Amount (Optional)
                              </label>
                              <input
                                type="number"
                                value={item.editedAmount || ''}
                                onChange={(e) => updateItemAmount(item.id, e.target.value)}
                                onBlur={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    updateItemAmount(item.id, value);
                                  }
                                }}
                                className="w-full px-2 py-1 border border-green-300 rounded text-sm"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addItem}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-300"
                >
                  + Add Another Item
                </button>
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
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2 text-center">
                    Combined Final Payout Amount (Editable)
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600 mr-2">₹</span>
                    <input
                      type="number"
                      value={editableAmount}
                      onChange={(e) => setEditableAmount(e.target.value)}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          const rounded = Math.round(value * 100) / 100;
                          setEditableAmount(rounded.toFixed(2));
                        }
                      }}
                      className="text-3xl font-bold text-green-600 bg-transparent border-b-2 border-green-400 focus:outline-none focus:border-green-600 text-center w-48"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Total of {result.items?.length || 0} item(s)
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
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.name
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    value={customer.name}
                    onChange={(e) => {
                      setCustomer({ ...customer, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.mobile
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    value={customer.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      setCustomer({ ...customer, mobile: value });
                      if (errors.mobile) {
                        setErrors({ ...errors, mobile: '' });
                      }
                    }}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.aadhar
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    value={customer.aadhar}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      setCustomer({ ...customer, aadhar: value });
                      if (errors.aadhar) {
                        setErrors({ ...errors, aadhar: '' });
                      }
                    }}
                  />
                  {errors.aadhar && (
                    <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter PAN number (optional, e.g., ABCDE1234F)"
                    maxLength="10"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent uppercase ${
                      errors.pan
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    value={customer.pan}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Only allow alphanumeric, convert to uppercase
                      setCustomer({ ...customer, pan: value });
                      if (errors.pan) {
                        setErrors({ ...errors, pan: '' });
                      }
                    }}
                  />
                  {errors.pan && (
                    <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={customer.gender}
                    onChange={(e) => {
                      setCustomer({ ...customer, gender: e.target.value });
                      if (errors.gender) {
                        setErrors({ ...errors, gender: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.gender
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    placeholder="Enter complete address (minimum 10 characters)"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.address
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                    rows="3"
                    value={customer.address}
                    onChange={(e) => {
                      setCustomer({ ...customer, address: e.target.value });
                      if (errors.address) {
                        setErrors({ ...errors, address: '' });
                      }
                    }}
                  ></textarea>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                {/* Customer Photo Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Photo
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handlePhotoCapture}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {photoPreview && (
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={photoPreview}
                          alt="Customer"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Photo uploaded successfully</p>
                          <button
                            onClick={removePhoto}
                            className="text-red-500 hover:text-red-700 text-sm font-medium mt-1"
                          >
                            Remove Photo
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload a clear photo of the customer (max 5MB, JPG/PNG/WebP)
                    </p>
                  </div>
                </div>

                {/* Customer Signature Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Signature
                  </label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureCapture}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {signaturePreview && (
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={signaturePreview}
                          alt="Customer Signature"
                          className="w-32 h-20 object-contain rounded-lg border-2 border-gray-300 bg-white"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Signature uploaded successfully</p>
                          <button
                            type="button"
                            onClick={removeSignature}
                            className="text-red-500 hover:text-red-700 text-sm font-medium mt-1"
                          >
                            Remove Signature
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload customer signature image (max 2MB, JPG/PNG/WebP)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Save Billing Button */}
              {!isBillingSaved && (
                <div className="space-y-2">
                  {hasFormChanged() && result && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                      <p className="text-yellow-800 text-sm font-medium">⚠️ You have unsaved changes</p>
                    </div>
                  )}
                  <button
                    onClick={saveBilling}
                    disabled={isSubmitting || !result}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition duration-300 transform shadow-lg ${
                      isSubmitting || !result
                        ? 'bg-green-400 cursor-not-allowed text-white'
                        : hasFormChanged() && result
                        ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] animate-pulse'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : hasFormChanged() && result ? (
                      '💾 Save Billing'
                    ) : (
                      '✅ Billing Up to Date'
                    )}
                  </button>
                </div>
              )}

              {/* Status Message */}
              {isBillingSaved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-semibold">✅ Billing Saved Successfully!</p>
                  <p className="text-green-600 text-sm">You can now print the invoice.</p>
                </div>
              )}

              {/* Print and Cancel Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={printInvoice}
                  disabled={isSubmitting || !isBillingSaved}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition duration-300 transform shadow-lg ${
                    isSubmitting || !isBillingSaved
                      ? 'bg-blue-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'
                  }`}
                >
                  🖨️ Print Invoice
                </button>
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition duration-300 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
