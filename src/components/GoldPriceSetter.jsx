import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const GoldPriceSetter = () => {
  const { goldPrices, updateGoldPrices, loadingPrices } = useAdmin();
  const [prices, setPrices] = useState(goldPrices);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Sync prices when goldPrices from context changes
  useEffect(() => {
    if (goldPrices && !loadingPrices) {
      setPrices(goldPrices);
    }
  }, [goldPrices, loadingPrices]);

  const handlePriceChange = (purity, value) => {
    const numValue = value === '' ? 0 : Number(value);
    setPrices(prev => ({
      ...prev,
      [purity]: numValue
    }));
    // Clear previous messages when user makes changes
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateGoldPrices(prices);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update gold prices. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPrices) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading gold prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Set Gold Prices (₹ per gram)</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          Gold prices updated successfully! Changes are now saved to the database and will be available on all devices.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(prices).map(([purity, price]) => (
          <div key={purity} className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {purity} Gold Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(purity, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              min="0"
              step="0.01"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: ₹{price}/gram
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Prices'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Note:</h3>
        <p className="text-blue-700 text-sm">
          These prices will be used for all gold calculations in the billing system.
          The system applies a deduction of ₹400 per gram on the net weight for final payout calculation.
        </p>
      </div>
    </div>
  );
};

export default GoldPriceSetter;