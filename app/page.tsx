"use client";

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
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';

const routesData = [
  {
    id: 'f1111111-1111-1111-1111-111111111111', // Updated valid UUID
    name: 'First Flatiron - Direct East Face (DEF)',
    distance: '2.4 mi',
    elevation: '1,400 ft',
    recordHolder: 'Kyle Richardson',
    fastestTime: '30:19',
    image: 'https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Hard',
    description: 'The iconic Direct East Face scramble from Chautauqua trailhead to the summit block of the First Flatiron.'
  },
  {
    id: 'f5353533-5353-5353-5353-535353535353',
    name: '53 Flatiron Classics Linkup',
    distance: '28.6 mi',
    elevation: '19,075 ft',
    recordHolder: 'Mike Palmer & Ari',
    fastestTime: '27:52:34',
    image: 'https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=800',
    difficulty: 'Extreme',
    description: 'The ultimate Boulder scrambling linkup connecting 53 classic Flatiron rock faces in a single push.'
  },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = routesData.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Navigation Header */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="bg-emerald-500 p-2 rounded-xl text-slate-950 font-bold">
                <Mountain size={22} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Fastest <span className="text-emerald-400">Fatties</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#routes" className="text-slate-300 hover:text-emerald-400 font-medium transition-colors">Routes</a>
              <a href="#leaderboards" className="text-slate-300 hover:text-emerald-400 font-medium transition-colors">Leaderboards</a>
              <a href="/submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/20">
                Submit Time
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-6 space-y-3">
            <a href="#routes" className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-emerald-400">Routes</a>
            <a href="#leaderboards" className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-emerald-400">Leaderboards</a>
            <a href="/submit" className="block mt-4 w-full text-center bg-emerald-500 text-slate-950 font-semibold px-5 py-3 rounded-xl shadow-md">
              Submit Time
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 pb-20 flex items-center justify-center min-h-[65vh]">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1598974609653-53d719597274?auto=format&fit=crop&q=80&w=2000')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950" />
        
        <div className="container relative mx-auto px-4 text-center z-10">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs mb-6 border border-emerald-500/20 backdrop-blur-sm">
              <MapPin size={14} /> Boulder, Colorado
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
              Boulder Flatirons <br className="hidden sm:block"/> Route & Speed Records
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl font-normal leading-relaxed">
              Discover, track, and submit speed records for the iconic scrambles, loops, and summit pushes in the Boulder Flatirons.
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
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none text-white placeholder-slate-500 transition-all text-base shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Routes Section */}
      <div id="routes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Mountain className="text-emerald-400" size={24} /> Popular Routes
            </h2>
            <p className="text-slate-400 text-sm mt-1">Verified routes and current record holders in the Flatirons.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRoutes.map((route) => (
            <a 
              key={route.id} 
              href={`/routes/${route.id}`}
              className="bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 group flex flex-col"
            >
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden bg-slate-800">
                <img 
                  src={route.image} 
                  alt={route.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 border border-slate-800">
                  {route.difficulty}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {route.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {route.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center">
                    <MapPin size={14} className="text-emerald-400 mr-1.5" />
                    <span>{route.distance}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={14} className="text-emerald-400 mr-1.5" />
                    <span>{route.elevation}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Route Record</span>
                    <div className="flex items-center text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                      <Clock size={12} className="mr-1" />
                      {route.fastestTime}
                    </div>
                  </div>
                  <div className="flex items-center text-slate-200 text-sm font-medium">
                    <Trophy size={14} className="text-amber-400 mr-1.5" />
                    {route.recordHolder}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Mountain size={20} className="text-emerald-400" />
            <span className="font-bold tracking-tight">Fastest <span className="text-emerald-400">Fatties</span></span>
          </div>
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Fastest Fatties. Non-commercial community mountain logs.</p>
        </div>
      </footer>
    </div>
  );
}