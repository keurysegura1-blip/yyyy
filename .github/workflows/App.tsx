import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Members from './components/Members';
import Stats from './components/Stats';
import Achievements from './components/Achievements';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* Navbar Placeholder - Sticky Top */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6 md:px-12">
        <div className="font-cyber font-bold text-xl tracking-wider">
          BR <span className="text-red-600">RONINS</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Inicio</a>
          <a href="#" className="hover:text-white transition-colors">Clan</a>
          <a href="#" className="hover:text-white transition-colors">Miembros</a>
          <a href="#" className="hover:text-white transition-colors">Torneos</a>
        </div>
        <div className="md:hidden text-red-500 font-bold">Menu</div>
      </nav>

      <main>
        <Hero />
        <About />
        <Members />
        <Stats />
        <Achievements />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;