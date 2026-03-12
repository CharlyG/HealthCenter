/**
 * Assessment Question Renderer
 * Renders different question types with appropriate inputs
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import type { AssessmentQuestion } from './types';

interface AssessmentQuestionRendererProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export function AssessmentQuestionRenderer({
  question,
  value,
  onChange,
  error,
  disabled = false,
}: AssessmentQuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-100 cursor-not-allowed'
            )}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            disabled={disabled}
            rows={4}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-100 cursor-not-allowed'
            )}
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            step={question.step || 1}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-100 cursor-not-allowed'
            )}
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-100 cursor-not-allowed'
            )}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors',
                  value === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              {question.label}
            </span>
          </label>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option.value]);
                      } else {
                        onChange(selectedValues.filter((v: string) => v !== option.value));
                      }
                    }}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'pain-scale':
        const painValue = value ?? question.min ?? 0;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">No Pain</span>
              <span className="text-3xl font-bold text-gray-900">{painValue}</span>
              <span className="text-sm text-gray-600">Worst Pain</span>
            </div>
            <input
              type="range"
              min={question.min ?? 0}
              max={question.max ?? 10}
              step={question.step ?? 1}
              value={painValue}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #eab308 50%, #ef4444 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              {Array.from({ length: (question.max ?? 10) + 1 }, (_, i) => i).map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        );

      case 'functional-score':
        const scoreValue = value ?? question.min ?? 0;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{scoreValue}</span>
              <span className="text-sm text-gray-600">
                Range: {question.min ?? 0} - {question.max ?? 5}
              </span>
            </div>
            <input
              type="range"
              min={question.min ?? 0}
              max={question.max ?? 5}
              step={question.step ?? 1}
              value={scoreValue}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-3 bg-blue-500 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              {Array.from({ length: (question.max ?? 5) + 1 }, (_, i) => i).map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
              error ? 'border-red-500' : 'border-gray-300',
              disabled && 'bg-gray-100 cursor-not-allowed'
            )}
          />
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">
            {question.label}
          </span>
          {question.required && (
            <span className="text-red-500 text-sm">*</span>
          )}
        </div>
        {question.helpText && (
          <p className="text-xs text-gray-500 mb-2">{question.helpText}</p>
        )}
        {renderInput()}
      </label>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
