/**
 * Medication Timeline Service
 * 
 * Tracks and displays medication events during episode of care.
 * 
 * EVENT TYPES:
 * - Medication Added
 * - Medication Discontinued
 * - Dose Changed
 * - Medication Reconciliation Completed
 * - Medication Alert Resolved
 * - Route Changed
 * - Frequency Changed
 * - PRN Status Changed
 * - Refill Authorized
 * 
 * FEATURES:
 * - Chronological timeline
 * - Event grouping by date
 * - Filter by event type
 * - User tracking
 * - Detailed event information
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MedicationEventType =
  | 'medication-added'
  | 'medication-discontinued'
  | 'dose-changed'
  | 'route-changed'
  | 'frequency-changed'
  | 'reconciliation-completed'
  | 'alert-resolved'
  | 'prn-status-changed'
  | 'refill-authorized'
  | 'strength-changed'
  | 'physician-changed'
  | 'medication-resumed';

export interface MedicationEvent {
  id: string;
  type: MedicationEventType;
  timestamp: string;
  medicationName: string;
  medicationId: string;
  user: string;
  userRole: string;
  description: string;
  details?: MedicationEventDetails;
  relatedAlertId?: string;
  relatedReconciliationId?: string;
}

export interface MedicationEventDetails {
  // For changes
  previousValue?: string;
  newValue?: string;
  
  // For additions
  strength?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  indication?: string;
  prescribingPhysician?: string;
  
  // For discontinuations
  reason?: string;
  
  // For reconciliation
  reconciliationType?: 'admission' | 'transfer' | 'discharge';
  medicationsReviewed?: number;
  discrepanciesFound?: number;
  
  // For alerts
  alertType?: string;
  alertSeverity?: string;
  resolutionNotes?: string;
  
  // Additional context
  notes?: string;
}

export interface TimelineGrouping {
  date: string;
  events: MedicationEvent[];
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const MEDICATION_EVENT_CONFIG = {
  'medication-added': {
    label: 'Medication Added',
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    description: 'New medication added to patient profile',
  },
  'medication-discontinued': {
    label: 'Medication Discontinued',
    color: 'red',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
    description: 'Medication removed from active list',
  },
  'dose-changed': {
    label: 'Dose Changed',
    color: 'orange',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    description: 'Medication dose modified',
  },
  'route-changed': {
    label: 'Route Changed',
    color: 'orange',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    description: 'Administration route modified',
  },
  'frequency-changed': {
    label: 'Frequency Changed',
    color: 'orange',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    description: 'Dosing frequency modified',
  },
  'reconciliation-completed': {
    label: 'Reconciliation Completed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    description: 'Medication reconciliation performed',
  },
  'alert-resolved': {
    label: 'Alert Resolved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-900',
    iconColor: 'text-purple-600',
    description: 'Medication alert addressed and resolved',
  },
  'prn-status-changed': {
    label: 'PRN Status Changed',
    color: 'amber',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
    description: 'PRN status modified',
  },
  'refill-authorized': {
    label: 'Refill Authorized',
    color: 'teal',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-900',
    iconColor: 'text-teal-600',
    description: 'Prescription refill authorized',
  },
  'strength-changed': {
    label: 'Strength Changed',
    color: 'orange',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    description: 'Medication strength modified',
  },
  'physician-changed': {
    label: 'Physician Changed',
    color: 'gray',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-900',
    iconColor: 'text-gray-600',
    description: 'Prescribing physician changed',
  },
  'medication-resumed': {
    label: 'Medication Resumed',
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
    description: 'Previously discontinued medication resumed',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION TIMELINE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class MedicationTimelineService {
  /**
   * Group events by date
   */
  groupEventsByDate(events: MedicationEvent[]): TimelineGrouping[] {
    const groups = new Map<string, MedicationEvent[]>();

    events.forEach(event => {
      const date = new Date(event.timestamp).toDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(event);
    });

    // Convert to array and sort by date (most recent first)
    const groupings: TimelineGrouping[] = Array.from(groups.entries())
      .map(([date, events]) => ({
        date,
        events: events.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      }))
      .sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    return groupings;
  }

  /**
   * Filter events by type
   */
  filterByType(
    events: MedicationEvent[],
    types: MedicationEventType[]
  ): MedicationEvent[] {
    if (types.length === 0) return events;
    return events.filter(event => types.includes(event.type));
  }

  /**
   * Filter events by medication
   */
  filterByMedication(
    events: MedicationEvent[],
    medicationId: string
  ): MedicationEvent[] {
    return events.filter(event => event.medicationId === medicationId);
  }

  /**
   * Filter events by date range
   */
  filterByDateRange(
    events: MedicationEvent[],
    startDate: Date,
    endDate: Date
  ): MedicationEvent[] {
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  /**
   * Get event summary statistics
   */
  getEventStats(events: MedicationEvent[]) {
    const stats = {
      total: events.length,
      byType: {} as Record<MedicationEventType, number>,
      byMedication: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
    };

    events.forEach(event => {
      // By type
      if (!stats.byType[event.type]) {
        stats.byType[event.type] = 0;
      }
      stats.byType[event.type]++;

      // By medication
      if (!stats.byMedication[event.medicationName]) {
        stats.byMedication[event.medicationName] = 0;
      }
      stats.byMedication[event.medicationName]++;

      // By user
      if (!stats.byUser[event.user]) {
        stats.byUser[event.user] = 0;
      }
      stats.byUser[event.user]++;
    });

    return stats;
  }

  /**
   * Create medication added event
   */
  createAddedEvent(
    medicationId: string,
    medicationName: string,
    user: string,
    userRole: string,
    details: MedicationEventDetails
  ): MedicationEvent {
    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'medication-added',
      timestamp: new Date().toISOString(),
      medicationName,
      medicationId,
      user,
      userRole,
      description: `${medicationName} ${details.strength} added by ${user}`,
      details,
    };
  }

  /**
   * Create medication discontinued event
   */
  createDiscontinuedEvent(
    medicationId: string,
    medicationName: string,
    user: string,
    userRole: string,
    reason: string
  ): MedicationEvent {
    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'medication-discontinued',
      timestamp: new Date().toISOString(),
      medicationName,
      medicationId,
      user,
      userRole,
      description: `${medicationName} discontinued - ${reason}`,
      details: { reason },
    };
  }

  /**
   * Create dose change event
   */
  createDoseChangeEvent(
    medicationId: string,
    medicationName: string,
    user: string,
    userRole: string,
    previousDose: string,
    newDose: string
  ): MedicationEvent {
    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'dose-changed',
      timestamp: new Date().toISOString(),
      medicationName,
      medicationId,
      user,
      userRole,
      description: `${medicationName} dose changed from ${previousDose} to ${newDose}`,
      details: {
        previousValue: previousDose,
        newValue: newDose,
      },
    };
  }

  /**
   * Create reconciliation event
   */
  createReconciliationEvent(
    user: string,
    userRole: string,
    reconciliationType: 'admission' | 'transfer' | 'discharge',
    medicationsReviewed: number,
    discrepanciesFound: number
  ): MedicationEvent {
    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'reconciliation-completed',
      timestamp: new Date().toISOString(),
      medicationName: 'All Medications',
      medicationId: 'all',
      user,
      userRole,
      description: `${reconciliationType.charAt(0).toUpperCase() + reconciliationType.slice(1)} reconciliation completed - ${medicationsReviewed} medications reviewed, ${discrepanciesFound} discrepancies found`,
      details: {
        reconciliationType,
        medicationsReviewed,
        discrepanciesFound,
      },
    };
  }

  /**
   * Create alert resolved event
   */
  createAlertResolvedEvent(
    medicationId: string,
    medicationName: string,
    user: string,
    userRole: string,
    alertType: string,
    alertSeverity: string,
    resolutionNotes: string
  ): MedicationEvent {
    return {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'alert-resolved',
      timestamp: new Date().toISOString(),
      medicationName,
      medicationId,
      user,
      userRole,
      description: `${alertSeverity} ${alertType} alert resolved for ${medicationName}`,
      details: {
        alertType,
        alertSeverity,
        resolutionNotes,
      },
    };
  }
}

// Singleton instance
export const medicationTimelineService = new MedicationTimelineService();

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_MEDICATION_EVENTS: MedicationEvent[] = [
  {
    id: 'event-001',
    type: 'reconciliation-completed',
    timestamp: '2024-03-01T09:30:00Z',
    medicationName: 'All Medications',
    medicationId: 'all',
    user: 'Jennifer Lee, RN',
    userRole: 'Registered Nurse',
    description: 'Admission reconciliation completed - 8 medications reviewed, 2 discrepancies found',
    details: {
      reconciliationType: 'admission',
      medicationsReviewed: 8,
      discrepanciesFound: 2,
    },
  },
  {
    id: 'event-002',
    type: 'medication-added',
    timestamp: '2024-03-01T10:15:00Z',
    medicationName: 'Warfarin Sodium',
    medicationId: 'med-001',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Warfarin Sodium 5mg added by Dr. Sarah Johnson',
    details: {
      strength: '5mg',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Once daily at 5pm',
      indication: 'Atrial fibrillation',
      prescribingPhysician: 'Dr. Sarah Johnson',
    },
  },
  {
    id: 'event-003',
    type: 'alert-resolved',
    timestamp: '2024-03-01T10:20:00Z',
    medicationName: 'Warfarin Sodium',
    medicationId: 'med-001',
    user: 'Jennifer Lee, RN',
    userRole: 'Registered Nurse',
    description: 'High drug interaction alert resolved for Warfarin Sodium',
    details: {
      alertType: 'Drug Interaction',
      alertSeverity: 'High',
      resolutionNotes: 'Discussed with physician. Patient will be monitored closely for bleeding. INR monitoring scheduled.',
    },
    relatedAlertId: 'alert-001',
  },
  {
    id: 'event-004',
    type: 'medication-added',
    timestamp: '2024-03-02T11:00:00Z',
    medicationName: 'Gabapentin',
    medicationId: 'med-002',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Gabapentin 300mg added by Dr. Sarah Johnson',
    details: {
      strength: '300mg',
      dose: '1 capsule',
      route: 'Oral',
      frequency: 'Twice daily',
      indication: 'Neuropathic pain',
      prescribingPhysician: 'Dr. Sarah Johnson',
    },
  },
  {
    id: 'event-005',
    type: 'dose-changed',
    timestamp: '2024-03-05T14:30:00Z',
    medicationName: 'Gabapentin',
    medicationId: 'med-002',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Gabapentin dose changed from 1 capsule to 2 capsules',
    details: {
      previousValue: '1 capsule',
      newValue: '2 capsules',
      notes: 'Increased dose for better pain control',
    },
  },
  {
    id: 'event-006',
    type: 'medication-discontinued',
    timestamp: '2024-03-07T09:00:00Z',
    medicationName: 'Oxycodone HCl',
    medicationId: 'med-003',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Oxycodone HCl discontinued - Pain adequately controlled with gabapentin',
    details: {
      reason: 'Pain adequately controlled with gabapentin',
    },
  },
  {
    id: 'event-007',
    type: 'medication-added',
    timestamp: '2024-03-08T10:45:00Z',
    medicationName: 'Furosemide',
    medicationId: 'med-004',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Furosemide 40mg added by Dr. Sarah Johnson',
    details: {
      strength: '40mg',
      dose: '1 tablet',
      route: 'Oral',
      frequency: 'Once daily',
      indication: 'Fluid overload',
      prescribingPhysician: 'Dr. Sarah Johnson',
    },
  },
  {
    id: 'event-008',
    type: 'frequency-changed',
    timestamp: '2024-03-09T15:20:00Z',
    medicationName: 'Furosemide',
    medicationId: 'med-004',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Furosemide frequency changed from Once daily to Twice daily',
    details: {
      previousValue: 'Once daily',
      newValue: 'Twice daily',
      notes: 'Increased frequency for better fluid management',
    },
  },
  {
    id: 'event-009',
    type: 'refill-authorized',
    timestamp: '2024-03-10T11:00:00Z',
    medicationName: 'Warfarin Sodium',
    medicationId: 'med-001',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Warfarin Sodium refill authorized - 90 day supply',
    details: {
      notes: '90 day supply with 3 refills',
    },
  },
  {
    id: 'event-010',
    type: 'strength-changed',
    timestamp: '2024-03-12T13:30:00Z',
    medicationName: 'Warfarin Sodium',
    medicationId: 'med-001',
    user: 'Dr. Sarah Johnson',
    userRole: 'Physician',
    description: 'Warfarin Sodium strength changed from 5mg to 7.5mg',
    details: {
      previousValue: '5mg',
      newValue: '7.5mg',
      notes: 'Adjusted based on INR results',
    },
  },
];
