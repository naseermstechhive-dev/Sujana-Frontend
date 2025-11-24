import React, { createContext, useContext, useState } from 'react';

const CalculatorContext = createContext();

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

export const CalculatorProvider = ({ children }) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const openCalculator = () => setIsCalculatorOpen(true);
  const closeCalculator = () => setIsCalculatorOpen(false);
  const toggleCalculator = () => setIsCalculatorOpen(!isCalculatorOpen);

  return (
    <CalculatorContext.Provider
      value={{
        isCalculatorOpen,
        openCalculator,
        closeCalculator,
        toggleCalculator,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};