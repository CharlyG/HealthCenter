/**
 * Duplicate Detection Alert Component
 * 
 * Shows potential duplicate patient matches during admission
 * Allows user to:
 * - Review potential duplicates
 * - Proceed with new admission
 * - Merge with existing patient
 */

import React, { useState } from 'react';
import { AlertTriangle, Users, Calendar, FileText, X, Check } from 'lucide-react';
import { DuplicateMatch, PatientIdentifier } from '../../services/DuplicateDetectionService';

interface DuplicateDetectionAlertProps {
  matches: DuplicateMatch[];
  newPatient: Omit<PatientIdentifier, 'id'>;
  onProceedWithNew: () => void;
  onSelectExisting: (patient: PatientIdentifier) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function DuplicateDetectionAlert({
  matches,
  newPatient,
  onProceedWithNew,
  onSelectExisting,
  onCancel,
  isOpen
}: DuplicateDetectionAlertProps) {
  const [selectedMatch, setSelectedMatch] = useState<PatientIdentifier | null>(null);

  if (!isOpen || matches.length === 0) return null;

  const topMatch = matches[0];
  const isHighConfidence = topMatch.matchScore >= 85;

  const getMatchColor = (type: string) => {
    switch (type) {
      case 'exact': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSSN = (ssn?: string) => {
    if (!ssn) return 'Not provided';
    return `***-**-${ssn}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${
          isHighConfidence 
            ? 'bg-red-50 dark:bg-red-950/30' 
            : 'bg-yellow-50 dark:bg-yellow-950/30'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                isHighConfidence 
                  ? 'bg-red-100 dark:bg-red-900' 
                  : 'bg-yellow-100 dark:bg-yellow-900'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  isHighConfidence 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {isHighConfidence ? 'Duplicate Patient Detected' : 'Potential Duplicate Patients Found'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {matches.length} potential {matches.length === 1 ? 'match' : 'matches'} found in the system
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* New Patient Info */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              New Patient Information:
            </h3>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {newPatient.firstName} {newPatient.middleName} {newPatient.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date of Birth:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(newPatient.dateOfBirth)}
                  </p>
                </div>
                {newPatient.ssn && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">SSN:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatSSN(newPatient.ssn)}
                    </p>
                  </div>
                )}
                {newPatient.mrn && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">MRN:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {newPatient.mrn}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Potential Matches */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Potential Matches:
            </h3>
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div
                  key={match.patient.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedMatch?.id === match.patient.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedMatch(match.patient)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {match.patient.firstName} {match.patient.middleName} {match.patient.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {match.patient.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchColor(match.matchType)}`}>
                        {match.matchScore}% Match
                      </div>
                      {selectedMatch?.id === match.patient.id && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
                    <div>
                      <Calendar className="w-4 h-4 inline mr-1 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">DOB:</span>
                      <span className="ml-1 text-gray-900 dark:text-gray-100">
                        {formatDate(match.patient.dateOfBirth)}
                      </span>
                    </div>
                    {match.patient.ssn && (
                      <div>
                        <FileText className="w-4 h-4 inline mr-1 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">SSN:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">
                          {formatSSN(match.patient.ssn)}
                        </span>
                      </div>
                    )}
                    {match.patient.mrn && (
                      <div>
                        <FileText className="w-4 h-4 inline mr-1 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">MRN:</span>
                        <span className="ml-1 text-gray-900 dark:text-gray-100">
                          {match.patient.mrn}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {match.matchReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMatch ? (
                <p>
                  <Users className="w-4 h-4 inline mr-1" />
                  Selected: <strong>{selectedMatch.firstName} {selectedMatch.lastName}</strong>
                </p>
              ) : (
                <p>Select a match or proceed with new patient</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onProceedWithNew}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isHighConfidence
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isHighConfidence ? 'Proceed Anyway (New Patient)' : 'Create New Patient'}
              </button>
              {selectedMatch && (
                <button
                  onClick={() => onSelectExisting(selectedMatch)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Use Existing Patient
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
