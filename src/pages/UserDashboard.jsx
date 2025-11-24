import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cashAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cashEntries, setCashEntries] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCashVault = async () => {
    try {
      const response = await cashAPI.getCashVault();
      if (response.success) {
        setCashEntries(response.data);
      }
    } catch (error) {
      console.error('Error fetching cash vault:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCashVault();
    }
  }, [user]);

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-700">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Gold Calculator</h2>
              <p className="text-gray-600">Calculate gold prices and weights</p>
              <button
                onClick={() => navigate('/calculator')}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Open Calculator
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">User Vault</h2>
              <p className="text-gray-600">View your billing history and print invoices</p>
              <button
                onClick={() => navigate('/user-vault')}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                View Vault
              </button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
              <p className="text-gray-600">Get help with your orders</p>
              <button
                onClick={() => navigate('/contact')}
                className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Contact Us
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">About Us</h2>
              <p className="text-gray-600">Learn more about Sujana Gold</p>
              <button
                onClick={() => navigate('/about')}
                className="mt-2 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Cash Vault Section for Employees */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Cash Vault Management
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">
                  Add Remaining Cash
                </h3>
                <form
                  className="flex gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setLoading(true);
                      await cashAPI.addRemainingCash(remainingAmount);
                      setRemainingAmount('');
                      fetchCashVault();
                      alert('Remaining cash added successfully!');
                    } catch (error) {
                      alert(error.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <input
                    type="number"
                    placeholder="Amount"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Entry'}
                  </button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">My Entries</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Date
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Type
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="border border-gray-300 px-4 py-4 text-center text-gray-500"
                          >
                            No entries found.
                          </td>
                        </tr>
                      ) : (
                        cashEntries.map((entry) => (
                          <tr key={entry._id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">
                              {new Date(entry.createdAt).toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 capitalize">
                              {entry.type}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 font-bold">
                              ₹{entry.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
