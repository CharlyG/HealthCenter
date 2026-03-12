/**
 * Care Team Collaboration Types
 * Types for the patient-centric internal communication system.
 * Designed for .NET 8 API migration — all types map to C# models.
 */

// ─── Team Member ────────────────────────────────────────────────────────────

export type TeamRole =
  | 'primary_nurse'
  | 'therapist_pt'
  | 'therapist_ot'
  | 'therapist_st'
  | 'social_worker'
  | 'medical_director'
  | 'care_coordinator'
  | 'aide';

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  primary_nurse: 'Primary Nurse',
  therapist_pt: 'Physical Therapist',
  therapist_ot: 'Occupational Therapist',
  therapist_st: 'Speech Therapist',
  social_worker: 'Social Worker',
  medical_director: 'Medical Director',
  care_coordinator: 'Care Coordinator',
  aide: 'Home Health Aide',
};

export const TEAM_ROLE_ABBREV: Record<TeamRole, string> = {
  primary_nurse: 'RN',
  therapist_pt: 'PT',
  therapist_ot: 'OT',
  therapist_st: 'ST',
  social_worker: 'MSW',
  medical_director: 'MD',
  care_coordinator: 'CC',
  aide: 'HHA',
};

export interface CareTeamMember {
  id: string;
  name: string;
  role: TeamRole;
  discipline: string;
  phone: string;
  email: string;
  avatarColor: string;
  status: 'active' | 'on_leave' | 'unavailable';
  isPrimary: boolean;
}

// ─── Collaboration Message ──────────────────────────────────────────────────

export type MessageType = 'note' | 'update' | 'document' | 'task_created' | 'task_completed' | 'escalation';

export interface MessageMention {
  memberId: string;
  memberName: string;
}

export interface SharedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface CollaborationMessage {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: TeamRole;
  type: MessageType;
  content: string;
  mentions: MessageMention[];
  document?: SharedDocument;
  taskId?: string;
  isPinned: boolean;
  isUrgent: boolean;
  createdAt: string;
  editedAt?: string;
}

// ─── Care Coordination Task ────────────────────────────────────────────────

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface CareTask {
  id: string;
  patientId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeRole: TeamRole;
  createdById: string;
  createdByName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

// ─── Full Collaboration Data ────────────────────────────────────────────────

export interface CollaborationData {
  team: CareTeamMember[];
  messages: CollaborationMessage[];
  tasks: CareTask[];
  pinnedMessages: CollaborationMessage[];
}
