import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, Debt, Currency } from '../types';

export function DebtTracker({ user, currency }: { user: User; currency: Currency }) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'payment' | 'refund' | 'adjustment'>('payment');

  const canEdit = user.role === 'president' || user.role === 'secretary';

  useEffect(() => {
    setDebts(storage.get<Debt[]>('debts') || []);
    setMembers(storage.get<any[]>('users') || []);
  }, []);

  const fmt = (n: number) =>
    currency === 'TRY' ? `₺${n.toLocaleString('tr-TR')}` : `$${n.toLocaleString('en-US')}`;

  const totalDebt = (id: string) =>
    debts.filter(d => d.user_id === id && d.status !== 'paid')
      .reduce((s, d) => s + d.amount, 0);

  const submit = () => {
    if (!selected || !amount) return;
    const val = parseFloat(amount);
    const newDebt: Debt = {
      id: Date.now().toString(),
      user_id: selected,
      amount: type === 'payment' ? -val : val,
      type,
      status: 'pending',
      recorded_by: user.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    const all = storage.get<Debt[]>('debts') || [];
    storage.set('debts', [...all, newDebt]);
    logAudit(user, 'CREATE', 'debts', newDebt.id, { user_id: selected, amount: val, type });
    setAmount(''); setShowModal(false);
    setDebts(storage.get<Debt[]>('debts') || []);
  };

  const exportCSV = () => {
    const rows = [
      ['Member Name', 'Email', 'Total Owed'],
      ...members.map(m => [m.name, m.email, totalDebt(m.id).toString()])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'member-debts.csv';
    a.click();
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Member Debt Tracker</h2>
        <button onClick={exportCSV} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Export CSV
        </button>
      </div>

      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Owed</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((m) => {
              const owed = totalDebt(m.id);
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.email}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${owed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(Math.abs(owed))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canEdit && (
                      <button
                        onClick={() => { setSelected(m.id); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        View & Update
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Account Breakdown</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between py-2 border-b"><span>Registration Fee</span><span className="font-medium">{fmt(500)}</span></div>
              <div className="flex justify-between py-2 border-b"><span>Uniform</span><span className="font-medium">{fmt(1200)}</span></div>
              <div className="flex justify-between py-2 border-b"><span>Trip Fund</span><span className="font-medium">{fmt(800)}</span></div>
            </div>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <div className="flex space-x-3 pt-4">
                <button onClick={submit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">Submit</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}