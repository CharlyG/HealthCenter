/**
 * Voice-to-Text Documentation Editor
 * 
 * Real-time speech-to-text transcription for clinical documentation with:
 * - Browser Web Speech API integration
 * - Medical terminology optimization
 * - Punctuation auto-correction
 * - Formatting commands (e.g., "new paragraph", "bullet point")
 * - Continuous recording with pause/resume
 * - Text editing while recording
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Pause, Play, Square, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

interface VoiceToTextEditorProps {
  value: string;
  onChange: (text: string) => void;
  onSave?: (text: string) => void;
  placeholder?: string;
  minHeight?: string;
  medicalTermsEnabled?: boolean;
}

// Medical term replacements for common misheard words
const medicalTermsMap: Record<string, string> = {
  'medication': 'medication',
  'blood pressure': 'blood pressure',
  'temperature': 'temperature',
  'pulse': 'pulse',
  'respiration': 'respiration',
  'glucose': 'glucose',
  'insulin': 'insulin',
  'hypertension': 'hypertension',
  'diabetes': 'diabetes',
  'assessment': 'assessment',
  'intervention': 'intervention',
  'evaluation': 'evaluation',
  'plan of care': 'plan of care',
  'vital signs': 'vital signs',
  'patient education': 'patient education',
  'wound care': 'wound care',
  'dressing change': 'dressing change',
  'skilled nursing': 'skilled nursing',
  'physical therapy': 'physical therapy',
  'occupational therapy': 'occupational therapy',
  'speech therapy': 'speech therapy',
  // Common abbreviations
  'b p': 'BP',
  'heart rate': 'HR',
  'respiratory rate': 'RR',
  'temperature temp': 'temp',
  'oxygen saturation': 'O2 sat',
  'activities of daily living': 'ADLs',
  'range of motion': 'ROM',
  'weight bearing': 'weight bearing',
};

// Voice commands for formatting
const voiceCommands: Record<string, (text: string) => string> = {
  'new paragraph': (text) => text + '\n\n',
  'new line': (text) => text + '\n',
  'period': (text) => text.trimEnd() + '. ',
  'comma': (text) => text.trimEnd() + ', ',
  'question mark': (text) => text.trimEnd() + '? ',
  'exclamation point': (text) => text.trimEnd() + '! ',
  'colon': (text) => text.trimEnd() + ': ',
  'semicolon': (text) => text.trimEnd() + '; ',
  'bullet point': (text) => text + '\n• ',
  'dash': (text) => text + ' - ',
};

export const VoiceToTextEditor: React.FC<VoiceToTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Start speaking to dictate your documentation...',
  minHeight = '200px',
  medicalTermsEnabled = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        // Process final transcript
        const processed = processTranscript(final);
        const newText = value + processed;
        onChange(newText);
        setInterimTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('Microphone not accessible. Please check permissions.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied.');
      } else {
        setError(`Error: ${event.error}`);
      }
      stopRecording();
    };

    recognition.onend = () => {
      if (isRecording && !isPaused) {
        // Auto-restart if still recording
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Process transcript with medical terms and commands
  const processTranscript = (transcript: string): string => {
    let processed = transcript;

    // Check for voice commands
    const lowerTranscript = transcript.toLowerCase().trim();
    for (const [command, action] of Object.entries(voiceCommands)) {
      if (lowerTranscript === command) {
        return action(value).substring(value.length);
      }
    }

    // Apply medical terminology corrections
    if (medicalTermsEnabled) {
      for (const [incorrect, correct] of Object.entries(medicalTermsMap)) {
        const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
        processed = processed.replace(regex, correct);
      }
    }

    // Auto-capitalize first letter
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);

    // Add space before if needed
    if (value && !value.endsWith(' ') && !value.endsWith('\n')) {
      processed = ' ' + processed;
    }

    return processed;
  };

  const startRecording = async () => {
    if (!recognitionRef.current) return;

    try {
      setError(null);
      await recognitionRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  };

  const pauseRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsPaused(true);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    setIsPaused(false);
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');
    setRecordingDuration(0);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayText = value + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className="space-y-3">
      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Speech Recognition Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={!isSupported}
              variant="primary"
              size="sm"
            >
              <Mic className="size-4 mr-2" />
              Start Dictation
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button onClick={pauseRecording} variant="secondary" size="sm">
                  <Pause className="size-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeRecording} variant="secondary" size="sm">
                  <Play className="size-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={stopRecording} variant="ghost" size="sm">
                <Square className="size-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {/* Recording Indicator */}
          {isRecording && !isPaused && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Recording... {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          {isPaused && (
            <div className="flex items-center gap-2">
              <Pause className="size-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Paused - {formatDuration(recordingDuration)}
              </span>
            </div>
          )}
        </div>

        {medicalTermsEnabled && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <CheckCircle className="size-4 text-green-600" />
            <span>Medical terms enabled</span>
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      {isRecording && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Voice Commands:</p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-blue-700 dark:text-blue-300">
            <span>"period" → .</span>
            <span>"comma" → ,</span>
            <span>"new paragraph"</span>
            <span>"new line"</span>
            <span>"bullet point" → •</span>
            <span>"question mark" → ?</span>
          </div>
        </div>
      )}

      {/* Text Editor */}
      <div className="relative">
        <textarea
          ref={textAreaRef}
          value={displayText}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
            interimTranscript ? 'bg-blue-50 dark:bg-blue-950' : ''
          }`}
          style={{ minHeight }}
          disabled={!isSupported}
        />
        
        {/* Interim Transcript Indicator */}
        {interimTranscript && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            Listening...
          </div>
        )}
      </div>

      {/* Word Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {value.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        {onSave && (
          <Button onClick={() => onSave(value)} size="sm" disabled={!value.trim()}>
            Save Documentation
          </Button>
        )}
      </div>

      {/* Browser Compatibility Note */}
      {!isSupported && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            <strong>Voice dictation is not available in this browser.</strong>
            <br />
            Please use Chrome, Edge, or Safari for speech-to-text functionality.
          </p>
        </div>
      )}
    </div>
  );
};
