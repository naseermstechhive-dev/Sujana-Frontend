import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin123@gmail.com' && password === 'admin@123') {
      onLogin();
      onClose();
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glassmorphism Backdrop */}
      <div
        className="absolute inset-0 bg-white/10 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-md relative z-10 overflow-hidden shadow-yellow-500/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <img
                src="/images/Sujana-Gold-Logo.jpeg"
                alt="Sujana Gold Logo"
                className="h-12 w-12 object-contain rounded-lg bg-white bg-opacity-20 p-1"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                <p className="text-yellow-100 text-sm">Access admin dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 bg-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="admin@example.com"
                  required
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}


            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition duration-200 transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;