import { storage } from './storage';
import type { User, MusicFile, Debt } from '../types';

export const seedData = () => {
  if (!storage.get('users')) {
    const users: User[] = [
      { id: '1', email: 'president@choir.org', name: 'John President', role: 'president', password: 'admin123', created_at: '2024-01-01' },
      { id: '2', email: 'custodian@choir.org', name: 'Mary Custodian', role: 'custodian', password: 'cust123', created_at: '2024-01-01' },
      { id: '3', email: 'secretary@choir.org', name: 'Sarah Secretary', role: 'secretary', password: 'sec123', created_at: '2024-01-01' },
      { id: '4', email: 'chinendu@choir.org', name: 'Chinedu Okonkwo', role: 'user', password: 'user123', created_at: '2024-01-01' },
      { id: '5', email: 'member@choir.org', name: 'Jane Member', role: 'user', password: 'user123', created_at: '2024-01-01' },
    ];
    storage.set('users', users);
  }

  if (!storage.get('music_files')) {
    const files: MusicFile[] = [
      { id: '1', title: 'Amazing Grace', category: 'hymns', file_type: 'mp3', file_url: '', uploaded_by: '2', uploaded_by_name: 'Mary Custodian', created_at: '2024-03-15' },
      { id: '2', title: 'How Great Thou Art', category: 'hymns', file_type: 'mp3', file_url: '', uploaded_by: '2', uploaded_by_name: 'Mary Custodian', created_at: '2024-03-14' },
      { id: '3', title: 'Holy Holy Holy', category: 'gospel', file_type: 'mp3', file_url: '', uploaded_by: '2', uploaded_by_name: 'Mary Custodian', created_at: '2024-03-13' },
      { id: '4', title: 'Choral Practice Sheet', category: 'sheet', file_type: 'pdf', file_url: '', uploaded_by: '2', uploaded_by_name: 'Mary Custodian', created_at: '2024-03-12' },
    ];
    storage.set('music_files', files);
  }

  if (!storage.get('debts')) {
    const debts: Debt[] = [
      { id: '1', user_id: '4', amount: 500, type: 'registration', status: 'pending', recorded_by: '3', created_at: '2024-01-15' },
      { id: '2', user_id: '4', amount: 1200, type: 'uniform', status: 'pending', recorded_by: '3', created_at: '2024-01-15' },
      { id: '3', user_id: '4', amount: 800, type: 'trip', status: 'pending', recorded_by: '3', created_at: '2024-01-15' },
      { id: '4', user_id: '5', amount: 500, type: 'registration', status: 'paid', recorded_by: '3', created_at: '2024-01-15' },
    ];
    storage.set('debts', debts);
  }

  if (!storage.get('voice_notes')) storage.set('voice_notes', []);
  if (!storage.get('receipts')) storage.set('receipts', []);
  if (!storage.get('audit_logs')) storage.set('audit_logs', []);
  if (!storage.get('minutes')) storage.set('minutes', []);
if (!storage.get('receipts')) storage.set('receipts', []);
};
