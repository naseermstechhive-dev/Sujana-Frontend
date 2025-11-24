const API_BASE_URL = 'https://sujana-backend-1.onrender.com/api';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const authAPI = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminLogin: (email, password) =>
    apiRequest('/auth/admin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name, email, password, role = 'employee') =>
    apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  createEmployee: (name, email, password) =>
    apiRequest('/auth/create-employee', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getEmployees: () => apiRequest('/auth/employees'),

  deleteEmployee: (id) =>
    apiRequest(`/auth/employees/${id}`, {
      method: 'DELETE',
    }),
};

export const cashAPI = {
  addCash: (amount) =>
    apiRequest('/cash/add', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  addRemainingCash: (amount) =>
    apiRequest('/cash/remaining', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  getCashVault: () => apiRequest('/cash'),
};

export const billingAPI = {
  createBilling: (billingData) =>
    apiRequest('/billing/create', {
      method: 'POST',
      body: JSON.stringify(billingData),
    }),

  getUserBillings: () => apiRequest('/billing/user'),

  getAllBillings: () => apiRequest('/billing/all'),

  deleteBilling: (id) =>
    apiRequest(`/billing/${id}`, {
      method: 'DELETE',
    }),

  calculateRenewal: (percentage, amount) =>
    apiRequest('/billing/calculate-renewal', {
      method: 'POST',
      body: JSON.stringify({ percentage, amount }),
    }),

  getNextInvoice: () => apiRequest('/billing/next-invoice'),
};

export default apiRequest;
