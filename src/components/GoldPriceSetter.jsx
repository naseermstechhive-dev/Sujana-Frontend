import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const GoldPriceSetter = () => {
  const { goldPrices, updateGoldPrices } = useAdmin();
  const [prices, setPrices] = useState(goldPrices);

  const handlePriceChange = (purity, value) => {
    const numValue = value === '' ? 0 : Number(value);
    setPrices(prev => ({
      ...prev,
      [purity]: numValue
    }));
  };

  const handleSave = () => {
    updateGoldPrices(prices);
    alert('Gold prices updated successfully!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Set Gold Prices (₹ per gram)</h2>

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
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition duration-300"
        >
          Save Prices
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