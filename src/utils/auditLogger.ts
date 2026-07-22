import { storage } from './storage';
import type { User, AuditLog, AuditAction, EntityType } from '../types';

export const logAudit = (
  user: User | null,
  action: AuditAction,
  entity_type: EntityType,
  entity_id?: string,
  details?: any
) => {
  const logs = storage.get<AuditLog[]>('audit_logs') || [];
  const entry: AuditLog = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    user_id: user?.id || 'anonymous',
    user_name: user?.name || 'Unknown',
    user_email: user?.email || 'unknown@choir.org',
    action,
    entity_type,
    entity_id,
    details,
    created_at: new Date().toISOString(),
  };
  storage.set('audit_logs', [entry, ...logs]);
};