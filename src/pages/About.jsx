import React from 'react';

const About = () => {
  const companyData = {
    companyName: "Sujana Gold Company",
    category: "Gold Buyers & Gold Loan Services",
    establishedYear: 2005,
    businessYears: 21,
    location: {
      address: "Opp Apsara Theatre, Apsara Cir Road, Kadapa, Andhra Pradesh, 516001",
      city: "Kadapa",
      state: "Andhra Pradesh"
    },
    services: [
      "Spot Cash for Gold",
      "Gold Loan Take Over",
      "Release Pledged Gold",
      "Second Hand Gold Jewellery Buying",
      "Gold Scrap Buying (broken jewellery, dental gold, gold-plated items)",
      "Instant Quotes for Jewellery"
    ],

    operatingHours: {
      mondayToSaturday: "10:00 AM - 7:00 PM",
      sunday: "Closed"
    },
    customerRequirements: [
      "Valid ID proof",
      "Proof of ownership for gold items"
    ],
    languages: ["Telugu", "English"],
    ratings: {
      average: 4.94,
      source: "JustDial",
      totalReviews: 100
    },
    offerings: [
      "Cash for gold jewellery",
      "Gold exchange",
      "Promotions during festive and wedding seasons"
    ],
    customerService: {
      transparency: true,
      convenience: true,
      security: true
    },
    notes: [
      "Best deals and spot cash for jewellery",
      "Active during local festive and wedding seasons",
      "Contact directly for latest rates and offers"
    ]
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-yellow-400">Sujana Gold</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your trusted gold buying and loan service partner in Kadapa for over {companyData.businessYears} years.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our <span className="text-yellow-500">Story</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in {companyData.establishedYear}, Sujana Gold Company has been serving the community
                  of Kadapa with integrity and professionalism for {companyData.businessYears} years.
                </p>
                <p>
                  We specialize in gold buying, loan services, and providing instant cash for gold jewelry
                  with the best market rates. Our commitment to transparency and customer satisfaction
                  has earned us a stellar reputation in the community.
                </p>
                <p>
                  Located conveniently opposite Apsara Theatre on Apsara Circle Road, we serve customers
                  from all walks of life with respect and fairness.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">{companyData.businessYears}+</div>
                  <div className="text-gray-600">Years of Service</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500">{companyData.ratings.average}</div>
                  <div className="text-gray-600">Customer Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                {companyData.notes.map((note, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">•</span>
                    <span className="text-gray-700">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-yellow-500">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive gold-related services tailored to meet your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyData.services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex items-center mb-3">
                  <div className="bg-yellow-400 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Operating <span className="text-yellow-500">Hours</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              When you can visit us for our services.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Monday - Saturday</span>
                  <span className="text-gray-700">{companyData.operatingHours.mondayToSaturday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Sunday</span>
                  <span className="text-gray-700">{companyData.operatingHours.sunday}</span>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-3">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.languages.map((lang, index) => (
                    <span key={index} className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Requirements */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You <span className="text-yellow-400">Need</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Simple requirements to ensure smooth and secure transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {companyData.customerRequirements.map((req, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-yellow-400 rounded-full p-3 mr-4">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">{req}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-yellow-500">Commitment</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are dedicated to providing the best service with integrity and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-l-4 border-yellow-400">
              <div className="mb-4">
                <div className="bg-yellow-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                  <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-gray-600 text-sm">
                All transactions are conducted with the highest security standards and confidentiality.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-l-4 border-yellow-400">
              <div className="mb-4">
                <div className="bg-yellow-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                  <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600 text-sm">
                Competitive market rates with transparent pricing and no hidden charges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-l-4 border-yellow-400">
              <div className="mb-4">
                <div className="bg-yellow-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                  <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Service</h3>
              <p className="text-gray-600 text-sm">
                Fast evaluation and instant cash payment to meet your urgent financial needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 border-l-4 border-yellow-400">
              <div className="mb-4">
                <div className="bg-yellow-100 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                  <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Care</h3>
              <p className="text-gray-600 text-sm">
                Dedicated support and personalized service to ensure your complete satisfaction.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trusted by Thousands
              </h3>
              <p className="text-gray-600 mb-6">
                With over {companyData.businessYears} years of experience and {companyData.ratings.totalReviews}+ satisfied customers, 
                we have built a reputation for reliability and excellence in the gold trading industry.
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-700 font-semibold ml-2">
                  {companyData.ratings.average} / 5.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;