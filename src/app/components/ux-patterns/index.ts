/**
 * UX Patterns - Central Exports
 * 
 * Comprehensive UX patterns for HIPAA-compliant healthcare platform.
 * 
 * Patterns included:
 * 1. Error Handling - Consistent, user-friendly error messages
 * 2. Inline Validation - Form validation with inline feedback
 * 3. Bulk Actions - Multi-select and bulk operations
 * 4. Loading States - Skeleton loaders that mimic final layout
 * 5. Progressive Disclosure - Reveal complexity progressively
 * 6. Global Search - Search with categorized results
 * 7. Keyboard Shortcuts - Productivity shortcuts for power users
 * 8. Activity Logging - Automatic audit trail and timeline generation
 * 9. Retry Behavior - Failed operation retry with progress feedback
 * 10. Long-Running Operations - Progress indicators for async tasks
 * 11. Alert Severity System - Tiered alert system (critical/warning/info)
 * 12. Inline Help - Contextual help with CMS references
 * 13. Empty States - Helpful no-data states with suggested actions
 * 14. Interaction Rules - System-wide consistency patterns
 * 
 * @module UXPatterns
 */

// ==================== ERROR HANDLING ====================
export * from './error-handling';

// ==================== VALIDATION ====================
export * from './validation';

// ==================== BULK ACTIONS ====================
export * from './bulk-actions';

// ==================== LOADING STATES ====================
export * from './loading';

// ==================== PROGRESSIVE DISCLOSURE ====================
export * from './progressive-disclosure';

// ==================== GLOBAL SEARCH ====================
export * from './search';

// ==================== KEYBOARD SHORTCUTS ====================
export * from './keyboard-shortcuts';

// ==================== ACTIVITY LOGGING ====================
export * from './activity-logging';

// ==================== RETRY BEHAVIOR ====================
export * from './retry-behavior';

// ==================== LONG-RUNNING OPERATIONS ====================
export * from './long-running-ops';

// ==================== ALERT SEVERITY SYSTEM ====================
export * from './alert-severity';

// ==================== INLINE HELP ====================
export * from './inline-help';

// ==================== EMPTY STATES ====================
export * from './empty-states';

// ==================== INTERACTION RULES ====================
export * from './interaction-rules';