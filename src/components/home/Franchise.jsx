import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHandshake, FaChartLine, FaUsers, FaShieldAlt, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Franchise = () => {
  const benefits = [
    {
      icon: <FaChartLine className="text-3xl text-green-500" />,
      title: "High Profit Margins",
      description: "Enjoy competitive profit margins with our established business model and bulk purchasing power."
    },
    {
      icon: <FaUsers className="text-3xl text-blue-500" />,
      title: "Expert Training",
      description: "Comprehensive training programs for you and your staff in gold evaluation, customer service, and operations."
    },
    {
      icon: <FaShieldAlt className="text-3xl text-purple-500" />,
      title: "Brand Reputation",
      description: "Leverage our 21+ years of trust and reputation in the gold trading industry."
    },
    {
      icon: <FaHandshake className="text-3xl text-orange-500" />,
      title: "Ongoing Support",
      description: "Continuous marketing support, operational guidance, and access to our expert team."
    }
  ];

  const requirements = [
    "Investment range: ₹5 Lakhs - ₹10 Lakhs",
    "Location: 1000-2000 sq ft commercial space",
    "Local market knowledge",
    "Commitment to ethical business practices"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 border border-yellow-500/30 rounded-full bg-yellow-500/5 backdrop-blur-sm mb-6">
            <span className="text-yellow-600 text-sm font-medium tracking-widest uppercase">
              Franchise Opportunity
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join the <span className="text-yellow-600">Sujana Gold</span> Family
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Become part of India's most trusted gold trading network. Start your own successful business
            with our proven franchise model and comprehensive support system.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">10+</div>
            <div className="text-sm text-gray-600">Franchise Partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">₹50 Lakhs+</div>
            <div className="text-sm text-gray-600">Combined Turnover</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">98%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Franchise?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">Franchise Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">{req}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Franchise Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Application", desc: "Submit your application with business details" },
              { step: "02", title: "Evaluation", desc: "Our team evaluates your location and investment" },
              { step: "03", title: "Agreement", desc: "Sign franchise agreement and complete setup" },
              { step: "04", title: "Launch", desc: "Grand opening with full marketing support" }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{process.title}</h4>
                <p className="text-gray-600">{process.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Success Story?</h3>
            <p className="text-yellow-100 mb-8 text-lg">
              Join thousands of successful franchise partners across India
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="bg-white text-yellow-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Apply for Franchise
              </Link>
              <div className="flex items-center gap-2 text-yellow-100">
                <FaPhone />
                <span>Call us: +91 6303060488</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Franchise;