import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User } from '../types';

export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [birthdate, setBirthdate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.get<User[]>('users') || [];

    if (isSignUp) {
      // 1. Check if user already exists
      if (users.find(u => u.email === email)) {
        setError('Email already exists');
        return;
      }
      
      // 2. Check if request is already pending
      const requests = storage.get<any[]>('account_requests') || [];
      if (requests.find(r => r.email === email)) {
        setError('An account request with this email is already pending');
        return;
      }

      //  Create pending request
      const newRequest = {
  id: Date.now().toString(),
  email,
  name: email.split('@')[0],
  password,
  birthdate: birthdate || undefined,
  role: 'user' as const,
  status: 'pending' as const,
  created_at: new Date().toISOString().split('T')[0],
};
      
      storage.set('account_requests', [...requests, newRequest]);
      logAudit(null, 'SIGNUP', 'account_requests', newRequest.id, { email });
      alert('Account request created! Please wait for the President to approve your account.');
      setIsSignUp(false); // Switch back to login view
      
    } else {
      // 4. Handle Login
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        // FIX: President role ALWAYS bypasses the approval check
        if (foundUser.role !== 'president' && !foundUser.approved) {
          setError('Your account is pending approval. Please contact the President.');
          logAudit(foundUser, 'FAILED_LOGIN', 'auth', undefined, { reason: 'pending_approval' });
          return;
        }
        
        // Success! Log them in
        logAudit(foundUser, 'LOGIN', 'auth');
        onLogin(foundUser);
      } else {
        logAudit(null, 'FAILED_LOGIN', 'auth', undefined, { email });
        setError('Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4">
            <img 
              src="/choir_logo.jpeg" 
              alt="St. Barnabas Amazing Voices Choir" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">St. Barnabas Amazing Voices Choir Cloud Storage</h1>  
          <p className="text-gray-600 mt-2">Sing Praises to The Lord</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          {isSignUp && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate (Optional)</label>
    <input
      type="date"
      value={birthdate}
      onChange={(e) => setBirthdate(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
    />
  </div>
)}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-medium py-3 rounded-lg hover:from-amber-500 hover:to-amber-700 shadow-lg"
          >
            {isSignUp ? 'Request Account (Pending Approval)' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-amber-600 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create account'}
          </button>
        </p>
      </div>
    </div>
  );
}
