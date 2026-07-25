import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, AttendanceSession, AttendanceRecord, DayType, AttendanceStatus } from '../types';

export function Attendance({ user }: { user: User }) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  
  const [dayType, setDayType] = useState<DayType>('thursday');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanCode, setScanCode] = useState('');
  const [manualUserId, setManualUserId] = useState('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const isProvost = user.role === 'provost' || user.role === 'president';

  useEffect(() => {
    loadData();
    setAllUsers(storage.get<User[]>('users') || []);
  }, []);

  const loadData = () => {
    setSessions(storage.get<AttendanceSession[]>('attendance_sessions') || []);
    setRecords(storage.get<AttendanceRecord[]>('attendance_records') || []);
  };

  const generateSessionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateSession = async () => {
    const code = generateSessionCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

    try {
      const qrUrl = await QRCode.toDataURL(
        JSON.stringify({ sessionCode: code, dayType, date: sessionDate }),
        { width: 300, margin: 2 }
      );
      setQrDataUrl(qrUrl);

      const session: AttendanceSession = {
        id: Date.now().toString(),
        day_type: dayType,
        session_date: sessionDate,
        session_code: code,
        generated_by: user.id,
        generated_by_name: user.name,
        generated_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_active: true,
        qr_data_url: qrUrl,
      };

      const all = storage.get<AttendanceSession[]>('attendance_sessions') || [];
      storage.set('attendance_sessions', [...all, session]);
      setActiveSession(session);
      logAudit(user, 'SESSION_GENERATED', 'attendance', session.id, { code, dayType });
      setShowGenerateModal(false);
      loadData();
    } catch (err) {
      alert('Failed to generate QR code');
    }
  };

  const handleScanCheckin = () => {
    if (!scanCode || !activeSession) {
      alert('Please enter the session code');
      return;
    }

    if (scanCode !== activeSession.session_code) {
      alert('Invalid session code');
      return;
    }

    if (new Date(activeSession.expires_at) < new Date()) {
      alert('This session has expired');
      return;
    }

    // Check if already marked
    const existing = records.find(r => 
      r.session_id === activeSession.id && r.user_id === user.id
    );
    if (existing) {
      alert('You have already been marked for this session');
      return;
    }

    const record: AttendanceRecord = {
      id: Date.now().toString(),
      session_id: activeSession.id,
      user_id: user.id,
      user_name: user.name,
      status: 'present',
      marked_by: user.id,
      marked_by_name: user.name,
      marked_at: new Date().toISOString(),
      method: 'self_checkin',
    };

    const all = storage.get<AttendanceRecord[]>('attendance_records') || [];
    storage.set('attendance_records', [...all, record]);
    logAudit(user, 'ATTENDANCE_MARKED', 'attendance', record.id, { session: activeSession.session_code });
    setScanCode('');
    setShowScanModal(false);
    loadData();
    alert('Attendance marked successfully!');
  };

  const handleManualMark = () => {
    if (!manualUserId || !activeSession) return;

    const selectedUser = allUsers.find(u => u.id === manualUserId);
    if (!selectedUser) return;

    const existing = records.find(r => 
      r.session_id === activeSession.id && r.user_id === manualUserId
    );
    if (existing) {
      if (!confirm('This user already has attendance marked. Update it?')) return;
      const updated = records.map(r => 
        r.id === existing.id ? { ...r, status: manualStatus, marked_by: user.id, marked_by_name: user.name, marked_at: new Date().toISOString(), method: 'manual' as const } : r
      );
      storage.set('attendance_records', updated);
    } else {
      const record: AttendanceRecord = {
        id: Date.now().toString(),
        session_id: activeSession.id,
        user_id: manualUserId,
        user_name: selectedUser.name,
        status: manualStatus,
        marked_by: user.id,
        marked_by_name: user.name,
        marked_at: new Date().toISOString(),
        method: 'manual',
      };
      const all = storage.get<AttendanceRecord[]>('attendance_records') || [];
      storage.set('attendance_records', [...all, record]);
    }

    logAudit(user, 'ATTENDANCE_MARKED', 'attendance', manualUserId, { 
      session: activeSession.session_code, status: manualStatus 
    });
    setManualUserId('');
    loadData();
  };

  const getSessionRecords = (sessionId: string) => {
    return records.filter(r => r.session_id === sessionId);
  };

  const choristers = allUsers.filter(u => u.role === 'user' || u.role === 'custodian' || u.role === 'secretary');
  const activeSessions = sessions.filter(s => s.is_active && new Date(s.expires_at) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Attendance Tracker</h2>
        <div className="flex space-x-3">
          {isProvost && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Generate QR Session
            </button>
          )}
          <button
            onClick={() => setShowScanModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            📱 Check In (Scan Code)
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Active Sessions</h3>
        {activeSessions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-600">No active attendance sessions</p>
            {isProvost && <p className="text-sm text-gray-500 mt-2">Generate a QR session to start tracking</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session) => {
              const sessionRecords = getSessionRecords(session.id);
              const presentCount = sessionRecords.filter(r => r.status === 'present').length;
              return (
                <div key={session.id} className="bg-white rounded-xl border-2 border-purple-200 p-4 hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.day_type === 'thursday' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {session.day_type === 'thursday' ? 'Thursday' : 'Saturday'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(session.session_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Session Code</h4>
                  <p className="text-2xl font-mono font-bold text-purple-600 mb-2">{session.session_code}</p>
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Present: <span className="font-semibold text-green-600">{presentCount}</span> / {choristers.length}</p>
                    <p>Expires: {new Date(session.expires_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    {isProvost && (
                      <button
                        onClick={() => { setActiveSession(session); }}
                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-medium"
                      >
                        Mark Manually
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedSession(session); setShowRecordsModal(true); }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium"
                    >
                      View Records
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Sessions History */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Session History</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.slice().reverse().map((session) => {
                const sessionRecords = getSessionRecords(session.id);
                const presentCount = sessionRecords.filter(r => r.status === 'present').length;
                const isActive = session.is_active && new Date(session.expires_at) > new Date();
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{new Date(session.session_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm capitalize">{session.day_type}</td>
                    <td className="px-6 py-4 text-sm font-mono">{session.session_code}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{presentCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive ? 'Active' : 'Ended'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No sessions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Session Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Generate Attendance QR Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rehearsal Day</label>
                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value as DayType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="thursday">Thursday Rehearsal</option>
                  <option value="saturday">Saturday Rehearsal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleGenerateSession}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
                >
                  Generate QR Code
                </button>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Display Modal */}
      {activeSession && qrDataUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Attendance QR Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              {activeSession.day_type === 'thursday' ? 'Thursday' : 'Saturday'} Rehearsal - {new Date(activeSession.session_date).toLocaleDateString()}
            </p>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Session Code:</p>
              <p className="text-3xl font-mono font-bold text-purple-600">{activeSession.session_code}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Valid until {new Date(activeSession.expires_at).toLocaleTimeString()}
            </p>
            <button
              onClick={() => { setActiveSession(null); setQrDataUrl(''); }}
              className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scan/Check-in Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Check In to Rehearsal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Session Code</label>
                <input
                  type="text"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                  placeholder="ABCD-1234"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Get the code from the QR displayed by the Provost
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleScanCheckin}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                >
                  Check In
                </button>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mark Modal */}
      {activeSession && !qrDataUrl && isProvost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mark Attendance Manually</h3>
            <p className="text-sm text-gray-600 mb-4">Session: {activeSession.session_code}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chorister</label>
                <select
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Chorister</option>
                  {choristers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleManualMark}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={() => setActiveSession(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Modal */}
      {showRecordsModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Attendance Records</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedSession.day_type === 'thursday' ? 'Thursday' : 'Saturday'} - {new Date(selectedSession.session_date).toLocaleDateString()}
            </p>
            <div className="space-y-2">
              {getSessionRecords(selectedSession.id).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{record.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {record.method === 'qr_scan' ? 'QR Scan' : record.method === 'self_checkin' ? 'Self Check-in' : 'Manual'} • {new Date(record.marked_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                    record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
              {getSessionRecords(selectedSession.id).length === 0 && (
                <p className="text-center text-gray-500 py-8">No attendance records yet</p>
              )}
            </div>
            <button
              onClick={() => { setShowRecordsModal(false); setSelectedSession(null); }}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
