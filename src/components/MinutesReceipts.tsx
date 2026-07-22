import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, Minutes, Receipt, EntityType } from '../types';

export function MinutesReceipts({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'minutes' | 'receipts'>('minutes');
  const [minutes, setMinutes] = useState<Minutes[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  // Upload states
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [minutesTitle, setMinutesTitle] = useState('');
  const [minutesDesc, setMinutesDesc] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptDesc, setReceiptDesc] = useState('');
  const [receiptUser, setReceiptUser] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const canUpload = user.role === 'secretary' || user.role === 'president';

  useEffect(() => {
    loadData();
    setAllUsers(storage.get<any[]>('users') || []);
  }, []);

  const loadData = () => {
    setMinutes(storage.get<Minutes[]>('minutes') || []);
    setReceipts(storage.get<Receipt[]>('receipts') || []);
  };

  const handleMinutesUpload = () => {
    if (!minutesTitle || !meetingDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newMinutes: Minutes = {
      id: Date.now().toString(),
      title: minutesTitle,
      description: minutesDesc,
      meeting_date: meetingDate,
      file_url: '',
      uploaded_by: user.id,
      uploaded_by_name: user.name,
      created_at: new Date().toISOString().split('T')[0],
    };

    if (minutesFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newMinutes.file_data = e.target?.result as string;
        const all = storage.get<Minutes[]>('minutes') || [];
        storage.set('minutes', [...all, newMinutes]);
        logAudit(user, 'UPLOAD', 'minutes', newMinutes.id, { title: minutesTitle });
        resetMinutesForm();
        loadData();
      };
      reader.readAsDataURL(minutesFile);
    } else {
      const all = storage.get<Minutes[]>('minutes') || [];
      storage.set('minutes', [...all, newMinutes]);
      logAudit(user, 'UPLOAD', 'minutes', newMinutes.id, { title: minutesTitle });
      resetMinutesForm();
      loadData();
    }
  };

  const handleReceiptUpload = () => {
    if (!receiptUser || !receiptAmount || !receiptFile) {
      alert('Please fill in all required fields and attach a receipt file');
      return;
    }

    const selectedUser = allUsers.find(u => u.id === receiptUser);
    if (!selectedUser) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        user_id: receiptUser,
        amount: parseFloat(receiptAmount),
        description: receiptDesc,
        file_url: '',
        file_data: e.target?.result as string,
        status: 'pending',
        uploaded_by: user.id,
        uploaded_by_name: user.name,
        created_at: new Date().toISOString().split('T')[0],
      };

      const all = storage.get<Receipt[]>('receipts') || [];
      storage.set('receipts', [...all, newReceipt]);
      logAudit(user, 'UPLOAD', 'receipts', newReceipt.id, { 
        user_id: receiptUser, 
        amount: parseFloat(receiptAmount) 
      });
      resetReceiptForm();
      loadData();
    };
    reader.readAsDataURL(receiptFile);
  };

  const resetMinutesForm = () => {
    setMinutesTitle('');
    setMinutesDesc('');
    setMeetingDate('');
    setMinutesFile(null);
    setShowMinutesModal(false);
  };

  const resetReceiptForm = () => {
    setReceiptAmount('');
    setReceiptDesc('');
    setReceiptUser('');
    setReceiptFile(null);
    setShowReceiptModal(false);
  };

      const downloadFile = (item: Minutes | Receipt, type: 'minutes' | 'receipts') => {
    if (item.file_data) {
      const a = document.createElement('a');
      a.href = item.file_data;
      
      let fileName = 'document';
      let logTitle = '';

      // Use 'as' to tell TypeScript exactly what type 'item' is
      if (type === 'minutes') {
        const m = item as Minutes;
        fileName = `${m.title}.pdf`;
        logTitle = m.title;
      } else if (type === 'receipts') {
        const r = item as Receipt;
        fileName = `${r.description || 'receipt'}.jpg`;
        logTitle = r.description || 'Receipt';
      }

      a.download = fileName;
      a.click();
      
      // Now 'type' is already a valid EntityType ('minutes' or 'receipts')
      logAudit(user, 'DOWNLOAD', type, item.id, { title: logTitle });
    }
  };

  const getUserById = (id: string) => {
    return allUsers.find(u => u.id === id);
  };

  // Filter receipts for regular users - only show their own
  const visibleReceipts = user.role === 'user' 
    ? receipts.filter(r => r.user_id === user.id)
    : receipts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">
          {user.role === 'secretary' || user.role === 'president' ? 'Minutes & Receipts' : 'Meeting Minutes & My Receipts'}
        </h2>
        {canUpload && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowMinutesModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Upload Minutes
            </button>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Upload Receipt
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('minutes')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'minutes'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Meeting Minutes
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'receipts'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {user.role === 'user' ? 'My Receipts' : 'All Receipts'}
        </button>
      </div>

      {/* Minutes Section */}
      {activeTab === 'minutes' && (
        <div className="space-y-4">
          {minutes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">No meeting minutes uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {minutes.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900 flex-1">{m.title}</h4>
                    {m.file_data && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PDF</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{m.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    <p>Meeting Date: {new Date(m.meeting_date).toLocaleDateString()}</p>
                    <p>Uploaded: {m.created_at} by {m.uploaded_by_name}</p>
                  </div>
                  {m.file_data && (
                    <button
                      onClick={() => downloadFile(m, 'minutes')}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium"
                    >
                      Download Minutes
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Receipts Section */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {visibleReceipts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <p className="text-gray-600">No receipts found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  {user.role !== 'user' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Member</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{r.created_at}</td>
                    {user.role !== 'user' && (
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {getUserById(r.user_id)?.name || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600">{r.description}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ${r.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === 'approved' ? 'bg-green-100 text-green-800' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.file_data && (
                        <button
                          onClick={() => downloadFile(r, 'receipts')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Upload Minutes Modal */}
      {showMinutesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Upload Meeting Minutes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={minutesTitle}
                  onChange={(e) => setMinutesTitle(e.target.value)}
                  placeholder="e.g., Monthly General Meeting"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date *</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={minutesDesc}
                  onChange={(e) => setMinutesDesc(e.target.value)}
                  placeholder="Brief description of the meeting..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setMinutesFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleMinutesUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowMinutesModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Upload Receipt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
                <select
                  value={receiptUser}
                  onChange={(e) => setReceiptUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Member</option>
                  {allUsers.filter(u => u.role === 'user').map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={receiptDesc}
                  onChange={(e) => setReceiptDesc(e.target.value)}
                  placeholder="e.g., Uniform payment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleReceiptUpload}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}