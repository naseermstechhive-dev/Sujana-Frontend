import React from 'react';

const FlashMessage = () => {
  const messages = [
    "🎉 Festival Season Special: Extra 2% bonus on gold rates!",
    "💰 Instant Cash: Get your gold evaluated and paid within minutes",
    "⭐ Top Rated: 4.94/5 stars from 100+ satisfied customers"
  ];

  return (
    <section className="bg-yellow-400 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4 text-black font-medium">
            <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="text-sm md:text-base">
              {messages[Math.floor(Math.random() * messages.length)]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashMessage;