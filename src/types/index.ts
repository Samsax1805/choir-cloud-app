export type UserRole = 'president' | 'provost' | 'custodian' | 'secretary' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  birthdate?: string;
  approved: boolean;
  created_at: string;
}

export interface AccountRequest {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  birthdate?: string;
  status: 'pending' | 'approved' | 'rejected';
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

export type DebtType = 'registration' | 'uniform' | 'trip' | 'payment' | 'refund' | 'adjustment' | 'bulk_upload';
export type DebtStatus = 'pending' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  user_id: string;
  user_name?: string;
  amount: number;
  type: DebtType;
  status: DebtStatus;
  recorded_by: string;
  uploaded_by_name?: string;
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
  title?: string;
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

export type DayType = 'thursday' | 'saturday';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  day_type: DayType;
  session_date: string;
  session_code: string;
  generated_by: string;
  generated_by_name: string;
  generated_at: string;
  expires_at: string;
  is_active: boolean;
  qr_data_url?: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  status: AttendanceStatus;
  marked_by: string;
  marked_by_name: string;
  marked_at: string;
  method: 'qr_scan' | 'manual' | 'self_checkin';
}

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'ACCOUNT_APPROVED' | 'ACCOUNT_REJECTED'
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'UPLOAD' | 'DOWNLOAD'
  | 'ROLE_CHANGE' | 'FAILED_LOGIN'
  | 'ATTENDANCE_MARKED' | 'SESSION_GENERATED';

export type EntityType =
  | 'users' | 'music_files' | 'debts' | 'voice_notes' 
  | 'receipts' | 'minutes' | 'attendance' | 'account_requests' | 'auth';

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
export type View = 'dashboard' | 'music' | 'debts' | 'voice' | 'audit' | 'admin' | 'minutes' | 'attendance';
