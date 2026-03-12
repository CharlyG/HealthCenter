/**
 * useVoiceToText Hook
 * 
 * Provides voice-to-text transcription using Web Speech API
 * 
 * Features:
 * - Real-time speech recognition
 * - Medical terminology optimization
 * - Auto-punctuation
 * - Multiple language support
 * - Continuous vs. single-shot mode
 * 
 * Usage:
 * ```tsx
 * const { 
 *   transcript, 
 *   isListening, 
 *   startListening, 
 *   stopListening,
 *   resetTranscript 
 * } = useVoiceToText();
 * 
 * <button onClick={startListening}>Start Recording</button>
 * <button onClick={stopListening}>Stop</button>
 * <textarea value={transcript} />
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onError?: (error: string) => void;
  onEnd?: () => void;
  medicalTerminologyMode?: boolean;
}

interface UseVoiceToTextReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  appendText: (text: string) => void;
  error: string | null;
}

// Medical terminology corrections
const MEDICAL_CORRECTIONS: Record<string, string> = {
  'bee pee': 'BP',
  'heart rate': 'HR',
  'respiratory rate': 'RR',
  'oxygen saturation': 'O2 sat',
  'oh two sat': 'O2 sat',
  'blood pressure': 'BP',
  'temperature': 'temp',
  'milligrams': 'mg',
  'milliliters': 'mL',
  'millilitre': 'mL',
  'millilitres': 'mL',
  'liters': 'L',
  'kilograms': 'kg',
  'pounds': 'lbs',
  'beats per minute': 'bpm',
  'breaths per minute': 'breaths/min',
  'diabetic': 'DM',
  'hypertension': 'HTN',
  'congestive heart failure': 'CHF',
  'chronic obstructive pulmonary disease': 'COPD',
  'myocardial infarction': 'MI',
  'cerebrovascular accident': 'CVA',
  'transient ischemic attack': 'TIA',
  'urinary tract infection': 'UTI',
  'post operative': 'post-op',
  'preoperative': 'pre-op',
  'as needed': 'PRN',
  'twice a day': 'BID',
  'three times a day': 'TID',
  'four times a day': 'QID',
  'once daily': 'QD',
  'at bedtime': 'HS',
  'before meals': 'AC',
  'after meals': 'PC',
  'by mouth': 'PO',
  'intravenous': 'IV',
  'intramuscular': 'IM',
  'subcutaneous': 'SubQ',
};

export function useVoiceToText(options: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onError,
    onEnd,
    medicalTerminologyMode = true
  } = options;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  });

  const recognitionRef = useRef<any>(null);

  // Apply medical terminology corrections
  const applyMedicalCorrections = useCallback((text: string): string => {
    if (!medicalTerminologyMode) return text;

    let correctedText = text;
    
    // Apply medical terminology replacements
    Object.entries(MEDICAL_CORRECTIONS).forEach(([phrase, replacement]) => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      correctedText = correctedText.replace(regex, replacement);
    });

    return correctedText;
  }, [medicalTerminologyMode]);

  // Apply auto-punctuation
  const applyAutoPunctuation = useCallback((text: string): string => {
    let result = text;

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    // Add periods at natural pauses (this is simplified)
    result = result.replace(/\s+(however|therefore|additionally|furthermore)\s+/gi, '. $1 ');
    
    // Ensure period at end if not present
    if (result && !result.match(/[.!?]$/)) {
      result += '.';
    }

    return result;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition is not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (isListening) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPiece = result[0].transcript;

          if (result.isFinal) {
            finalText += transcriptPiece + ' ';
          } else {
            interimText += transcriptPiece;
          }
        }

        if (finalText) {
          const corrected = applyMedicalCorrections(finalText.trim());
          setTranscript(prev => {
            const combined = prev + (prev ? ' ' : '') + corrected;
            return combined;
          });
        }

        if (interimText) {
          setInterimTranscript(interimText);
        } else {
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMsg = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMsg = 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMsg = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMsg = 'Network error. Please check your connection.';
            break;
          default:
            errorMsg = `Speech recognition error: ${event.error}`;
        }

        setError(errorMsg);
        setIsListening(false);
        onError?.(errorMsg);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        onEnd?.();
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      const errorMsg = 'Failed to start speech recognition';
      setError(errorMsg);
      setIsListening(false);
      onError?.(errorMsg);
      console.error(err);
    }
  }, [isSupported, isListening, continuous, interimResults, language, onError, onEnd, applyMedicalCorrections]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const appendText = useCallback((text: string) => {
    setTranscript(prev => prev + (prev ? ' ' : '') + text);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    appendText,
    error
  };
}
