/**
 * Inline Validation Pattern - Exports
 * 
 * Form validation pattern with inline error display.
 * 
 * @module UXPatterns/Validation
 */

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { useFormValidation, validationRules } from './useFormValidation';
export type {
  ValidationRule,
  FieldValidation,
  FormValidationRules,
  UseFormValidationOptions,
  UseFormValidationReturn
} from './useFormValidation';
