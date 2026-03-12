/**
 * AI Clinical Assistant Types
 * Types for the intelligent clinical support system.
 * Designed for .NET 8 API migration — all types map to C# models.
 */

// ─── Insight Category ───────────────────────────────────────────────────────

export type InsightCategory =
  | 'history_summary'
  | 'clinical_change'
  | 'documentation_gap'
  | 'risk_flag'
  | 'care_suggestion'
  | 'medication_alert'
  | 'coordination_note';

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  history_summary: 'Patient Summary',
  clinical_change: 'Clinical Change',
  documentation_gap: 'Documentation Gap',
  risk_flag: 'Risk Flag',
  care_suggestion: 'Care Suggestion',
  medication_alert: 'Medication Alert',
  coordination_note: 'Coordination',
};

// ─── Insight Severity ───────────────────────────────────────────────────────

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';

// ─── Clinical Insight ───────────────────────────────────────────────────────

export interface ClinicalInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  body: string;
  evidence: string[];
  suggestedAction?: string;
  actionRoute?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  confidence: number; // 0–1
  generatedAt: string;
}

// ─── Patient Context (sent to server for analysis) ─────────────────────────

export interface PatientContext {
  patientId: string;
  patientName: string;
  age: number;
  diagnoses: string[];
  currentSection?: string;
}

// ─── Conversation Message ───────────────────────────────────────────────────

export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
  insights?: ClinicalInsight[];
  isLoading?: boolean;
}

// ─── Quick Action ───────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: InsightCategory;
}

// ─── Full Assistant Response ────────────────────────────────────────────────

export interface AssistantAnalysis {
  insights: ClinicalInsight[];
  patientSummary: string;
  topConcerns: string[];
  generatedAt: string;
}

export interface AssistantAskResponse {
  answer: string;
  insights: ClinicalInsight[];
  confidence: number;
  sources: string[];
}
