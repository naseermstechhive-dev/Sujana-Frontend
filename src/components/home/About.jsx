import React from 'react';

const About = () => {
  const companyData = {
    businessYears: 21,
    ratings: {
      average: 4.94,
      source: 'JustDial',
      totalReviews: 100,
    },
    customerService: {
      transparency: true,
      convenience: true,
      security: true,
    },
  };

  const features = [
    {
      title: 'Transparency',
      description: 'Clear pricing with no hidden charges or deductions.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Instant Cash',
      description: 'Get spot cash payments immediately after evaluation.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      title: 'Customer First',
      description: `Rated ${companyData.ratings.average} stars with ${companyData.ratings.totalReviews}+ happy customers.`,
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
  ];

  return (
    <section className="py-16 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-yellow-400">Sujana Gold</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We prioritize transparency, customer satisfaction, and competitive
            pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-yellow-400 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-8 bg-gray-800 px-8 py-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {companyData.businessYears}+
              </div>
              <div className="text-sm text-gray-300">Years of Service</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {companyData.ratings.average}
              </div>
              <div className="text-sm text-gray-300">Customer Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {companyData.ratings.totalReviews}+
              </div>
              <div className="text-sm text-gray-300">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
