/**
 * Clinical Document Validation System
 * 
 * Comprehensive validation engine for clinical documentation
 * Validates required fields, data types, ranges, and business rules
 */

import { FormValues } from './documentationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  id: string;
  severity: ValidationSeverity;
  fieldId: string;
  fieldLabel: string;
  sectionId: string;
  sectionTitle: string;
  message: string;
  suggestion?: string;
  rule: string;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  errorsBySectionId: Record<string, ValidationError[]>;
  canSubmit: boolean;
}

export interface FieldValidationRule {
  fieldId: string;
  fieldLabel: string;
  sectionId: string;
  sectionTitle: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any, allValues: FormValues) => string | null;
  dependsOn?: string; // Field ID this depends on
  requiredIf?: (allValues: FormValues) => boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class DocumentValidator {
  private rules: FieldValidationRule[];

  constructor(rules: FieldValidationRule[]) {
    this.rules = rules;
  }

  validate(values: FormValues): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    this.rules.forEach(rule => {
      const value = values[rule.fieldId];
      
      // Check if field is required (conditionally or always)
      const isRequired = rule.required || (rule.requiredIf && rule.requiredIf(values));
      
      if (isRequired && this.isEmpty(value)) {
        errors.push(this.createError(
          rule,
          'error',
          'required_field',
          `${rule.fieldLabel} is required`,
          'Please provide a value for this field'
        ));
        return;
      }

      // Skip other validations if field is empty and not required
      if (this.isEmpty(value) && !isRequired) {
        return;
      }

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(this.createError(
            rule,
            'error',
            'min_length',
            `${rule.fieldLabel} must be at least ${rule.minLength} characters`,
            `Current length: ${value.length}. Please add ${rule.minLength - value.length} more characters.`
          ));
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(this.createError(
            rule,
            'error',
            'max_length',
            `${rule.fieldLabel} exceeds maximum length of ${rule.maxLength} characters`,
            `Current length: ${value.length}. Please remove ${value.length - rule.maxLength} characters.`
          ));
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(this.createError(
            rule,
            'error',
            'invalid_format',
            `${rule.fieldLabel} has an invalid format`,
            'Please check the format and try again'
          ));
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(this.createError(
            rule,
            'error',
            'min_value',
            `${rule.fieldLabel} must be at least ${rule.min}`,
            `Current value: ${value}. Minimum allowed: ${rule.min}`
          ));
        }

        if (rule.max !== undefined && value > rule.max) {
          errors.push(this.createError(
            rule,
            'error',
            'max_value',
            `${rule.fieldLabel} must be at most ${rule.max}`,
            `Current value: ${value}. Maximum allowed: ${rule.max}`
          ));
        }
      }

      // Custom validator
      if (rule.customValidator) {
        const customError = rule.customValidator(value, values);
        if (customError) {
          errors.push(this.createError(
            rule,
            'error',
            'custom_validation',
            customError,
            'Please review and correct this field'
          ));
        }
      }
    });

    // Group errors by section
    const errorsBySectionId: Record<string, ValidationError[]> = {};
    [...errors, ...warnings, ...infos].forEach(error => {
      if (!errorsBySectionId[error.sectionId]) {
        errorsBySectionId[error.sectionId] = [];
      }
      errorsBySectionId[error.sectionId].push(error);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      infos,
      errorCount: errors.length,
      warningCount: warnings.length,
      infoCount: infos.length,
      errorsBySectionId,
      canSubmit: errors.length === 0,
    };
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  private createError(
    rule: FieldValidationRule,
    severity: ValidationSeverity,
    ruleType: string,
    message: string,
    suggestion?: string
  ): ValidationError {
    return {
      id: `${rule.fieldId}-${ruleType}-${Date.now()}`,
      severity,
      fieldId: rule.fieldId,
      fieldLabel: rule.fieldLabel,
      sectionId: rule.sectionId,
      sectionTitle: rule.sectionTitle,
      message,
      suggestion,
      rule: ruleType,
      timestamp: new Date().toISOString(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const commonValidators = {
  // Medicare number validation (example format: 1AB2CD3EF45)
  medicareNumber: (value: string): string | null => {
    const pattern = /^[0-9]{1}[A-Z]{2}[0-9]{1}[A-Z]{2}[0-9]{1}[A-Z]{2}[0-9]{2}$/;
    if (!pattern.test(value)) {
      return 'Medicare number must follow format: 1AB2CD3EF45';
    }
    return null;
  },

  // Social Security Number validation
  ssn: (value: string): string | null => {
    const pattern = /^\d{3}-\d{2}-\d{4}$/;
    if (!pattern.test(value)) {
      return 'SSN must be in format: ###-##-####';
    }
    return null;
  },

  // Phone number validation
  phoneNumber: (value: string): string | null => {
    const pattern = /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    if (!pattern.test(value)) {
      return 'Phone number must be 10 digits (e.g., 555-123-4567)';
    }
    return null;
  },

  // Email validation
  email: (value: string): string | null => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Date validation (must be in the past)
  pastDate: (value: string): string | null => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return 'Date cannot be in the future';
    }
    return null;
  },

  // Date validation (must be in the future)
  futureDate: (value: string): string | null => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return 'Date must be in the future';
    }
    return null;
  },

  // Date range validation
  dateInRange: (startDate: string, endDate: string) => (value: string): string | null => {
    const date = new Date(value);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (date < start || date > end) {
      return `Date must be between ${startDate} and ${endDate}`;
    }
    return null;
  },

  // Vital signs validation
  heartRate: (value: number): string | null => {
    if (value < 30 || value > 250) {
      return 'Heart rate must be between 30 and 250 bpm';
    }
    if (value < 40 || value > 200) {
      return 'Heart rate is outside typical range (40-200 bpm). Please verify.';
    }
    return null;
  },

  bloodPressure: (systolic: number, diastolic: number): string | null => {
    if (systolic < 70 || systolic > 250) {
      return 'Systolic BP must be between 70 and 250 mmHg';
    }
    if (diastolic < 40 || diastolic > 150) {
      return 'Diastolic BP must be between 40 and 150 mmHg';
    }
    if (systolic <= diastolic) {
      return 'Systolic BP must be greater than diastolic BP';
    }
    return null;
  },

  temperature: (value: number, unit: 'F' | 'C'): string | null => {
    if (unit === 'F') {
      if (value < 95 || value > 108) {
        return 'Temperature must be between 95°F and 108°F';
      }
    } else {
      if (value < 35 || value > 42) {
        return 'Temperature must be between 35°C and 42°C';
      }
    }
    return null;
  },

  oxygenSaturation: (value: number): string | null => {
    if (value < 70 || value > 100) {
      return 'Oxygen saturation must be between 70% and 100%';
    }
    if (value < 85) {
      return 'Oxygen saturation below 85% is critically low. Please verify.';
    }
    return null;
  },

  painScale: (value: number): string | null => {
    if (value < 0 || value > 10) {
      return 'Pain scale must be between 0 and 10';
    }
    return null;
  },

  // Weight validation (in pounds)
  weight: (value: number): string | null => {
    if (value < 50 || value > 700) {
      return 'Weight must be between 50 and 700 lbs';
    }
    return null;
  },

  // Height validation (in inches)
  height: (value: number): string | null => {
    if (value < 24 || value > 96) {
      return 'Height must be between 24 and 96 inches (2-8 feet)';
    }
    return null;
  },

  // ICD-10 code format validation
  icd10Code: (value: string): string | null => {
    // Basic ICD-10 format: letter followed by 2 digits, optional dot and more digits
    const pattern = /^[A-Z]\d{2}(\.\d{1,4})?$/;
    if (!pattern.test(value)) {
      return 'ICD-10 code must be in format: A12.345';
    }
    return null;
  },

  // Medication dosage validation
  dosage: (value: string): string | null => {
    // Simple validation for common formats: "10 mg", "1.5 ml", etc.
    const pattern = /^\d+(\.\d+)?\s*(mg|ml|mcg|g|units?|tablets?|capsules?)$/i;
    if (!pattern.test(value)) {
      return 'Dosage must include amount and unit (e.g., "10 mg", "1.5 ml")';
    }
    return null;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function createValidationRules(
  sections: Array<{ id: string; title: string; fields: Array<any> }>
): FieldValidationRule[] {
  const rules: FieldValidationRule[] = [];

  sections.forEach(section => {
    section.fields.forEach(field => {
      const rule: FieldValidationRule = {
        fieldId: field.id,
        fieldLabel: field.label,
        sectionId: section.id,
        sectionTitle: section.title,
        required: field.required,
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: field.min,
        max: field.max,
      };

      // Add pattern validation if specified
      if (field.pattern) {
        rule.pattern = new RegExp(field.pattern);
      }

      // Add custom validator based on field type
      if (field.validationType) {
        const validator = commonValidators[field.validationType as keyof typeof commonValidators];
        if (validator && typeof validator === 'function') {
          rule.customValidator = validator as any;
        }
      }

      rules.push(rule);
    });
  });

  return rules;
}

export function getErrorsForSection(
  validationResult: ValidationResult,
  sectionId: string
): ValidationError[] {
  return validationResult.errorsBySectionId[sectionId] || [];
}

export function getSectionErrorCount(
  validationResult: ValidationResult,
  sectionId: string
): number {
  const errors = getErrorsForSection(validationResult, sectionId);
  return errors.filter(e => e.severity === 'error').length;
}

export function getSectionWarningCount(
  validationResult: ValidationResult,
  sectionId: string
): number {
  const errors = getErrorsForSection(validationResult, sectionId);
  return errors.filter(e => e.severity === 'warning').length;
}
