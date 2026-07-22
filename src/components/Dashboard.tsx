import React, { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import type { User, Currency, Debt } from '../types';

export function Dashboard({ user, currency }: { user: User; currency: Currency }) {
  const [stats, setStats] = useState({ members: 0, files: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    const users = storage.get<any[]>('users') || [];
    const files = storage.get<any[]>('music_files') || [];
    const debts = storage.get<Debt[]>('debts') || [];
    const totalOverdue = debts
      .filter(d => d.status === 'pending' || d.status === 'overdue')
      .reduce((sum, d) => sum + d.amount, 0);

    setStats({
      members: users.length,
      files: files.length,
      pending: debts.filter(d => d.status === 'pending').length,
      overdue: totalOverdue,
    });
  }, [currency]);

  const fmt = (n: number) =>
    currency === 'TRY' ? `₺${n.toLocaleString('tr-TR')}` : `$${n.toLocaleString('en-US')}`;

  const cards = [
    { title: 'Total Members', value: stats.members, icon: '👥', color: 'blue' },
    { title: 'Files Uploaded', value: stats.files, icon: '📁', color: 'amber' },
    { title: 'Pending Receipts', value: stats.pending, icon: '📄', color: 'orange' },
    { title: 'Overdue Balances', value: fmt(stats.overdue), icon: '⚠️', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Welcome, {user.role === 'president' ? 'President' : user.name}
        </h2>
        <p className="text-gray-600 mt-1">Here's what's happening with the choir today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border-2 border-amber-200 p-6 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{c.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{c.value}</p>
              </div>
              <div className="text-4xl">{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(user.role === 'president' || user.role === 'custodian') && (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg">
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-medium text-slate-900">Upload Music</div>
              <div className="text-sm text-gray-600">Add new songs to the library</div>
            </div>
          )}
          {user.role === 'secretary' && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-slate-900">Upload Minutes</div>
              <div className="text-sm text-gray-600">Add meeting minutes</div>
            </div>
          )}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
            <div className="text-2xl mb-2">💳</div>
            <div className="font-medium text-slate-900">Check My Debt</div>
            <div className="text-sm text-gray-600">View your account balance</div>
          </div>
        </div>
      </div>
    </div>
  );
}