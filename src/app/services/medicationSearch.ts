/**
 * Medication Search Service
 * 
 * Provides medication search functionality with fallback to manual entry.
 * 
 * FEATURES:
 * - Search by drug name, brand name, generic name
 * - Autocomplete suggestions
 * - Medication reference data
 * - Common strengths, routes, frequencies
 * - Fallback to manual entry
 * 
 * INTEGRATION:
 * - Would connect to external API (e.g., RxNorm, First Databank)
 * - Currently uses mock data for demonstration
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicationSearchResult {
  id: string;
  brandName: string;
  genericName: string;
  drugClass: string;
  commonStrengths: string[];
  commonRoutes: string[];
  commonFrequencies: string[];
  isHighRisk?: boolean;
  requiresMonitoring?: boolean;
  indications?: string[];
  warnings?: string[];
}

export interface MedicationToAdd {
  medicationId?: string; // From search result
  name: string; // Brand or generic
  genericName?: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  isPRN: boolean;
  prnReason?: string;
  startDate: string;
  prescribingPhysician: string;
  indication?: string;
  instructions?: string;
  endDate?: string;
  discontinueReason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK MEDICATION DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const MEDICATION_DATABASE: MedicationSearchResult[] = [
  {
    id: 'rx-001',
    brandName: 'Coumadin',
    genericName: 'Warfarin Sodium',
    drugClass: 'Anticoagulant',
    commonStrengths: ['1mg', '2mg', '2.5mg', '3mg', '4mg', '5mg', '6mg', '7.5mg', '10mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Once daily at 5pm', 'As directed'],
    isHighRisk: true,
    requiresMonitoring: true,
    indications: ['Atrial fibrillation', 'Deep vein thrombosis', 'Pulmonary embolism'],
    warnings: ['Requires INR monitoring', 'Bleeding risk', 'Drug interactions'],
  },
  {
    id: 'rx-002',
    brandName: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    drugClass: 'Antiplatelet',
    commonStrengths: ['81mg', '325mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Twice daily'],
    indications: ['Cardiovascular protection', 'Pain', 'Anti-inflammatory'],
    warnings: ['Bleeding risk', 'GI upset'],
  },
  {
    id: 'rx-003',
    brandName: 'Prinivil',
    genericName: 'Lisinopril',
    drugClass: 'ACE Inhibitor',
    commonStrengths: ['2.5mg', '5mg', '10mg', '20mg', '40mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Twice daily'],
    indications: ['Hypertension', 'Heart failure', 'Post-MI'],
    warnings: ['Monitor potassium', 'Cough', 'Angioedema risk'],
  },
  {
    id: 'rx-004',
    brandName: 'Lopressor',
    genericName: 'Metoprolol Tartrate',
    drugClass: 'Beta Blocker',
    commonStrengths: ['25mg', '50mg', '100mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Twice daily', 'Three times daily'],
    indications: ['Hypertension', 'Angina', 'Heart failure'],
    warnings: ['Monitor heart rate', 'Monitor blood pressure', 'Do not stop abruptly'],
  },
  {
    id: 'rx-005',
    brandName: 'Toprol XL',
    genericName: 'Metoprolol Succinate ER',
    drugClass: 'Beta Blocker',
    commonStrengths: ['25mg', '50mg', '100mg', '200mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily'],
    indications: ['Hypertension', 'Heart failure'],
    warnings: ['Monitor heart rate', 'Monitor blood pressure', 'Extended release - do not crush'],
  },
  {
    id: 'rx-006',
    brandName: 'Lasix',
    genericName: 'Furosemide',
    drugClass: 'Loop Diuretic',
    commonStrengths: ['20mg', '40mg', '80mg'],
    commonRoutes: ['Oral', 'IV'],
    commonFrequencies: ['Once daily', 'Twice daily', 'As needed'],
    indications: ['Fluid overload', 'Edema', 'Heart failure'],
    warnings: ['Monitor electrolytes', 'Monitor kidney function', 'May cause dehydration'],
  },
  {
    id: 'rx-007',
    brandName: 'Neurontin',
    genericName: 'Gabapentin',
    drugClass: 'Gabapentinoid',
    commonStrengths: ['100mg', '300mg', '400mg', '600mg', '800mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Three times daily', 'Twice daily', 'At bedtime'],
    indications: ['Neuropathic pain', 'Seizures', 'Postherpetic neuralgia'],
    warnings: ['May cause dizziness', 'Taper when discontinuing', 'Adjust for renal impairment'],
  },
  {
    id: 'rx-008',
    brandName: 'OxyContin',
    genericName: 'Oxycodone HCl',
    drugClass: 'Opioid Analgesic',
    commonStrengths: ['5mg', '10mg', '15mg', '20mg', '30mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Every 4 hours', 'Every 6 hours', 'Every 12 hours', 'As needed'],
    isHighRisk: true,
    indications: ['Moderate to severe pain'],
    warnings: ['Controlled substance', 'Addiction risk', 'Respiratory depression', 'Constipation'],
  },
  {
    id: 'rx-009',
    brandName: 'Norvasc',
    genericName: 'Amlodipine Besylate',
    drugClass: 'Calcium Channel Blocker',
    commonStrengths: ['2.5mg', '5mg', '10mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily'],
    indications: ['Hypertension', 'Angina'],
    warnings: ['May cause edema', 'Monitor blood pressure'],
  },
  {
    id: 'rx-010',
    brandName: 'Lipitor',
    genericName: 'Atorvastatin Calcium',
    drugClass: 'Statin',
    commonStrengths: ['10mg', '20mg', '40mg', '80mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Once daily at bedtime'],
    indications: ['Hyperlipidemia', 'Cardiovascular risk reduction'],
    warnings: ['Monitor liver function', 'Muscle pain/weakness', 'Avoid grapefruit juice'],
  },
  {
    id: 'rx-011',
    brandName: 'Glucophage',
    genericName: 'Metformin HCl',
    drugClass: 'Biguanide',
    commonStrengths: ['500mg', '850mg', '1000mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Twice daily with meals', 'Three times daily with meals'],
    indications: ['Type 2 diabetes'],
    warnings: ['GI side effects', 'Hold before contrast dye', 'Monitor kidney function'],
  },
  {
    id: 'rx-012',
    brandName: 'Tylenol',
    genericName: 'Acetaminophen',
    drugClass: 'Analgesic/Antipyretic',
    commonStrengths: ['325mg', '500mg', '650mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Every 4-6 hours as needed', 'Every 6 hours as needed'],
    indications: ['Pain', 'Fever'],
    warnings: ['Max 3000-4000mg/day', 'Liver toxicity risk'],
  },
  {
    id: 'rx-013',
    brandName: 'Zoloft',
    genericName: 'Sertraline HCl',
    drugClass: 'SSRI',
    commonStrengths: ['25mg', '50mg', '100mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Once daily in morning'],
    indications: ['Depression', 'Anxiety', 'OCD', 'PTSD'],
    warnings: ['Serotonin syndrome risk', 'Taper when discontinuing', 'Suicide risk monitoring'],
  },
  {
    id: 'rx-014',
    brandName: 'Xarelto',
    genericName: 'Rivaroxaban',
    drugClass: 'Anticoagulant (NOAC)',
    commonStrengths: ['10mg', '15mg', '20mg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily', 'Once daily with evening meal'],
    isHighRisk: true,
    indications: ['Atrial fibrillation', 'DVT/PE prevention'],
    warnings: ['Bleeding risk', 'No routine monitoring needed', 'Expensive'],
  },
  {
    id: 'rx-015',
    brandName: 'Synthroid',
    genericName: 'Levothyroxine Sodium',
    drugClass: 'Thyroid Hormone',
    commonStrengths: ['25mcg', '50mcg', '75mcg', '88mcg', '100mcg', '112mcg', '125mcg', '150mcg'],
    commonRoutes: ['Oral'],
    commonFrequencies: ['Once daily on empty stomach'],
    indications: ['Hypothyroidism'],
    warnings: ['Take 30-60 minutes before breakfast', 'Monitor TSH', 'Drug interactions'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMMON REFERENCE DATA
// ═══════════════════════════════════════════════════════════════════════════

export const COMMON_ROUTES = [
  'Oral',
  'Sublingual',
  'Buccal',
  'IV (Intravenous)',
  'IM (Intramuscular)',
  'SubQ (Subcutaneous)',
  'Topical',
  'Transdermal',
  'Rectal',
  'Vaginal',
  'Ophthalmic',
  'Otic',
  'Nasal',
  'Inhalation',
  'Nebulizer',
  'G-tube',
  'J-tube',
];

export const COMMON_FREQUENCIES = [
  'Once daily',
  'Once daily in morning',
  'Once daily at bedtime',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Every other day',
  'Weekly',
  'As needed',
  'As directed',
  'Before meals',
  'With meals',
  'After meals',
];

export const COMMON_PRN_REASONS = [
  'Pain',
  'Fever',
  'Nausea',
  'Anxiety',
  'Insomnia',
  'Constipation',
  'Diarrhea',
  'Shortness of breath',
  'Agitation',
  'Headache',
];

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION SEARCH SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class MedicationSearchService {
  /**
   * Search medications by name (brand, generic, or both)
   */
  search(query: string): MedicationSearchResult[] {
    if (!query || query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    return MEDICATION_DATABASE.filter(med => {
      const brandMatch = med.brandName.toLowerCase().includes(lowerQuery);
      const genericMatch = med.genericName.toLowerCase().includes(lowerQuery);
      const classMatch = med.drugClass.toLowerCase().includes(lowerQuery);
      
      return brandMatch || genericMatch || classMatch;
    }).slice(0, 20); // Limit to 20 results
  }

  /**
   * Get medication by ID
   */
  getById(id: string): MedicationSearchResult | undefined {
    return MEDICATION_DATABASE.find(med => med.id === id);
  }

  /**
   * Get autocomplete suggestions
   */
  getAutocompleteSuggestions(query: string): string[] {
    if (!query || query.length < 2) {
      return [];
    }

    const results = this.search(query);
    const suggestions: string[] = [];

    results.forEach(med => {
      suggestions.push(med.brandName);
      if (med.genericName !== med.brandName) {
        suggestions.push(med.genericName);
      }
    });

    return Array.from(new Set(suggestions)).slice(0, 10);
  }

  /**
   * Validate medication data before adding
   */
  validateMedication(medication: MedicationToAdd): string[] {
    const errors: string[] = [];

    if (!medication.name || medication.name.trim().length === 0) {
      errors.push('Medication name is required');
    }

    if (!medication.strength || medication.strength.trim().length === 0) {
      errors.push('Strength is required');
    }

    if (!medication.dose || medication.dose.trim().length === 0) {
      errors.push('Dose is required');
    }

    if (!medication.route || medication.route.trim().length === 0) {
      errors.push('Route is required');
    }

    if (!medication.frequency || medication.frequency.trim().length === 0) {
      errors.push('Frequency is required');
    }

    if (!medication.startDate) {
      errors.push('Start date is required');
    }

    if (!medication.prescribingPhysician || medication.prescribingPhysician.trim().length === 0) {
      errors.push('Prescribing physician is required');
    }

    if (medication.isPRN && !medication.prnReason) {
      errors.push('PRN reason is required for PRN medications');
    }

    return errors;
  }

  /**
   * Get common strengths for a medication
   */
  getCommonStrengths(medicationId?: string): string[] {
    if (!medicationId) {
      return ['25mg', '50mg', '100mg', '250mg', '500mg'];
    }

    const med = this.getById(medicationId);
    return med?.commonStrengths || [];
  }

  /**
   * Get common routes for a medication
   */
  getCommonRoutes(medicationId?: string): string[] {
    if (!medicationId) {
      return COMMON_ROUTES;
    }

    const med = this.getById(medicationId);
    return med?.commonRoutes || COMMON_ROUTES;
  }

  /**
   * Get common frequencies for a medication
   */
  getCommonFrequencies(medicationId?: string): string[] {
    if (!medicationId) {
      return COMMON_FREQUENCIES;
    }

    const med = this.getById(medicationId);
    return med?.commonFrequencies || COMMON_FREQUENCIES;
  }
}

// Singleton instance
export const medicationSearchService = new MedicationSearchService();

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format medication for display
 */
export function formatMedicationDisplay(med: MedicationToAdd): string {
  const parts = [
    med.name,
    med.strength,
    med.dose,
    med.route,
    med.frequency,
  ];

  if (med.isPRN) {
    parts.push(`PRN (${med.prnReason})`);
  }

  return parts.join(' • ');
}

/**
 * Check if medication is high-risk based on search result
 */
export function isHighRiskMedication(medicationId?: string): boolean {
  if (!medicationId) return false;
  
  const med = medicationSearchService.getById(medicationId);
  return med?.isHighRisk || false;
}

/**
 * Get medication warnings
 */
export function getMedicationWarnings(medicationId?: string): string[] {
  if (!medicationId) return [];
  
  const med = medicationSearchService.getById(medicationId);
  return med?.warnings || [];
}
