/**
 * Voice Recorder Component
 * 
 * UI component for voice-to-text transcription
 * 
 * Features:
 * - Visual recording indicator
 * - Real-time transcript display
 * - Medical terminology mode
 * - Insert at cursor position
 * - Auto-save drafts
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, RotateCcw, Copy, Check } from 'lucide-react';
import { useVoiceToText } from '../../hooks/useVoiceToText';

interface VoiceRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
  onInsert?: (text: string) => void;
  initialText?: string;
  showMedicalMode?: boolean;
  autoInsert?: boolean;
  className?: string;
}

export function VoiceRecorder({
  onTranscriptChange,
  onInsert,
  initialText = '',
  showMedicalMode = true,
  autoInsert = false,
  className = ''
}: VoiceRecorderProps) {
  const [medicalMode, setMedicalMode] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useVoiceToText({
    continuous: true,
    interimResults: true,
    medicalTerminologyMode: medicalMode,
    onError: (err) => console.error('Voice recognition error:', err)
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Notify parent of transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscriptChange?.(transcript);
      
      if (autoInsert && onInsert) {
        onInsert(transcript);
      }
    }
  }, [transcript, onTranscriptChange, onInsert, autoInsert]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [transcript, interimTranscript]);

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    if (confirm('Clear the transcript?')) {
      resetTranscript();
    }
  };

  const handleCopy = async () => {
    if (transcript) {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (transcript && onInsert) {
      onInsert(transcript);
      resetTranscript();
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Voice recognition is not supported in your browser. 
          Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Voice Recorder
          </h4>
          {isListening && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Recording
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showMedicalMode && (
            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={medicalMode}
                onChange={(e) => setMedicalMode(e.target.checked)}
                disabled={isListening}
                className="rounded"
              />
              Medical Terms
            </label>
          )}

          <button
            onClick={handleReset}
            disabled={!transcript}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear transcript"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleCopy}
            disabled={!transcript}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Transcript display */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={displayText}
          onChange={(e) => {}}
          placeholder={isListening ? "Listening..." : "Click the microphone to start recording..."}
          className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          readOnly
        />
        {interimTranscript && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
            Processing...
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Start Recording
            </>
          )}
        </button>

        {onInsert && transcript && (
          <button
            onClick={handleInsert}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Insert Text
          </button>
        )}

        {transcript && (
          <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            {transcript.split(' ').filter(w => w).length} words
          </div>
        )}
      </div>

      {/* Usage hint */}
      {!isListening && !transcript && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Speak clearly and naturally. 
            {medicalMode && ' Medical terminology will be automatically formatted.'}
          </p>
        </div>
      )}
    </div>
  );
}
