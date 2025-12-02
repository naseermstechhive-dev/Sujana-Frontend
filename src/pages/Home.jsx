import React from 'react';
import FlashMessage from '../components/home/FlashMessaage';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';
import Franchise from '../components/home/Franchise';
import InstagramPoster from '../components/home/InstagramPoster';

const Home = () => {
  return (
    <div>
      <Hero />
      <Franchise />
      <Services />
      <InstagramPoster />
      <About />
      <FlashMessage />
    </div>
  );
};

export default Home;