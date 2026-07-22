import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { MusicLibrary } from './components/MusicLibrary';
import { DebtTracker } from './components/DebtTracker';
import { VoiceNotes } from './components/VoiceNotes';
import { AuditLogViewer } from './components/AuditLogViewer';
import { AdminPanel } from './components/AdminPanel';
import { MinutesReceipts } from './components/MinutesReceipts';

import { storage } from './utils/storage';
import { seedData } from './utils/seed';
import { logAudit } from './utils/auditLogger';
import type { User, View, Currency } from './types';

export default function App() {
  // 2. These define 'user' and 'view' so they don't throw "Cannot find name" errors
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [currency, setCurrency] = useState<Currency>('TRY');

  useEffect(() => {
    seedData();
    const saved = storage.get<User>('current_user');
    if (saved) setUser(saved);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    storage.set('current_user', u);
  };

  const handleLogout = () => {
    if (user) logAudit(user, 'LOGOUT', 'auth');
    setUser(null);
    storage.remove('current_user');
    setView('dashboard');
  };

  // If no user is logged in, show the Login screen
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={user}
        currentView={view}
        onViewChange={setView}
        onLogout={handleLogout}
        currency={currency}
        onCurrencyChange={setCurrency}
      />
      
      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' && <Dashboard user={user} currency={currency} />}
        {view === 'music' && <MusicLibrary user={user} />}
        {view === 'debts' && <DebtTracker user={user} currency={currency} />}
        {view === 'voice' && <VoiceNotes user={user} />}
        
        {/* 3. This routes to the new component */}
        {view === 'minutes' && <MinutesReceipts user={user} />} 
        
        {view === 'audit' && user.role === 'president' && <AuditLogViewer user={user} />}
        {view === 'admin' && user.role === 'president' && <AdminPanel user={user} />}
      </main>
    </div>
  );
}