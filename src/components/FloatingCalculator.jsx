import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import GoldCalculator from './GoldCalculator';

const FloatingCalculator = () => {
  const { isCalculatorOpen, toggleCalculator } = useCalculator();

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleCalculator}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black p-4 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-110 animate-pulse"
          aria-label="Open Gold Calculator"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Modal Overlay */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={toggleCalculator}
          ></div>

          {/* Calculator Modal */}
          <div className="relative bg-white border-2 border-yellow-400 rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-yellow-400 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="bg-black p-2 rounded-lg">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Gold Calculator</h3>
                  <p className="text-sm text-gray-700">Instant price calculation</p>
                </div>
              </div>
              <button
                onClick={toggleCalculator}
                className="text-gray-600 hover:text-black transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Calculator Content */}
            <div className="p-6 bg-gray-50">
              <GoldCalculator />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator;