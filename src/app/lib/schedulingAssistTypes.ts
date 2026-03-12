/**
 * Smart Scheduling Assist Types
 * Shared type definitions for the scheduling intelligence system.
 * Designed for .NET 8 API migration -- all types map cleanly to C# models.
 */

// ─── Caregiver Candidate ────────────────────────────────────────────────────

export interface CaregiverCandidate {
  caregiverId: string;
  caregiverName: string;
  discipline: string;
  zone: string;
  currentDayVisits: number;
  maxDailyVisits: number;
  proximityScore: number;
  reliabilityScore: number;
  rating: number;
  overallScore: number;
  reasons: string[];
}

// ─── Caregiver Assignment Suggestion ────────────────────────────────────────

export interface CaregiverAssignment {
  visitId: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  discipline: string;
  visitType: string;
  patientName: string;
  patientId: string;
  patientZone: string;
  topCandidates: CaregiverCandidate[];
}

// ─── Travel Route Stop ─────────────────────────────────────────────────────

export interface RouteStop {
  visitId: string;
  patientName: string;
  time: string;
  zone: string;
}

// ─── Travel Optimization Suggestion ─────────────────────────────────────────

export interface TravelOptimization {
  caregiverId: string;
  caregiverName: string;
  currentRoute: RouteStop[];
  suggestedRoute: RouteStop[];
  currentTravelScore: number;
  optimizedTravelScore: number;
  estimatedSavingsMinutes: number;
}

// ─── Visit Risk Alert ───────────────────────────────────────────────────────

export interface VisitRiskAlert {
  visitId: string;
  visitDate: string;
  startTime: string;
  patientName: string;
  patientId: string;
  caregiverName: string;
  caregiverId: string;
  discipline: string;
  riskScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  suggestedAction: string;
}

// ─── Open Shift Notify Candidate ────────────────────────────────────────────

export interface OpenShiftCandidate {
  caregiverId: string;
  caregiverName: string;
  discipline: string;
  zone: string;
  proximity: number;
  currentDayVisits: number;
  maxDailyVisits: number;
  rating: number;
  notifyPriority: 'high' | 'medium' | 'low';
}

// ─── Open Shift Suggestion ──────────────────────────────────────────────────

export interface OpenShiftSuggestion {
  visitId: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  discipline: string;
  visitType: string;
  patientName: string;
  patientZone: string;
  suggestedNotifyList: OpenShiftCandidate[];
}

// ─── Summary ────────────────────────────────────────────────────────────────

export interface SmartAssistSummary {
  totalSuggestions: number;
  unassignedVisits: number;
  travelOptimizable: number;
  atRiskVisits: number;
  openShifts: number;
}

// ─── Full Response ──────────────────────────────────────────────────────────

export interface SmartAssistData {
  date: string;
  generatedAt: string;
  caregiverAssignments: CaregiverAssignment[];
  travelOptimizations: TravelOptimization[];
  visitRiskAlerts: VisitRiskAlert[];
  openShiftSuggestions: OpenShiftSuggestion[];
  summary: SmartAssistSummary;
}
