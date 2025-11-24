import React, { useRef, useEffect } from 'react';
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
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-yellow-400/30 rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-16 py-20">
        
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left space-y-8">
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
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
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
            className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed"
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
              <p className="text-xs text-gray-500 uppercase tracking-wider">Years Experience</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white flex items-center">
                <Counter value={10} />k+
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Happy Customers</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white flex items-center">
                <Counter value={100} />%
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Transparency</p>
            </div>
          </motion.div>
        </div>

        {/* Elegant Floating Card Element */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 relative w-full max-w-[280px] md:max-w-md aspect-square flex items-center justify-center mt-8 md:mt-0"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Card Background */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-full border border-white/10 shadow-2xl"
            />
            
            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Main Image/Logo */}
            <div 
              className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.2)] bg-black"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-900/20 to-transparent z-10 pointer-events-none" />
              <img 
                src="/images/Sujana-Gold-Logo.jpeg" 
                alt="Sujana Gold" 
                className="w-full h-full object-contain p-2"
              />
            </div>

            {/* Decorative Ring */}
            <motion.div 
              className="absolute inset-4 md:inset-10 border border-yellow-500/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Floating Badge */}
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  ₹
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Gold Rate</p>
                  <p className="text-sm font-bold text-white">Best Market Price</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
};

export default Hero;
