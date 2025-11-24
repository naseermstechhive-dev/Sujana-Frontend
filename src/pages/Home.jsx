import React from 'react';
import FlashMessage from '../components/home/FlashMessaage';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';

const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <About />
      <FlashMessage />
    </div>
  );
};

export default Home;