import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, cashAPI, billingAPI, renewalAPI, takeoverAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHome from '../components/dashboard/DashboardHome';
import GoldVault from '../components/dashboard/GoldVault';
import CashVault from '../components/dashboard/CashVault';
import UserVault from '../components/dashboard/UserVault';
import EmployeeManagement from '../components/dashboard/EmployeeManagement';
import Analytics from '../components/dashboard/Analytics';
import ExpenseTracker from '../components/dashboard/ExpenseTracker';
import { FaCoins, FaMoneyBillWave, FaFileInvoice, FaUsers, FaSignOutAlt, FaBars, FaChartBar, FaCreditCard } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cashEntries, setCashEntries] = useState([]);
  const [cashAmount, setCashAmount] = useState('');
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [takeovers, setTakeovers] = useState([]);
  const [company, setCompany] = useState(null);
  const [marginData, setMarginData] = useState(null);
  const [dailyTransactions, setDailyTransactions] = useState(null);
  const [hasInitialCash, setHasInitialCash] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getAllBillings();
      if (response.success) {
        setBillings(response.data);
        setFilteredBillings(response.data);
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
      alert('Failed to load billings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRenewals = async () => {
    try {
      const response = await renewalAPI.getAllRenewals();
      if (response.success) {
        setRenewals(response.data);
      }
    } catch (error) {
      console.error('Error fetching renewals:', error);
    }
  };

  const fetchTakeovers = async () => {
    try {
      const response = await takeoverAPI.getAllTakeovers();
      if (response.success) {
        setTakeovers(response.data);
      }
    } catch (error) {
      console.error('Error fetching takeovers:', error);
    }
  };

  const checkInitialCashStatus = async () => {
    try {
      const response = await cashAPI.checkInitialCashExists();
      if (response.success) {
        setHasInitialCash(response.hasInitialCash);
      }
    } catch (error) {
      console.error('Error checking initial cash:', error);
    }
  };

  const fetchMargin = async () => {
    try {
      const response = await cashAPI.getMargin();
      if (response.success) {
        setMarginData(response.data);
      }
    } catch (error) {
      console.error('Error fetching margin:', error);
      alert('Failed to fetch margin data');
    }
  };

  const fetchDailyTransactions = async () => {
    try {
      const response = await billingAPI.getDailyTransactions();
      if (response.success) {
        setDailyTransactions(response.data);
      }
    } catch (error) {
      console.error('Error fetching daily transactions:', error);
      alert('Failed to fetch daily transactions');
    }
  };

  const resetInitialCash = async () => {
    if (!window.confirm('Are you sure you want to reset initial cash? This will allow employees to add new initial cash.')) {
      return;
    }

    try {
      const response = await cashAPI.resetInitialCash();
      if (response.success) {
        alert('Initial cash reset successfully');
        setHasInitialCash(false);
        fetchCashVault();
      }
    } catch (error) {
      alert('Failed to reset initial cash: ' + error.message);
    }
  };

  const resetGoldTransactions = async () => {
    if (!window.confirm('Are you sure you want to reset ALL gold transactions? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await billingAPI.resetGoldTransactions();
      if (response.success) {
        alert('All gold transactions reset successfully');
        fetchBillings();
        fetchRenewals();
        fetchTakeovers();
        fetchCashVault();
      }
    } catch (error) {
      alert('Failed to reset gold transactions: ' + error.message);
    }
  };




  const loadCompany = async () => {
    try {
      const res = await fetch('/data/data.json');
      const json = await res.json();
      setCompany(json);
    } catch (e) {
      console.warn('Company load error', e);
    }
  };

  const menuItems = [
    {
      title: 'Analytics',
      icon: <FaChartBar />,
      content: <Analytics billings={billings} renewals={renewals} takeovers={takeovers} cashEntries={cashEntries} />,
    },
    {
      title: 'Gold Vault',
      icon: <FaCoins />,
      content: <GoldVault billings={billings} renewals={renewals} takeovers={takeovers} />,
    },
    {
      title: 'Cash Vault',
      icon: <FaMoneyBillWave />,
      content: (
        <CashVault
          user={user}
          cashEntries={cashEntries}
          cashAmount={cashAmount}
          setCashAmount={setCashAmount}
          fetchCashVault={fetchCashVault}
          checkInitialCashStatus={checkInitialCashStatus}
          hasInitialCash={hasInitialCash}
          marginData={marginData}
          fetchMargin={fetchMargin}
          dailyTransactions={dailyTransactions}
          fetchDailyTransactions={fetchDailyTransactions}
          resetInitialCash={resetInitialCash}
          resetGoldTransactions={resetGoldTransactions}
        />
      ),
    },
    {
      title: 'Expense Tracker',
      icon: <FaCreditCard />,
      content: <ExpenseTracker cashEntries={cashEntries} />,
    },
    {
      title: 'User Vault',
      icon: <FaFileInvoice />,
      content: (
        <UserVault
          billings={billings}
          filteredBillings={filteredBillings}
          setFilteredBillings={setFilteredBillings}
          loading={loading}
          company={company}
        />
      ),
    },
    {
      title: 'Employee Management',
      icon: <FaUsers />,
      content: (
        <EmployeeManagement
          user={user}
          employees={employees}
          setEmployees={setEmployees}
          loading={loading}
        />
      ),
    },
    { title: 'Sign Out', icon: <FaSignOutAlt />, action: logout },
  ];

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      fetchEmployees();
      fetchCashVault();
      fetchBillings();
      fetchRenewals();
      fetchTakeovers();
      checkInitialCashStatus();
      loadCompany();
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}></div>
          <Sidebar
            open={true}
            setOpen={() => {}}
            menuItems={menuItems}
            activeItem={activeItem}
            setActiveItem={(item) => { setActiveItem(item); setMobileOpen(false); }}
            isMobile={true}
          />
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            open={open}
            setOpen={setOpen}
            menuItems={menuItems}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 transition-all duration-300">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600">
              Manage your gold trading operations from this admin dashboard.
            </p>
          </div>

          <div className="bg-white w-full h-[75vh] md:h-[78vh] rounded-2xl shadow-lg p-4 md:p-8 overflow-y-auto">
            {activeItem === '' ? (
              <DashboardHome setActiveItem={setActiveItem} />
            ) : (
              menuItems.find((item) => item.title === activeItem)?.content
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
