import React, { useState } from 'react';
import type { User, View, Currency } from '../types';

export function Navigation({
  user, currentView, onViewChange, onLogout, currency, onCurrencyChange
}: {
  user: User;
  currentView: View;
  onViewChange: (v: View) => void;
  onLogout: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'music', label: 'Music & Files', icon: '' },
    { id: 'minutes', label: 'Minutes & Receipts', icon: '' },
    { id: 'debts', label: 'Debts & Accounts', icon: '💰' },
    { id: 'voice', label: 'Voice Notes', icon: '🎤' },
  ];

  if (user.role === 'president') {
    navItems.push({ id: 'audit', label: 'Audit Logs', icon: '📋' });
    navItems.push({ id: 'admin', label: 'Admin', icon: '⚙️' });
  }

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-md">
              <img 
                src="/choir_logo.jpeg" 
                alt="AVC Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-amber-400">St. Barnabas AVC</h1>
              <p className="text-xs text-gray-400">Sing Praises to The Lord</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-amber-500 text-white'
                    : 'hover:bg-slate-800 text-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="hidden sm:block bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
            </select>

            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-800 rounded-lg"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    currentView === item.id
                      ? 'bg-amber-500 text-white'
                      : 'hover:bg-slate-800 text-gray-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
                <select
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="TRY">₺ Turkish Lira</option>
                  <option value="USD">$ US Dollar</option>
                  <option value="USD">£ POUNDS STERLING</option>
                </select>
                
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 hover:bg-slate-700 rounded-lg text-red-400"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}