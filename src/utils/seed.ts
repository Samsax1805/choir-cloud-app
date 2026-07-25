import { storage } from './storage';
import type { User } from '../types';

export const seedData = () => {
  
  const todayStr = new Date().toISOString().split('T')[0];

  if (!storage.get('users')) {
    const users: User[] = [
      { id: '1', email: 'president@choir.org', name: 'Natasha President', role: 'president', password: 'admin123', approved: true, created_at: '2024-01-01' },
      { id: '2', email: 'provost@choir.org', name: 'Erica Provost', role: 'provost', password: 'prov123', approved: true, created_at: '2024-01-01' },
      { id: '3', email: 'custodian@choir.org', name: 'Teddy Custodian', role: 'custodian', password: 'cust123', approved: true, created_at: '2024-01-01' },
      { id: '4', email: 'secretary@choir.org', name: 'Taonga Secretary', role: 'secretary', password: 'sec123', approved: true, created_at: '2024-01-01', birthdate: '1990-07-25' },
      { id: '5', email: 'chinendu@choir.org', name: 'Samuel Otobo', role: 'user', password: 'user123', approved: true, created_at: '2024-01-01', birthdate: '1995-03-15' },
      
     
      { id: '6', email: 'member@choir.org', name: 'Jane Member', role: 'user', password: 'user123', approved: true, created_at: '2024-01-01', birthdate: todayStr },
    ];
    storage.set('users', users);
  }

  if (!storage.get('music_files')) {
    const files = [
      { id: '1', title: 'Amazing Grace', category: 'hymns', file_type: 'mp3', file_url: '', uploaded_by: '3', uploaded_by_name: 'Teddy Custodian', created_at: '2024-03-15' },
      { id: '2', title: 'How Great Thou Art', category: 'hymns', file_type: 'mp3', file_url: '', uploaded_by: '3', uploaded_by_name: 'Teddy Custodian', created_at: '2024-03-14' },
    ];
    storage.set('music_files', files);
  }

  if (!storage.get('debts')) {
    const debts = [
      // Fixed name to match Samuel Otobo (id: 5)
      { id: '1', user_id: '5', user_name: 'Samuel Otobo', amount: 500, type: 'registration', status: 'pending', recorded_by: '4', created_at: '2024-01-15' },
      { id: '2', user_id: '5', user_name: 'Samuel Otobo', amount: 1200, type: 'uniform', status: 'pending', recorded_by: '4', created_at: '2024-01-15' },
    ];
    storage.set('debts', debts);
  }

  if (!storage.get('voice_notes')) storage.set('voice_notes', []);
  if (!storage.get('receipts')) storage.set('receipts', []);
  if (!storage.get('minutes')) storage.set('minutes', []);
  if (!storage.get('audit_logs')) storage.set('audit_logs', []);
  if (!storage.get('attendance_sessions')) storage.set('attendance_sessions', []);
  if (!storage.get('attendance_records')) storage.set('attendance_records', []);
  if (!storage.get('account_requests')) storage.set('account_requests', []);
};
