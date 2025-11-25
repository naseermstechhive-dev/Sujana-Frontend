import React from 'react';
import { FaCoins, FaMoneyBillWave, FaFileInvoice, FaUsers } from 'react-icons/fa';

const DashboardHome = ({ setActiveItem }) => {
  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-lg inline-block mb-8">
          <img
            src="/images/Sujana-Gold-Logo.jpeg"
            alt="Sujana Gold Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome to Sujana Gold Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Your comprehensive gold trading management system for efficient operations and business growth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <FaCoins className="text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-3">Gold Vault</h3>
          <p className="text-sm opacity-90 leading-relaxed">Manage physical sales, renewals, and takeovers</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <FaMoneyBillWave className="text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-3">Cash Management</h3>
          <p className="text-sm opacity-90 leading-relaxed">Track cash flow and margins</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <FaFileInvoice className="text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-3">Billing History</h3>
          <p className="text-sm opacity-90 leading-relaxed">View and manage all transactions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-8 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <FaUsers className="text-4xl mb-4" />
          <h3 className="text-xl font-bold mb-3">Employee Management</h3>
          <p className="text-sm opacity-90 leading-relaxed">Manage your team</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <button
            onClick={() => setActiveItem('Gold Vault')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Gold Vault
          </button>
          <button
            onClick={() => setActiveItem('Cash Volt')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Manage Cash
          </button>
          <button
            onClick={() => setActiveItem('User Vault')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Billings
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;