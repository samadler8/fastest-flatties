import React, { useState } from 'react';
import { 
  Mountain, 
  Search, 
  Trophy, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Menu,
  X,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const routesData = [
  {
    id: 1,
    name: '1st Flatiron Direct',
    distance: '1.2 mi',
    elevation: '1,050 ft',
    fktHolder: 'Alex Honnold',
    fktTime: '32:14',
    image: 'https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Hard'
  },
  {
    id: 2,
    name: '2nd Flatiron Freeway',
    distance: '1.5 mi',
    elevation: '1,120 ft',
    fktHolder: 'Anton Krupicka',
    fktTime: '36:45',
    image: 'https://images.unsplash.com/photo-1566810235336-07fb905a5a14?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Moderate'
  },
  {
    id: 3,
    name: '3rd Flatiron Standard',
    distance: '1.4 mi',
    elevation: '1,250 ft',
    fktHolder: 'Kilian Jornet',
    fktTime: '29:50',
    image: 'https://images.unsplash.com/photo-1588147514731-1520e54d3209?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Expert'
  },
  {
    id: 4,
    name: 'Green Mountain via Gregory',
    distance: '3.2 mi',
    elevation: '2,200 ft',
    fktHolder: 'Joe Grant',
    fktTime: '42:10',
    image: 'https://images.unsplash.com/photo-1627918451876-06ee79d63c52?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Strenuous'
  }
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation Header */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Mountain size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Fastest <span className="text-emerald-600">Fatties</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Routes</a>
              <a href="#" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Leaderboards</a>
              <a href="#" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm shadow-emerald-200">
                Submit Time
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-md">Routes</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-md">Leaderboards</a>
            <a href="#" className="block mt-4 w-full text-center bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium shadow-sm">
              Submit Time
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-[70vh]">
        <div 
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=2000')"
          }}
        >
          <span className="w-full h-full absolute opacity-60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></span>
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm mb-4 border border-emerald-500/30 backdrop-blur-sm">
              Boulder, Colorado
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
              Boulder Flatirons <br className="hidden sm:block"/> FKT Tracker
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-200 mb-10 max-w-2xl font-light drop-shadow">
              Discover, track, and conquer the Fastest Known Times on the most iconic scrambles and trails in the Flatirons.
            </p>
            
            {/* Search Bar */}
            <div className="w-full max-w-xl relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search routes (e.g., 1st Flatiron, Green Mountain)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur shadow-2xl border-0 focus:ring-4 focus:ring-emerald-500/30 outline-none text-slate-800 placeholder-slate-400 transition-all text-lg"
              />
              <button className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 text-slate-50">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 sm:h-24 fill-current block">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,126.38,201.33,119.53,243.68,115.42,284.66,101.8,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Featured Routes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 z-20 relative">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Popular Routes</h2>
            <p className="text-slate-500 mt-2">The most contested lines in the Flatirons.</p>
          </div>
          <a href="#" className="hidden sm:flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            View all <ChevronRight size={20} className="ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {routesData.map((route) => (
            <div key={route.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group cursor-pointer flex flex-col">
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={route.image} 
                  alt={route.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                  {route.difficulty}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {route.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-slate-600">
                    <MapPin size={16} className="text-emerald-500 mr-2 opacity-70" />
                    <span className="text-sm font-medium">{route.distance}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <TrendingUp size={16} className="text-emerald-500 mr-2 opacity-70" />
                    <span className="text-sm font-medium">{route.elevation}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current FKT</span>
                    <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                      <Clock size={14} className="mr-1.5" />
                      {route.fktTime}
                    </div>
                  </div>
                  <div className="flex items-center text-slate-800 font-medium">
                    <Trophy size={16} className="text-amber-500 mr-2" fill="currentColor" />
                    {route.fktHolder}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-10 sm:hidden flex justify-center">
          <a href="#" className="flex items-center justify-center w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors">
            View all routes <ChevronRight size={20} className="ml-1" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-white">
            <Mountain size={24} />
            <span className="font-bold text-xl tracking-tight">
              Fastest <span className="text-emerald-500">Fatties</span>
            </span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center text-xs opacity-50">
          <p>&copy; {new Date().getFullYear()} Fastest Fatties. Not affiliated with the official FKT website. Climb at your own risk.</p>
        </div>
      </footer>
    </div>
  );
}