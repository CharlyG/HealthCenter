/**
 * Medication Alerts System
 * 
 * Comprehensive alert system for medication safety:
 * 
 * ALERT TYPES:
 * - Drug Interaction: Potential interaction between medications
 * - Duplicate Therapy: Multiple medications in same class
 * - Allergy Conflict: Medication matches patient allergy
 * - High-Risk Medication: Dangerous medication requiring monitoring
 * - Recently Changed: Medication changed in last 7 days
 * - Not Reconciled: Medication needs reconciliation
 * 
 * SEVERITY LEVELS:
 * - Critical: Immediate action required (life-threatening)
 * - High Priority: Urgent attention needed (significant risk)
 * - Warning: Review when possible (moderate concern)
 * - Informational: Awareness only (low risk)
 * 
 * INTEGRATION POINTS:
 * - Patient Medication Profile
 * - Admission Dashboard
 * - Visit Preparation Panel
 * - Assessment Workflows
 * - Medication Reconciliation
 * - Visit Documentation
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AlertType = 
  | 'drug-interaction'
  | 'duplicate-therapy'
  | 'allergy-conflict'
  | 'high-risk-medication'
  | 'recently-changed'
  | 'not-reconciled'
  | 'monitoring-required'
  | 'dosage-concern'
  | 'refill-needed';

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';

export interface MedicationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  suggestedAction: string;
  affectedMedicationIds: string[];
  affectedMedicationNames: string[];
  createdDate: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  metadata?: Record<string, any>;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  drugClass?: string;
  isHighRisk?: boolean;
  lastChangedDate?: string;
  isReconciled?: boolean;
  refillsRemaining?: number;
}

export interface Allergy {
  id: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  status: 'active' | 'inactive';
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION ALERT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class MedicationAlertService {
  /**
   * Generate all alerts for a given medication list
   */
  generateAlerts(
    medications: Medication[],
    allergies: Allergy[]
  ): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];

    // Check drug interactions
    alerts.push(...this.checkDrugInteractions(medications));

    // Check duplicate therapy
    alerts.push(...this.checkDuplicateTherapy(medications));

    // Check allergy conflicts
    alerts.push(...this.checkAllergyConflicts(medications, allergies));

    // Check high-risk medications
    alerts.push(...this.checkHighRiskMedications(medications));

    // Check recently changed medications
    alerts.push(...this.checkRecentlyChanged(medications));

    // Check reconciliation status
    alerts.push(...this.checkReconciliation(medications));

    // Check monitoring requirements
    alerts.push(...this.checkMonitoringRequired(medications));

    // Check refills
    alerts.push(...this.checkRefillsNeeded(medications));

    return alerts;
  }

  /**
   * Check for drug-drug interactions
   */
  private checkDrugInteractions(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    // Known dangerous combinations
    const interactions = [
      {
        drugs: ['Warfarin', 'Aspirin'],
        severity: 'high' as AlertSeverity,
        description: 'Increased risk of bleeding when warfarin is combined with aspirin',
        action: 'Monitor INR closely. Watch for signs of bleeding. Consider GI prophylaxis with PPI.',
      },
      {
        drugs: ['Lisinopril', 'Potassium'],
        severity: 'high' as AlertSeverity,
        description: 'ACE inhibitors can increase potassium levels, risk of hyperkalemia',
        action: 'Monitor serum potassium levels regularly. Consider reducing potassium supplementation.',
      },
      {
        drugs: ['Metoprolol', 'Diltiazem'],
        severity: 'warning' as AlertSeverity,
        description: 'Both medications lower heart rate and blood pressure',
        action: 'Monitor vital signs closely, especially heart rate and blood pressure.',
      },
      {
        drugs: ['Oxycodone', 'Gabapentin'],
        severity: 'high' as AlertSeverity,
        description: 'Increased risk of CNS depression and respiratory depression',
        action: 'Monitor for excessive sedation and respiratory depression. Start with lower doses.',
      },
      {
        drugs: ['Warfarin', 'Gabapentin'],
        severity: 'warning' as AlertSeverity,
        description: 'Gabapentin may affect warfarin anticoagulation',
        action: 'Monitor INR when starting or stopping gabapentin.',
      },
    ];

    interactions.forEach(interaction => {
      const affectedMeds = medications.filter(med =>
        interaction.drugs.some(drug =>
          med.name.toLowerCase().includes(drug.toLowerCase()) ||
          med.genericName?.toLowerCase().includes(drug.toLowerCase())
        )
      );

      if (affectedMeds.length >= 2) {
        alerts.push({
          id: `alert-interaction-${Date.now()}-${Math.random()}`,
          type: 'drug-interaction',
          severity: interaction.severity,
          title: 'Potential Drug Interaction',
          description: `${affectedMeds.map(m => m.name).join(' + ')}: ${interaction.description}`,
          suggestedAction: interaction.action,
          affectedMedicationIds: affectedMeds.map(m => m.id),
          affectedMedicationNames: affectedMeds.map(m => m.name),
          createdDate: new Date().toISOString(),
          status: 'active',
        });
      }
    });

    return alerts;
  }

  /**
   * Check for duplicate therapy (same drug class)
   */
  private checkDuplicateTherapy(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    // Group by drug class
    const byClass = new Map<string, Medication[]>();
    medications.forEach(med => {
      const drugClass = this.getDrugClass(med.name);
      if (drugClass !== 'unknown') {
        if (!byClass.has(drugClass)) {
          byClass.set(drugClass, []);
        }
        byClass.get(drugClass)!.push(med);
      }
    });

    // Check for duplicates
    byClass.forEach((meds, drugClass) => {
      if (meds.length > 1) {
        alerts.push({
          id: `alert-duplicate-${drugClass}-${Date.now()}`,
          type: 'duplicate-therapy',
          severity: 'warning',
          title: 'Potential Duplicate Therapy',
          description: `Patient is taking ${meds.length} medications in the ${drugClass} class: ${meds.map(m => m.name).join(', ')}`,
          suggestedAction: 'Review with physician to determine if multiple medications in the same class are clinically appropriate.',
          affectedMedicationIds: meds.map(m => m.id),
          affectedMedicationNames: meds.map(m => m.name),
          createdDate: new Date().toISOString(),
          status: 'active',
        });
      }
    });

    return alerts;
  }

  /**
   * Check for allergy conflicts
   */
  private checkAllergyConflicts(
    medications: Medication[],
    allergies: Allergy[]
  ): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    const activeAllergies = allergies.filter(a => a.status === 'active' && a.allergenType === 'medication');

    medications.forEach(med => {
      activeAllergies.forEach(allergy => {
        const medName = med.name.toLowerCase();
        const genericName = med.genericName?.toLowerCase() || '';
        const allergen = allergy.allergen.toLowerCase();

        if (medName.includes(allergen) || genericName.includes(allergen) || 
            allergen.includes(medName.split(' ')[0])) {
          
          const severity: AlertSeverity = 
            allergy.severity === 'life-threatening' ? 'critical' :
            allergy.severity === 'severe' ? 'high' :
            'warning';

          alerts.push({
            id: `alert-allergy-${med.id}-${allergy.id}`,
            type: 'allergy-conflict',
            severity,
            title: 'Allergy Conflict Detected',
            description: `Patient has documented ${allergy.severity} allergy to ${allergy.allergen}. Current medication ${med.name} may cause allergic reaction.`,
            suggestedAction: severity === 'critical' 
              ? 'DISCONTINUE IMMEDIATELY. Contact physician for alternative medication.'
              : 'Verify allergy with patient. Contact physician before administering. Consider alternative medication.',
            affectedMedicationIds: [med.id],
            affectedMedicationNames: [med.name],
            createdDate: new Date().toISOString(),
            status: 'active',
            metadata: {
              allergyId: allergy.id,
              allergySeverity: allergy.severity,
            },
          });
        }
      });
    });

    return alerts;
  }

  /**
   * Check for high-risk medications
   */
  private checkHighRiskMedications(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    const highRiskClasses = {
      anticoagulant: {
        monitoring: 'INR monitoring required. Target INR 2.0-3.0 for most indications.',
        risks: 'bleeding, hemorrhage',
      },
      opioid: {
        monitoring: 'Monitor for signs of oversedation, respiratory depression, and constipation.',
        risks: 'respiratory depression, addiction, overdose',
      },
      insulin: {
        monitoring: 'Blood glucose monitoring required. Watch for signs of hypoglycemia.',
        risks: 'hypoglycemia, hyperglycemia',
      },
    };

    medications.forEach(med => {
      if (med.isHighRisk) {
        const drugClass = this.getDrugClass(med.name).toLowerCase();
        const riskInfo = Object.entries(highRiskClasses).find(([key]) => 
          drugClass.includes(key)
        );

        if (riskInfo) {
          const [className, info] = riskInfo;
          alerts.push({
            id: `alert-highrisk-${med.id}`,
            type: 'high-risk-medication',
            severity: 'high',
            title: 'High-Risk Medication',
            description: `${med.name} is a high-risk ${className}. Requires close monitoring. Risks include: ${info.risks}.`,
            suggestedAction: info.monitoring,
            affectedMedicationIds: [med.id],
            affectedMedicationNames: [med.name],
            createdDate: new Date().toISOString(),
            status: 'active',
            metadata: {
              drugClass: className,
            },
          });
        }
      }
    });

    return alerts;
  }

  /**
   * Check for recently changed medications
   */
  private checkRecentlyChanged(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    medications.forEach(med => {
      if (med.lastChangedDate) {
        const changeDate = new Date(med.lastChangedDate);
        if (changeDate > sevenDaysAgo) {
          alerts.push({
            id: `alert-changed-${med.id}`,
            type: 'recently-changed',
            severity: 'info',
            title: 'Recently Changed Medication',
            description: `${med.name} was recently changed on ${changeDate.toLocaleDateString()}. Monitor for effectiveness and side effects.`,
            suggestedAction: 'Review patient response to medication change. Document any changes in symptoms or side effects.',
            affectedMedicationIds: [med.id],
            affectedMedicationNames: [med.name],
            createdDate: new Date().toISOString(),
            status: 'active',
            metadata: {
              changeDate: med.lastChangedDate,
            },
          });
        }
      }
    });

    return alerts;
  }

  /**
   * Check reconciliation status
   */
  private checkReconciliation(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    const unreconciled = medications.filter(m => m.isReconciled === false);
    
    if (unreconciled.length > 0) {
      alerts.push({
        id: `alert-reconciliation-${Date.now()}`,
        type: 'not-reconciled',
        severity: 'warning',
        title: 'Medication Reconciliation Required',
        description: `${unreconciled.length} medication${unreconciled.length > 1 ? 's' : ''} have not been reconciled: ${unreconciled.map(m => m.name).join(', ')}`,
        suggestedAction: 'Complete medication reconciliation to verify current medication regimen.',
        affectedMedicationIds: unreconciled.map(m => m.id),
        affectedMedicationNames: unreconciled.map(m => m.name),
        createdDate: new Date().toISOString(),
        status: 'active',
      });
    }

    return alerts;
  }

  /**
   * Check monitoring requirements
   */
  private checkMonitoringRequired(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    // Medications requiring lab monitoring
    const monitoringMeds = medications.filter(med => {
      const name = med.name.toLowerCase();
      return name.includes('warfarin') || 
             name.includes('lithium') ||
             name.includes('digoxin') ||
             name.includes('phenytoin');
    });

    monitoringMeds.forEach(med => {
      const monitoringType = 
        med.name.toLowerCase().includes('warfarin') ? 'INR' :
        med.name.toLowerCase().includes('lithium') ? 'Lithium level' :
        med.name.toLowerCase().includes('digoxin') ? 'Digoxin level' :
        'Therapeutic drug level';

      alerts.push({
        id: `alert-monitoring-${med.id}`,
        type: 'monitoring-required',
        severity: 'warning',
        title: 'Lab Monitoring Required',
        description: `${med.name} requires regular ${monitoringType} monitoring to ensure therapeutic levels and prevent toxicity.`,
        suggestedAction: `Ensure ${monitoringType} is monitored per protocol. Review most recent lab results.`,
        affectedMedicationIds: [med.id],
        affectedMedicationNames: [med.name],
        createdDate: new Date().toISOString(),
        status: 'active',
      });
    });

    return alerts;
  }

  /**
   * Check refill needs
   */
  private checkRefillsNeeded(medications: Medication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    medications.forEach(med => {
      if (med.refillsRemaining !== undefined && med.refillsRemaining === 0) {
        alerts.push({
          id: `alert-refill-${med.id}`,
          type: 'refill-needed',
          severity: 'info',
          title: 'Refill Needed',
          description: `${med.name} has no refills remaining. Patient may run out of medication.`,
          suggestedAction: 'Contact physician for refill authorization. Ensure patient has adequate supply.',
          affectedMedicationIds: [med.id],
          affectedMedicationNames: [med.name],
          createdDate: new Date().toISOString(),
          status: 'active',
        });
      }
    });

    return alerts;
  }

  /**
   * Helper: Get drug class from medication name
   */
  private getDrugClass(medicationName: string): string {
    const name = medicationName.toLowerCase();
    
    if (name.includes('warfarin') || name.includes('coumadin')) return 'anticoagulant';
    if (name.includes('insulin')) return 'insulin';
    if (name.includes('metformin') || name.includes('glipizide') || name.includes('glyburide')) 
      return 'hypoglycemic';
    if (name.includes('oxycodone') || name.includes('morphine') || name.includes('hydrocodone')) 
      return 'opioid';
    if (name.includes('lisinopril') || name.includes('enalapril') || name.includes('ramipril')) 
      return 'ace-inhibitor';
    if (name.includes('metoprolol') || name.includes('atenolol') || name.includes('carvedilol')) 
      return 'beta-blocker';
    if (name.includes('amlodipine') || name.includes('nifedipine') || name.includes('diltiazem')) 
      return 'calcium-channel-blocker';
    if (name.includes('atorvastatin') || name.includes('simvastatin') || name.includes('rosuvastatin')) 
      return 'statin';
    if (name.includes('furosemide') || name.includes('bumetanide')) 
      return 'loop-diuretic';
    if (name.includes('hydrochlorothiazide') || name.includes('chlorthalidone')) 
      return 'thiazide-diuretic';
    if (name.includes('gabapentin') || name.includes('pregabalin')) 
      return 'gabapentinoid';
    if (name.includes('sertraline') || name.includes('fluoxetine') || name.includes('escitalopram')) 
      return 'ssri';
    
    return 'unknown';
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alert: MedicationAlert, acknowledgedBy: string): MedicationAlert {
    return {
      ...alert,
      status: 'acknowledged',
      acknowledgedBy,
      acknowledgedDate: new Date().toISOString(),
    };
  }

  /**
   * Resolve an alert
   */
  resolveAlert(
    alert: MedicationAlert, 
    resolvedBy: string, 
    notes: string
  ): MedicationAlert {
    return {
      ...alert,
      status: 'resolved',
      resolvedBy,
      resolvedDate: new Date().toISOString(),
      resolutionNotes: notes,
    };
  }

  /**
   * Filter alerts by severity
   */
  filterBySeverity(alerts: MedicationAlert[], severity: AlertSeverity): MedicationAlert[] {
    return alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Get alert count by severity
   */
  getAlertCounts(alerts: MedicationAlert[]) {
    return {
      critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
      warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
      info: alerts.filter(a => a.severity === 'info' && a.status === 'active').length,
      total: alerts.filter(a => a.status === 'active').length,
    };
  }
}

