import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, UserRole } from '../types';

export function AdminPanel({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => load(), []);

  const load = () => setUsers(storage.get<User[]>('users') || []);

  const promote = (userId: string, newRole: UserRole) => {
    const all = storage.get<User[]>('users') || [];
    const old = all.find(u => u.id === userId);
    const updated = all.map(u => u.id === userId ? { ...u, role: newRole } : u);
    storage.set('users', updated);
    logAudit(user, 'ROLE_CHANGE', 'users', userId, { old_role: old?.role, new_role: newRole });
    load();
  };

  const colorFor = (r: UserRole) => ({
    president: 'bg-purple-100 text-purple-800',
    custodian: 'bg-blue-100 text-blue-800',
    secretary: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-800',
  }[r]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Admin Panel</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b">
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-gray-600">Promote users to different roles</p>
        </div>
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
                      <option value="president">President</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}