import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import type { User, AuditLog } from '../types';

export function AuditLogViewer({ user }: { user: User }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  useEffect(() => load(), []);

  const load = () => setLogs(storage.get<AuditLog[]>('audit_logs') || []);

  const colorFor = (a: string) => ({
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    LOGIN: 'bg-purple-100 text-purple-800',
    LOGOUT: 'bg-gray-100 text-gray-800',
    UPLOAD: 'bg-amber-100 text-amber-800',
    DOWNLOAD: 'bg-indigo-100 text-indigo-800',
    ROLE_CHANGE: 'bg-pink-100 text-pink-800',
    FAILED_LOGIN: 'bg-red-200 text-red-900',
    SIGNUP: 'bg-teal-100 text-teal-800',
  }[a] || 'bg-gray-100 text-gray-800');

  const iconFor = (e: string) => ({
    users: '👤', music_files: '🎵', debts: '💰',
    voice_notes: '🎤', receipts: '📄', auth: '',
  }[e] || '');

  const filtered = logs.filter(l =>
    (filterAction === 'all' || l.action === filterAction) &&
    (filterEntity === 'all' || l.entity_type === filterEntity)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Audit Logs</h2>
          <p className="text-gray-600 mt-1">Track all system activity</p>
        </div>
        <button onClick={load} className="p-2 bg-white border border-gray-300 rounded-lg">🔄</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Actions</option>
            {['LOGIN','LOGOUT','SIGNUP','CREATE','UPDATE','DELETE','UPLOAD','DOWNLOAD','ROLE_CHANGE','FAILED_LOGIN'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Entities</option>
            {['users','music_files','debts','voice_notes','receipts','auth'].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No logs</div>
        ) : filtered.map((l) => (
          <div key={l.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{iconFor(l.entity_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${colorFor(l.action)}`}>{l.action}</span>
                    <span className="text-sm font-medium text-slate-900">{l.user_name}</span>
                    <span className="text-xs text-gray-500">({l.user_email})</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {l.action} on <span className="font-medium">{l.entity_type}</span>
                    {l.entity_id && <span> (ID: {l.entity_id.substring(0, 8)}...)</span>}
                  </p>
                  {l.details && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 max-h-20 overflow-auto">
                      {JSON.stringify(l.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                {new Date(l.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Logs</p>
          <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Failed Logins</p>
          <p className="text-2xl font-bold text-red-600">{logs.filter(l => l.action === 'FAILED_LOGIN').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Uploads</p>
          <p className="text-2xl font-bold text-amber-600">{logs.filter(l => l.action === 'UPLOAD').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Role Changes</p>
          <p className="text-2xl font-bold text-purple-600">{logs.filter(l => l.action === 'ROLE_CHANGE').length}</p>
        </div>
      </div>
    </div>
  );
}