// Singleton instance
export const medicationAlertService = new MedicationAlertService();

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const ALERT_SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'red',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
    badgeColor: 'bg-red-600 text-white',
    description: 'Immediate action required - potentially life-threatening',
  },
  high: {
    label: 'High Priority',
    color: 'orange',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-900',
    iconColor: 'text-orange-600',
    badgeColor: 'bg-orange-600 text-white',
    description: 'Urgent attention needed - significant risk',
  },
  warning: {
    label: 'Warning',
    color: 'amber',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Review when possible - moderate concern',
  },
  info: {
    label: 'Informational',
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Awareness only - low risk',
  },
} as const;

export const ALERT_TYPE_CONFIG = {
  'drug-interaction': {
    label: 'Drug Interaction',
    description: 'Potential interaction between medications',
  },
  'duplicate-therapy': {
    label: 'Duplicate Therapy',
    description: 'Multiple medications in same class',
  },
  'allergy-conflict': {
    label: 'Allergy Conflict',
    description: 'Medication matches patient allergy',
  },
  'high-risk-medication': {
    label: 'High-Risk Medication',
    description: 'Dangerous medication requiring monitoring',
  },
  'recently-changed': {
    label: 'Recently Changed',
    description: 'Medication changed in last 7 days',
  },
  'not-reconciled': {
    label: 'Not Reconciled',
    description: 'Medication needs reconciliation',
  },
  'monitoring-required': {
    label: 'Monitoring Required',
    description: 'Lab monitoring needed',
  },
  'dosage-concern': {
    label: 'Dosage Concern',
    description: 'Potential dosage issue',
  },
  'refill-needed': {
    label: 'Refill Needed',
    description: 'No refills remaining',
  },
} as const;
