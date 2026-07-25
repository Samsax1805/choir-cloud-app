import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, UserRole, AccountRequest } from '../types';

export function AdminPanel({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');

  useEffect(() => load(), []);

  const load = () => {
    setUsers(storage.get<User[]>('users') || []);
    setRequests(storage.get<AccountRequest[]>('account_requests') || []);
  };

  const promote = (userId: string, newRole: UserRole) => {
    const all = storage.get<User[]>('users') || [];
    const old = all.find(u => u.id === userId);
    const updated = all.map(u => u.id === userId ? { ...u, role: newRole } : u);
    storage.set('users', updated);
    logAudit(user, 'ROLE_CHANGE', 'users', userId, { old_role: old?.role, new_role: newRole });
    load();
  };

  const approveRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const newUser: User = {
      id: Date.now().toString(),
      email: req.email,
      name: req.name,
      role: req.role,
      password: req.password,
      birthdate: req.birthdate,
      approved: true,
      created_at: new Date().toISOString().split('T')[0],
    };

    const allUsers = storage.get<User[]>('users') || [];
    storage.set('users', [...allUsers, newUser]);

    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );
    storage.set('account_requests', updatedRequests);

    logAudit(user, 'ACCOUNT_APPROVED', 'account_requests', requestId, { email: req.email });
    load();
  };

  const rejectRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    const updatedRequests = requests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    storage.set('account_requests', updatedRequests);
    logAudit(user, 'ACCOUNT_REJECTED', 'account_requests', requestId, { email: req?.email });
    load();
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const colorFor = (r: UserRole) => ({
    president: 'bg-purple-100 text-purple-800',
    provost: 'bg-indigo-100 text-indigo-800',
    custodian: 'bg-blue-100 text-blue-800',
    secretary: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-800',
  }[r]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>

      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-medium relative ${activeTab === 'requests' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
        >
          Account Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorFor(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== user.id && (
                      <select
                        value={u.role}
                        onChange={(e) => promote(u.id, e.target.value as UserRole)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="secretary">Secretary</option>
                        <option value="custodian">Custodian</option>
                        <option value="provost">Provost</option>
                        <option value="president">President</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-600">No pending account requests</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border-2 border-amber-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{req.name}</h4>
                      <p className="text-sm text-gray-600">{req.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Requested: {req.created_at}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejected/Approved History */}
          {requests.filter(r => r.status !== 'pending').length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Request History</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.filter(r => r.status !== 'pending').map((req) => (
                      <tr key={req.id}>
                        <td className="px-6 py-4">{req.name}</td>
                        <td className="px-6 py-4 text-gray-600">{req.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>{req.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
