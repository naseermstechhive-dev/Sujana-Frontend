import React, { useState } from 'react';
import { FaCoins, FaRupeeSign } from 'react-icons/fa';
import GoldPriceSetter from '../GoldPriceSetter';

const GoldVault = ({ billings, renewals = [], takeovers = [] }) => {
  const [goldVaultTab, setGoldVaultTab] = useState('physical');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">Gold Vault</h2>
        <div className="text-sm sm:text-base text-gray-600 font-medium">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        Manage all gold transactions: Physical sales, Bank releases, and Takeovers.
      </p>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
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
          onClick={() => setGoldVaultTab('release')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            goldVaultTab === 'release'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bank Releases
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
        <button
          onClick={() => setGoldVaultTab('prices')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            goldVaultTab === 'prices'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaRupeeSign className="inline mr-1" />
          Price Settings
        </button>
      </div>

      {/* Tab Content */}
      {goldVaultTab === 'physical' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Physical Gold Sales</h3>
          <p className="text-gray-600 mb-2">Customers coming to shop to sell their gold.</p>
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg mb-4">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Today's data resets at 4 AM. All historical data is preserved in Transactions.
            </p>
          </div>

          {/* Filter Billings for Today - Only Physical Sales (4 AM reset) */}
          {(() => {
            // Helper function to get today's start time (4 AM)
            const getTodayStart = () => {
              const now = new Date();
              const today = new Date(now);
              if (now.getHours() < 4) {
                today.setDate(today.getDate() - 1);
              }
              today.setHours(4, 0, 0, 0);
              return today;
            };
            const getTodayEnd = () => {
              const todayStart = getTodayStart();
              const todayEnd = new Date(todayStart);
              todayEnd.setDate(todayEnd.getDate() + 1);
              return todayEnd;
            };
            const todayStart = getTodayStart();
            const todayEnd = getTodayEnd();
            const todaysBillings = billings.filter(b => {
              const billingDate = new Date(b.createdAt || b.date);
              const isToday = billingDate >= todayStart && billingDate < todayEnd;
              const isPhysical = !b.billingType || b.billingType === 'Physical';
              return isToday && isPhysical;
            });

            return (
              <>
                {/* Gold Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="bg-yellow-50 p-3 md:p-4 rounded-lg border border-yellow-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-yellow-800">Today's Gross Weight</h4>
                    <p className="text-xl md:text-2xl font-bold text-yellow-600">
                      {todaysBillings
                        .reduce((acc, curr) => acc + (curr.goldDetails?.weight || 0), 0)
                        .toFixed(3)} g
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-orange-800">Today's Stone Weight</h4>
                    <p className="text-xl md:text-2xl font-bold text-orange-600">
                      {todaysBillings
                        .reduce((acc, curr) => acc + (curr.goldDetails?.stoneWeight || 0), 0)
                        .toFixed(3)} g
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-green-800">Today's Net Weight</h4>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
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
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Time</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Invoice No</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Customer</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Ornament</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Code</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Purity</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-right">Gross Wt (g)</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-right">Stone Wt (g)</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-right">Net Wt (g)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-xs md:text-sm font-light">
                        {todaysBillings.map((billing) => {
                          const gross = billing.goldDetails?.weight || 0;
                          const stone = billing.goldDetails?.stoneWeight || 0;
                          const net = gross - stone;
                          return (
                            <tr key={billing._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left whitespace-nowrap">
                                {new Date(billing.createdAt || billing.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left font-medium text-blue-600">
                                {billing.invoiceNo}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                                {billing.customer?.name}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                                <span className="bg-yellow-100 text-yellow-800 py-1 px-2 md:px-3 rounded-full text-xs">
                                  {billing.goldDetails?.ornamentType}
                                </span>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left font-mono">
                                {billing.goldDetails?.kdmType || billing.goldDetails?.ornamentCode || '-'}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                                {billing.goldDetails?.purityLabel}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-right font-bold">
                                {gross.toFixed(3)}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-right text-red-500">
                                {stone.toFixed(3)}
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-6 text-right font-bold text-green-600">
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

      {goldVaultTab === 'release' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Bank Gold Releases</h3>
          <p className="text-gray-600 mb-4">Customers with gold in bank who need release assistance.</p>

          {/* Filter Release Billings */}
          {(() => {
            const releaseBillings = billings.filter(b => b.billingType === 'Release');

            return (
              <>
                {/* Release Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-blue-800">Total Releases</h4>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{releaseBillings.length}</p>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-green-800">Total Commission</h4>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      ₹{releaseBillings.reduce((acc, r) => acc + (r.commissionAmount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 md:p-4 rounded-lg border border-purple-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-purple-800">Total Gold Weight</h4>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                      {releaseBillings.reduce((acc, r) => acc + (r.goldDetails?.weight || 0), 0).toFixed(3)} g
                    </p>
                  </div>
                </div>

                {/* Releases Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-semibold text-lg text-gray-700">Release Transactions</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Date</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Invoice No</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Customer</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Bank</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Release Amount</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Commission</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-right">Gold Weight (g)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-xs md:text-sm font-light">
                        {releaseBillings.map((billing) => (
                          <tr key={billing._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left whitespace-nowrap">
                              {new Date(billing.createdAt || billing.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left font-medium text-blue-600">
                              {billing.invoiceNo}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                              {billing.customer?.name}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                              {billing.bankName || '-'}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left font-bold">
                              ₹{(billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left text-green-600 font-bold">
                              ₹{(billing.commissionAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-right font-bold">
                              {(billing.goldDetails?.weight || 0).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {releaseBillings.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No release transactions found.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {goldVaultTab === 'takeover' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Gold Takeovers</h3>
          <p className="text-gray-600 mb-4">Take over gold from banks/other parties at today's rates.</p>

          {/* Filter TakeOver Billings */}
          {(() => {
            const takeoverBillings = billings.filter(b => b.billingType === 'TakeOver');

            return (
              <>
                {/* Takeover Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="bg-red-50 p-3 md:p-4 rounded-lg border border-red-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-red-800">Total Takeovers</h4>
                    <p className="text-xl md:text-2xl font-bold text-red-600">{takeoverBillings.length}</p>
                  </div>
                  <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-orange-800">Total Takeover Amount</h4>
                    <p className="text-xl md:text-2xl font-bold text-orange-600">
                      ₹{takeoverBillings.reduce((acc, t) => acc + (t.calculation?.editedAmount || t.calculation?.finalPayout || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-3 md:p-4 rounded-lg border border-indigo-200 shadow-sm">
                    <h4 className="font-semibold text-sm md:text-base text-indigo-800">Total Gold Weight</h4>
                    <p className="text-xl md:text-2xl font-bold text-indigo-600">
                      {takeoverBillings.reduce((acc, t) => acc + (t.goldDetails?.weight || 0), 0).toFixed(3)} g
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
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xs md:text-sm leading-normal">
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Date</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Invoice No</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Customer</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Bank</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-left">Takeover Amount</th>
                          <th className="py-2 md:py-3 px-2 md:px-6 text-right">Gold Weight (g)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-xs md:text-sm font-light">
                        {takeoverBillings.map((billing) => (
                          <tr key={billing._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left whitespace-nowrap">
                              {new Date(billing.createdAt || billing.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left font-medium text-blue-600">
                              {billing.invoiceNo}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                              {billing.customer?.name}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left">
                              {billing.bankName || '-'}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-left font-bold">
                              ₹{(billing.calculation?.editedAmount || billing.calculation?.finalPayout || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-6 text-right font-bold">
                              {(billing.goldDetails?.weight || 0).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {takeoverBillings.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      No takeover transactions found.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {goldVaultTab === 'prices' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Gold Price Settings</h3>
          <p className="text-gray-600 mb-4">Set and manage gold prices for different purity levels. These prices will be used throughout the system for calculations and billings.</p>

          <GoldPriceSetter />
        </div>
      )}
    </div>
  );
};

export default GoldVault;