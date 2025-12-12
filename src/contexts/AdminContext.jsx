import React, { createContext, useContext, useState, useEffect } from 'react';
import { goldPriceAPI } from '../services/api';

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
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    // Load login status from localStorage
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    // Fetch gold prices from backend
    const fetchGoldPrices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await goldPriceAPI.getGoldPrices();
          if (response.success && response.data) {
            setGoldPrices(response.data);
            // Also save to localStorage as cache
            localStorage.setItem('goldPrices', JSON.stringify(response.data));
          }
        } else {
          // If no token, try loading from localStorage as fallback
          const savedPrices = localStorage.getItem('goldPrices');
          if (savedPrices) {
            setGoldPrices(JSON.parse(savedPrices));
          }
        }
      } catch (error) {
        console.error('Error fetching gold prices:', error);
        // Fallback to localStorage if backend fails
        const savedPrices = localStorage.getItem('goldPrices');
        if (savedPrices) {
          setGoldPrices(JSON.parse(savedPrices));
        }
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchGoldPrices();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
    // Fetch gold prices after login
    const fetchGoldPrices = async () => {
      try {
        const response = await goldPriceAPI.getGoldPrices();
        if (response.success && response.data) {
          setGoldPrices(response.data);
          localStorage.setItem('goldPrices', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching gold prices after login:', error);
      }
    };
    fetchGoldPrices();
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const updateGoldPrices = async (newPrices) => {
    try {
      // Update backend first
      const response = await goldPriceAPI.updateGoldPrices(newPrices);
      if (response.success && response.data) {
        setGoldPrices(response.data);
        // Also save to localStorage as cache
        localStorage.setItem('goldPrices', JSON.stringify(response.data));
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Failed to update gold prices');
      }
    } catch (error) {
      console.error('Error updating gold prices:', error);
      // Fallback: update local state and localStorage
      setGoldPrices(newPrices);
      localStorage.setItem('goldPrices', JSON.stringify(newPrices));
      throw error;
    }
  };

  return (
    <AdminContext.Provider value={{
      isLoggedIn,
      goldPrices,
      loadingPrices,
      login,
      logout,
      updateGoldPrices,
    }}>
      {children}
    </AdminContext.Provider>
  );
};