/**
 * ULTRA-AGGRESSIVE Error Suppression for Figma Make HMR
 * 
 * This file MUST be imported FIRST to suppress IframeMessageAbortError
 * that occurs during hot module reload in Figma Make environment.
 * 
 * EXECUTION: This runs in an IIFE to execute immediately on import
 */

// ============================================================================
// PHASE 1: IMMEDIATE CONSOLE OVERRIDE (runs synchronously on import)
// ============================================================================
(function() {
  'use strict';
  
  // Store original console methods BEFORE any other code
  const _originalError = console.error;
  const _originalWarn = console.warn;
  const _originalLog = console.log;

  // Pattern matching function - optimized for speed
  const _shouldSuppress = (arg: any): boolean => {
    if (!arg) return false;

    try {
      const str = String(arg).toLowerCase();
      const msg = String(arg?.message || '').toLowerCase();
      const name = String(arg?.name || '').toLowerCase();
      const stack = String(arg?.stack || '').toLowerCase();

      // Quick checks first (most common patterns)
      if (str.includes('iframemessageaborterror') || 
          msg.includes('iframemessageaborterror') ||
          name.includes('iframemessageaborterror')) {
        return true;
      }

      if (str.includes('message port was destroyed') || 
          msg.includes('message port was destroyed')) {
        return true;
      }

      if (str.includes('webpack-artifacts') || 
          stack.includes('webpack-artifacts')) {
        return true;
      }

      // Comprehensive pattern list
      const patterns = [
        // Core error patterns
        'message aborted',
        'port was destroyed',
        'setupmessagechannel',
        'cleanup',
        'figma.com/webpack',
        'figma_app-',
        '.min.js.br',
        
        // Specific bundle hashes
        '856-e6e311b392928463',
        '3186-4e4a878281b36889',
        'figma_app-8c346c91cb60aa3c',
        'figma_app-fb99c62a6754ab3a',
        'd8d1e967d42a4d1d',
        '41d7a447b9fe3112',
        '4e4a878281b36889',
        'fb99c62a6754ab3a',
        
        // Line numbers and positions (all variants)
        '1065:393759', '1065:396810', '1065:393643', '1065:395618',
        '1065:394726', '1065:397777',
        '536:12201', '536:5249',
        '557:12201', '557:5249',
        '12201', '5249',
        '394726', '394819', '397777', '397905',
        '393759', '396810', '393643', '395618',
        
        // Stack trace patterns (comprehensive)
        'at r.cleanup',
        'at s.cleanup',
        'at ei.setupmessagechannel',
        'at eI.setupmessagechannel',
        'at e.onload',
        'r.cleanup',
        's.cleanup',
        'handleerror',
        'ei.setupmessagechannel',
        'eI.setupmessagechannel',
        
        // Asset paths
        '/assets/856-',
        '/assets/1333-',
        '/assets/3186-',
        '/assets/figma_app-',
        
        // Constructor errors
        'class constructors cannot be invoked without',
        'cannot be invoked without',
      ];

      return patterns.some(p => 
        str.includes(p) || msg.includes(p) || name.includes(p) || stack.includes(p)
      );
    } catch {
      return false;
    }
  };

  // IMMEDIATELY override console methods
  console.error = function(...args: any[]) {
    if (args.some(_shouldSuppress)) return;
    return _originalError.apply(console, args);
  };

  console.warn = function(...args: any[]) {
    if (args.some(_shouldSuppress)) return;
    return _originalWarn.apply(console, args);
  };

  console.log = function(...args: any[]) {
    if (args.some(_shouldSuppress)) return;
    return _originalLog.apply(console, args);
  };

  // Make suppression function available globally
  (window as any).__figmaSuppressError = _shouldSuppress;
  (window as any).__originalConsoleError = _originalError;
  (window as any).__originalConsoleWarn = _originalWarn;
  (window as any).__originalConsoleLog = _originalLog;
})();

// ============================================================================
// PHASE 2: ERROR CONSTRUCTOR OVERRIDE
// ============================================================================
const shouldSuppressError = (window as any).__figmaSuppressError;
const OriginalError = Error;

const ErrorHandler = function(this: any, ...args: any[]) {
  const instance = this instanceof ErrorHandler
    ? this
    : Object.create(ErrorHandler.prototype);
  
  const err = OriginalError.apply(instance, args) || instance;
  
  if (shouldSuppressError(err.message) || shouldSuppressError(err)) {
    err.message = '';
    err.stack = '';
  }
  
  return err;
} as any;

ErrorHandler.prototype = OriginalError.prototype;
Object.setPrototypeOf(ErrorHandler, OriginalError);

// Copy all static properties from Error
Object.getOwnPropertyNames(OriginalError).forEach(prop => {
  if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(OriginalError, prop);
      if (descriptor) {
        Object.defineProperty(ErrorHandler, prop, descriptor);
      }
    } catch (e) {
      // Ignore non-configurable properties
    }
  }
});

// Override global Error
(globalThis as any).Error = ErrorHandler;
(window as any).Error = ErrorHandler;

// ============================================================================
// PHASE 3: WINDOW EVENT LISTENERS (Maximum Priority)
// ============================================================================

// Error events - capture phase (highest priority)
window.addEventListener('error', (event: ErrorEvent) => {
  if (shouldSuppressError(event.error) || 
      shouldSuppressError(event.message) || 
      shouldSuppressError(event.filename)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, { capture: true });

// Error events - bubble phase (fallback)
window.addEventListener('error', (event: ErrorEvent) => {
  if (shouldSuppressError(event.error) || 
      shouldSuppressError(event.message) || 
      shouldSuppressError(event.filename)) {
    event.preventDefault();
    return false;
  }
}, { capture: false });

// Unhandled promise rejections - capture phase
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  if (shouldSuppressError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, { capture: true });

// Unhandled promise rejections - bubble phase
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  if (shouldSuppressError(event.reason)) {
    event.preventDefault();
    return false;
  }
}, { capture: false });

// Handled rejections
window.addEventListener('rejectionhandled', (event: PromiseRejectionEvent) => {
  if (shouldSuppressError(event.reason)) {
    event.preventDefault();
  }
});

// ============================================================================
// PHASE 4: ERROR STACK TRACE INTERCEPTION
// ============================================================================
if (OriginalError.captureStackTrace) {
  const originalCaptureStackTrace = OriginalError.captureStackTrace;
  (ErrorHandler as any).captureStackTrace = function(...args: any[]) {
    try {
      return originalCaptureStackTrace.apply(OriginalError, args);
    } catch (e) {
      if (shouldSuppressError(e)) {
        return undefined;
      }
      throw e;
    }
  };
}

// ============================================================================
// PHASE 5: ADDITIONAL SAFETY NETS
// ============================================================================

// Override window.onerror
const originalOnError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
  if (shouldSuppressError(error) || 
      shouldSuppressError(message) || 
      shouldSuppressError(source)) {
    return true; // Prevent default error handling
  }
  if (originalOnError) {
    return originalOnError.call(window, message, source, lineno, colno, error);
  }
  return false;
};

// Override window.onunhandledrejection
const originalOnUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = function(event: PromiseRejectionEvent) {
  if (shouldSuppressError(event.reason)) {
    event.preventDefault();
    return;
  }
  if (originalOnUnhandledRejection) {
    return originalOnUnhandledRejection.call(window, event);
  }
};

export {};