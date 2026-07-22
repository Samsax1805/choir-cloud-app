export type UserRole = 'president' | 'custodian' | 'secretary' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  created_at: string;
}

export type Category = 'hymns' | 'gospel' | 'practice' | 'sheet';
export type FileType = 'mp3' | 'pdf' | 'wav';

export interface MusicFile {
  id: string;
  title: string;
  category: Category;
  file_type: FileType;
  file_url: string;
  file_data?: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export type DebtType = 'registration' | 'uniform' | 'trip' | 'payment' | 'refund' | 'adjustment';
export type DebtStatus = 'pending' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  user_id: string;
  amount: number;
  type: DebtType;
  status: DebtStatus;
  recorded_by: string;
  created_at: string;
}

export interface VoiceNote {
  id: string;
  title: string;
  audio_url: string;
  audio_data?: string;
  recorded_by: string;
  recorded_by_name: string;
  created_at: string;
}

export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface Receipt {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  title?: string;  // Optional property for receipts
  file_url: string;
  file_data?: string;
  status: ReceiptStatus;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
}

export interface Minutes {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  file_url: string;
  file_data?: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'SIGNUP'
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'UPLOAD' | 'DOWNLOAD'
  | 'ROLE_CHANGE' | 'FAILED_LOGIN';

export type EntityType =
  | 'users' 
  | 'music_files' 
  | 'debts'
  | 'voice_notes' 
  | 'receipts'
  | 'minutes'  // This is the key addition
  | 'auth';

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export type Currency = 'TRY' | 'USD';
export type View = 'dashboard' | 'music' | 'debts' | 'voice' | 'audit' | 'admin' | 'minutes';