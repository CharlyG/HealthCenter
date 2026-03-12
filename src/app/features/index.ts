/**
 * Priority Features - Centralized Exports
 * 
 * Quick access to all 5 newly implemented priority features:
 * 1. Real-time Notification System
 * 2. Voice-to-Text Documentation
 * 3. Duplicate Patient Detection
 * 4. Advanced Search
 * 5. Photo/Video Capture
 * 
 * Usage:
 * import { NotificationCenter, useNotifications, VoiceRecorder } from '@/features';
 */

// ==========================================
// 1. REAL-TIME NOTIFICATION SYSTEM
// ==========================================
export { NotificationService } from '../services/NotificationService';
export type { 
  Notification, 
  NotificationPriority, 
  NotificationType,
  NotificationSettings 
} from '../services/NotificationService';

export { NotificationCenter } from '../components/notifications/NotificationCenter';
export { useNotifications } from '../hooks/useNotifications';

// ==========================================
// 2. VOICE-TO-TEXT DOCUMENTATION
// ==========================================
export { useVoiceToText } from '../hooks/useVoiceToText';
export { VoiceRecorder } from '../components/voice/VoiceRecorder';

// ==========================================
// 3. DUPLICATE PATIENT DETECTION
// ==========================================
export { DuplicateDetectionService } from '../services/DuplicateDetectionService';
export type {
  PatientIdentifier,
  DuplicateMatch,
  DuplicateCheckResult
} from '../services/DuplicateDetectionService';

export { DuplicateDetectionAlert } from '../components/patients/DuplicateDetectionAlert';

// ==========================================
// 4. ADVANCED SEARCH
// ==========================================
export { useAdvancedSearch } from '../hooks/useAdvancedSearch';
export type {
  SearchFilter,
  SavedSearch
} from '../hooks/useAdvancedSearch';

export { AdvancedSearchPanel } from '../components/search/AdvancedSearchPanel';

// ==========================================
// 5. PHOTO/VIDEO CAPTURE
// ==========================================
export { useMediaCapture } from '../hooks/useMediaCapture';
export type {
  MediaType,
  CapturedMedia
} from '../hooks/useMediaCapture';

export { MediaCapturePanel } from '../components/media/MediaCapturePanel';

// ==========================================
// DEMO PAGE
// ==========================================
export { default as FeaturesDemo } from '../pages/FeaturesDemo';
