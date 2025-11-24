import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [goldPrices, setGoldPrices] = useState({
    '24K': 0,
    '22K': 0,
    '20K': 0,
    '18K': 0,
  });

  useEffect(() => {
    // Load login status from localStorage
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    // Load gold prices from localStorage
    const savedPrices = localStorage.getItem('goldPrices');
    if (savedPrices) {
      setGoldPrices(JSON.parse(savedPrices));
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const updateGoldPrices = (newPrices) => {
    setGoldPrices(newPrices);
    localStorage.setItem('goldPrices', JSON.stringify(newPrices));
  };

  return (
    <AdminContext.Provider value={{
      isLoggedIn,
      goldPrices,
      login,
      logout,
      updateGoldPrices,
    }}>
      {children}
    </AdminContext.Provider>
  );
};