import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';

const Counter = ({ value, duration = 2.5 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (inView) {
      const node = ref.current;
      const controls = animate(0, value, {
        duration,
        onUpdate: (value) => {
          node.textContent = Math.round(value);
        },
        ease: "easeOut"
      });
      return () => controls.stop();
    }
  }, [inView, value, duration]);

  return <span ref={ref}>0</span>;
};

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    '/images/gold-bg.jpg',
    '/images/hero-2.jpeg',
    '/images/hero-3.jpeg',
    '/images/hero-4.jpeg',
    '/images/hero-5.png',
    '/images/hero-img1.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Image Carousel */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === currentImage ? 1 : 0,
              scale: index === currentImage ? 1 : 1.1,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" /> {/* Overlay for better text readability */}
          </motion.div>
        ))}
      </div>

      {/* Branding Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center py-20">

          {/* Text Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-block px-4 py-1.5 border border-yellow-500/30 rounded-full bg-yellow-500/5 backdrop-blur-sm mb-6">
                <span className="text-yellow-400 text-xs md:text-sm font-medium tracking-widest uppercase">
                  The Gold Standard of Trust
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                Welcome to <br />
                <span className="relative inline-block mt-2">
                  <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent blur-sm opacity-50 animate-pulse">
                    Sujana Gold
                  </span>
                  <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                    Sujana Gold
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-gray-200 text-lg md:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              Unlock the true value of your assets with Sujana Gold.
              Instant liquidity, transparent evaluation, and a legacy of trust since 2003.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Link
                to="/contact"
                className="group relative px-8 py-4 bg-yellow-500 text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Get Instant Quote</span>
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors backdrop-blur-sm"
              >
                Our Legacy
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-8 flex items-center justify-center md:justify-start gap-8 border-t border-white/10"
            >
              <div>
                <p className="text-2xl font-bold text-white flex items-center">
                  <Counter value={21} />+
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Years Experience</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white flex items-center">
                  <Counter value={10} />k+
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white flex items-center">
                  <Counter value={100} />%
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Transparency</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImage ? 'bg-yellow-400 scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
