

const Contact = () => {
  const companyData = {
    companyName: "Sujana Gold Company",
    location: {
      address: "Opp Apsara Theatre, Apsara Cir Road, Kadapa, Andhra Pradesh, 516001",
      city: "Kadapa",
      state: "Andhra Pradesh",
      pincode: "516001"
    },
    contact: {
      phone: ["6303060488", "9010330078"]
    },
    operatingHours: {
      mondayToSaturday: "10:00 AM - 7:00 PM",
      sunday: "Closed"
    },
    socialMedia: {
      instagram: "@sujanagoldcompany",
      facebook: "Sujana Gold Company"
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact <span className="text-yellow-400">Us</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with us for instant quotes, gold buying, or any inquiries about our services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Get In <span className="text-yellow-500">Touch</span>
              </h2>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-3 mr-4">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Location</h3>
                    <p className="text-gray-600">{companyData.location.address}</p>
                    <p className="text-gray-600">{companyData.location.city}, {companyData.location.state} - {companyData.location.pincode}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-3 mr-4">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Numbers</h3>
                    {companyData.contact.phone.map((phone, index) => (
                      <p key={index} className="text-gray-600">
                        <a href={`tel:${phone}`} className="hover:text-yellow-500 transition duration-300">
                          {phone}
                        </a>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-3 mr-4">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h3>
                    <div className="text-gray-600">
                      <p><span className="font-medium">Monday - Saturday:</span> {companyData.operatingHours.mondayToSaturday}</p>
                      <p><span className="font-medium">Sunday:</span> {companyData.operatingHours.sunday}</p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-3 mr-4">
                    <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a
                        href={`https://instagram.com/${companyData.socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-yellow-500 transition duration-300"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a
                        href={`https://facebook.com/${companyData.socialMedia.facebook.replace(' ', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-yellow-500 transition duration-300"
                      >
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Locate Us - Map */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Locate <span className="text-yellow-500">Us</span>
              </h2>

              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(companyData.location.address)}&output=embed`}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>

              <div className="mt-4 text-center">
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(companyData.location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300"
                >
                  Get Directions
                </a>
              </div>

              <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
                <p className="text-gray-700 mb-4">
                  For instant quotes and appointments, call us directly. We're here to help you with all your gold-related needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {companyData.contact.phone.map((phone, index) => (
                    <a
                      key={index}
                      href={`tel:${phone}`}
                      className="bg-black text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-gray-800 transition duration-300"
                    >
                      Call {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get the Best <span className="text-yellow-400">Gold Rates</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Contact us today for instant quotes and transparent gold buying services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${companyData.contact.phone[0]}`}
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-500 transition duration-300"
            >
              Call Now: {companyData.contact.phone[0]}
            </a>
            <button className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 hover:text-black transition duration-300">
              Get Quote Online
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;