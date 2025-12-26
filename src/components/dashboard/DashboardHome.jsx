import React from 'react';
import { FaCoins, FaMoneyBillWave, FaFileInvoice, FaUsers } from 'react-icons/fa';

const DashboardHome = ({ setActiveItem }) => {
  return (
    <div className="text-center py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg inline-block mb-6 md:mb-8">
          <img
            src="/images/Sujana-Gold-Logo.jpeg"
            alt="Sujana Gold Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6">
          Welcome to Sujana Gold Dashboard
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
          Your comprehensive gold trading management system for efficient operations and business growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-6 md:p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setActiveItem('Gold Vault')}>
          <FaCoins className="text-3xl md:text-4xl mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Gold Vault</h3>
          <p className="text-xs md:text-sm opacity-90 leading-relaxed">Manage physical sales, renewals, and takeovers</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 md:p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setActiveItem('Cash Vault')}>
          <FaMoneyBillWave className="text-3xl md:text-4xl mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Cash Management</h3>
          <p className="text-xs md:text-sm opacity-90 leading-relaxed">Track cash flow and margins</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-6 md:p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setActiveItem('User Vault')}>
          <FaFileInvoice className="text-3xl md:text-4xl mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Billing History</h3>
          <p className="text-xs md:text-sm opacity-90 leading-relaxed">View and manage all transactions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6 md:p-8 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setActiveItem('Employee Management')}>
          <FaUsers className="text-3xl md:text-4xl mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Employee Management</h3>
          <p className="text-xs md:text-sm opacity-90 leading-relaxed">Manage your team</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 md:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <button
            onClick={() => setActiveItem('Analytics')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveItem('Gold Vault')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            🪙 Gold Vault
          </button>
          <button
            onClick={() => setActiveItem('Cash Vault')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            💰 Cash Vault
          </button>
          <button
            onClick={() => setActiveItem('User Vault')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            📄 User Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;