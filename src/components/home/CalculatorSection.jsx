import React from 'react';
import GoldCalculator from '../GoldCalculator';

const CalculatorSection = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Gold <span className="text-yellow-500">Calculator</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate your gold's value instantly with live market rates and our transparent pricing.
          </p>
        </div>

        <div className="flex justify-center">
          <GoldCalculator />
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;