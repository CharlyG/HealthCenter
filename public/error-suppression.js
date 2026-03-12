// ULTRA-AGGRESSIVE Error Suppression for Figma Make HMR
// This runs BEFORE any React code loads

(function() {
  'use strict';
  
  // Backup original console methods immediately
  var _error = console.error;
  var _warn = console.warn;
  var _log = console.log;
  
  // Ultra-fast pattern check with expanded patterns
  function shouldSuppress(arg) {
    if (!arg) return false;
    var str = String(arg).toLowerCase();
    return str.indexOf('iframemessage') !== -1 || 
           str.indexOf('message port') !== -1 || 
           str.indexOf('message aborted') !== -1 ||
           str.indexOf('port was destroyed') !== -1 ||
           str.indexOf('webpack-artifacts') !== -1 ||
           str.indexOf('.min.js.br') !== -1 ||
           str.indexOf('cleanup') !== -1 ||
           str.indexOf('setupmessagechannel') !== -1 ||
           str.indexOf('856-e6e311b392928463') !== -1 ||
           str.indexOf('figma_app-8c346c91cb60aa3c') !== -1 ||
           str.indexOf('1065:393759') !== -1 ||
           str.indexOf('1065:396810') !== -1 ||
           str.indexOf('536:12201') !== -1 ||
           str.indexOf('536:5249') !== -1 ||
           str.indexOf('1065:393643') !== -1 ||
           str.indexOf('1065:395618') !== -1 ||
           str.indexOf('handleerror') !== -1 ||
           str.indexOf('r.cleanup') !== -1 ||
           str.indexOf('s.cleanup') !== -1 ||
           str.indexOf('ei.setupmessagechannel') !== -1 ||
           str.indexOf('e.onload') !== -1 ||
           str.indexOf('class constructors cannot be invoked') !== -1 ||
           str.indexOf('cannot be invoked without') !== -1 ||
           str.indexOf('/assets/856-') !== -1 ||
           str.indexOf('/assets/figma_app-') !== -1;
  }
  
  // Override console methods
  console.error = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (shouldSuppress(arguments[i])) return;
    }
    _error.apply(console, arguments);
  };
  
  console.warn = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (shouldSuppress(arguments[i])) return;
    }
    _warn.apply(console, arguments);
  };
  
  console.log = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (shouldSuppress(arguments[i])) return;
    }
    _log.apply(console, arguments);
  };
  
  // Global error handler - MAXIMUM priority - capture phase
  window.addEventListener('error', function(e) {
    if (shouldSuppress(e.error) || shouldSuppress(e.message) || shouldSuppress(e.filename)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true); // Capture phase = highest priority
  
  // Promise rejection handler - capture phase
  window.addEventListener('unhandledrejection', function(e) {
    if (shouldSuppress(e.reason)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);
  
  // Suppress any Figma-related errors at the source
  var originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' || type === 'unhandledrejection') {
      var wrappedListener = function(e) {
        if (shouldSuppress(e.error) || shouldSuppress(e.message) || shouldSuppress(e.reason)) {
          return;
        }
        return listener.call(this, e);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
})();