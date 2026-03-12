/**
 * useFormValidation Hook
 * 
 * Form validation hook with support for field-level and form-level validation.
 * Part of the Inline Validation Pattern.
 * 
 * @module UXPatterns/Validation
 */

import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean;
  message: string;
};

export type FieldValidation = ValidationRule[];

export type FormValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidation;
};

export interface UseFormValidationOptions<T extends Record<string, any>> {
  /** Validation rules for each field */
  rules: FormValidationRules<T>;
  
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
  
  /** Validate on change (default: false, validates after first blur) */
  validateOnChange?: boolean;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  /** Current validation errors */
  errors: Partial<Record<keyof T, string>>;
  
  /** Fields that have been touched (blurred) */
  touched: Partial<Record<keyof T, boolean>>;
  
  /** Validate a single field */
  validateField: (fieldName: keyof T, value: any) => string | undefined;
  
  /** Validate all fields */
  validateForm: (values: T) => boolean;
  
  /** Mark field as touched */
  setFieldTouched: (fieldName: keyof T, isTouched?: boolean) => void;
  
  /** Clear all errors */
  clearErrors: () => void;
  
  /** Clear error for specific field */
  clearFieldError: (fieldName: keyof T) => void;
  
  /** Check if form is valid */
  isValid: boolean;
  
  /** Get field props for integration with inputs */
  getFieldProps: (fieldName: keyof T, value: any) => {
    onBlur: () => void;
    onChange: (value: any) => void;
    error?: string;
  };
}

/**
 * useFormValidation - Form validation hook
 */
export function useFormValidation<T extends Record<string, any>>({
  rules,
  validateOnBlur = true,
  validateOnChange = false
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((fieldName: keyof T, value: any): string | undefined => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return undefined;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }

    return undefined;
  }, [rules]);

  const validateForm = useCallback((values: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const fieldName in rules) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(rules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    return isValid;
  }, [rules, validateField]);

  const setFieldTouched = useCallback((fieldName: keyof T, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: isTouched
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const getFieldProps = useCallback((fieldName: keyof T, value: any) => {
    return {
      onBlur: () => {
        setFieldTouched(fieldName, true);
        if (validateOnBlur) {
          const error = validateField(fieldName, value);
          if (error) {
            setErrors(prev => ({ ...prev, [fieldName]: error }));
          } else {
            clearFieldError(fieldName);
          }
        }
      },
      onChange: (newValue: any) => {
        // Only validate on change if field has been touched and validateOnChange is true
        if (touched[fieldName] && validateOnChange) {
          const error = validateField(fieldName, newValue);
          if (error) {
            setErrors(prev => ({ ...prev, [fieldName]: error }));
          } else {
            clearFieldError(fieldName);
          }
        }
      },
      error: touched[fieldName] ? errors[fieldName] : undefined
    };
  }, [validateField, validateOnBlur, validateOnChange, touched, errors, setFieldTouched, clearFieldError]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    isValid,
    getFieldProps
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),

  email: (message = 'Must be a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => !value || regex.test(value),
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value === null || value >= min,
    message: message || `Must be at least ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value === undefined || value === null || value <= max,
    message: message || `Must be no more than ${max}`
  }),

  phone: (message = 'Must be a valid phone number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      // US phone number format
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message
  }),

  mrn: (message = 'Must be a valid Medical Record Number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      // MRN format: 6-10 alphanumeric characters
      const mrnRegex = /^[A-Z0-9]{6,10}$/i;
      return mrnRegex.test(value);
    },
    message
  }),

  date: (message = 'Must be a valid date'): ValidationRule<string | Date> => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule<string | Date> => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message
  }),

  pastDate: (message = 'Date must be in the past'): ValidationRule<string | Date> => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date < new Date();
    },
    message
  })
};
