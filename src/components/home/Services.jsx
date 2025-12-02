import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaWeight, 
  FaCalculator, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaHandshake
} from 'react-icons/fa';

const Services = () => {
  const processSteps = [
    {
      step: 1,
      icon: <FaSearch className="text-2xl" />,
      title: "Visit Our Store",
      description: "Bring your gold items to our store. Our expert team will welcome you and guide you through the process.",
      color: "from-blue-500 to-blue-600"
    },
    {
      step: 2,
      icon: <FaWeight className="text-2xl" />,
      title: "Gold Evaluation",
      description: "We weigh your gold and test its purity using advanced equipment. Get accurate assessment in minutes.",
      color: "from-purple-500 to-purple-600"
    },
    {
      step: 3,
      icon: <FaCalculator className="text-2xl" />,
      title: "Price Calculation",
      description: "Based on current market rates and purity, we calculate the exact value of your gold transparently.",
      color: "from-green-500 to-green-600"
    },
    {
      step: 4,
      icon: <FaMoneyBillWave className="text-2xl" />,
      title: "Instant Payment",
      description: "Receive cash payment immediately. No waiting, no delays - your money in your hand right away.",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  const benefits = [
    {
      icon: <FaCheckCircle className="text-2xl" />,
      title: "No Hidden Charges",
      description: "100% transparent pricing with all deductions clearly explained upfront"
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: "Quick Process",
      description: "Complete your transaction in just 15-20 minutes from start to finish"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Secure & Safe",
      description: "Your gold is handled with utmost care and security throughout the process"
    },
    {
      icon: <FaHandshake className="text-2xl" />,
      title: "Fair Pricing",
      description: "Get the best market rates based on real-time gold prices and purity levels"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-yellow-50/30 to-white">
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
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It <span className="text-yellow-600">Works</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Selling your gold is quick and easy. Follow these simple steps to get instant cash for your gold items.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative mb-20">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-yellow-500 opacity-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-bold text-lg shadow-lg`}>
                    {item.step}
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 pt-12 hover:shadow-2xl transition-all duration-300 border-t-4 border-transparent hover:border-yellow-500">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} text-white mb-6`}>
                    {item.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Process?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:border-yellow-400 transition-all duration-300"
              >
                <div className="text-yellow-600 mb-4">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Sell Your Gold?
              </h3>
              <p className="text-yellow-100 mb-8 text-lg max-w-2xl mx-auto">
                Get instant cash for your gold today. Visit our store or use our online calculator to estimate your gold's value.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-yellow-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
                >
                  Visit Our Store
                </Link>
                <Link
                  to="/calculator"
                  className="bg-yellow-700 text-white px-8 py-4 rounded-full font-bold hover:bg-yellow-800 transition-colors shadow-lg transform hover:scale-105"
                >
                  Calculate Gold Value
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;