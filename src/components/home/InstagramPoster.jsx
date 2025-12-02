import React from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaPlay, FaArrowRight } from 'react-icons/fa';

const InstagramPoster = () => {
  const reels = [
    {
      id: 'DRcGN4iE3y_',
      url: 'https://www.instagram.com/reel/DRcGN4iE3y_/?igsh=bTB6bHM5bnV6Mndl',
      title: 'Gold Trading Process',
      description: 'See how we evaluate and buy gold'
    },
    {
      id: 'DRJA-W7iQxX',
      url: 'https://www.instagram.com/reel/DRJA-W7iQxX/?igsh=MTdtM3p0NzU3Z3dvag==',
      title: 'Customer Testimonial',
      description: 'Hear from our satisfied customers'
    },
    {
      id: 'DQ-v2DsEYZX',
      url: 'https://www.instagram.com/reel/DQ-v2DsEYZX/?igsh=MXQ5ZTdjem5xMzcyMg==',
      title: 'Behind the Scenes',
      description: 'A day in our gold trading business'
    },
    {
      id: 'DPRAMsFiYfZ',
      url: 'https://www.instagram.com/reel/DPRAMsFiYfZ/?igsh=MThjcDYxejcyaG1rYg==',
      title: 'Gold Purity Testing',
      description: 'Learn about our testing process'
    }
  ];

  const handleReelClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <FaInstagram className="text-2xl text-yellow-600" />
            <span className="text-sm text-gray-500 uppercase tracking-wide">Follow Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Watch Our <span className="text-yellow-600">Latest Reels</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our latest content on Instagram
          </p>
        </motion.div>

        {/* Poster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => handleReelClick(reel.url)}
              className="group relative cursor-pointer"
            >
              {/* Poster Card */}
              <div className="relative bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                </div>

                {/* Content */}
                <div className="relative p-6 h-full min-h-[280px] flex flex-col justify-between">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <FaInstagram className="text-white text-xl" />
                      </div>
                      <span className="text-white/90 text-sm font-medium">Instagram Reel</span>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                      {reel.title}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {reel.description}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <FaPlay className="text-white text-sm" />
                        <span className="text-white text-sm font-medium">Watch Now</span>
                      </div>
                      <div className="bg-white rounded-full p-2 group-hover:scale-110 transition-transform">
                        <FaArrowRight className="text-yellow-600 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <FaInstagram className="text-xl" />
            <span>Follow us on Instagram</span>
            <FaArrowRight className="text-sm" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramPoster;

