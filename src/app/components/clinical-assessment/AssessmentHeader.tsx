/**
 * Assessment Header Component
 * Displays patient, admission, and assessment metadata
 */

import React from 'react';
import { Calendar, User, Stethoscope, FileText, Activity } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import type { AssessmentHeaderData, AssessmentStatus } from './types';

interface AssessmentHeaderProps {
  patient: AssessmentHeaderData['patient'];
  admission: AssessmentHeaderData['admission'];
  assessment: AssessmentHeaderData['assessment'];
  clinician: AssessmentHeaderData['clinician'];
}

const statusConfig: Record<AssessmentStatus, { label: string; className: string }> = {
  'not-started': { label: 'Not Started', className: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  'draft': { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
  'submitted': { label: 'Submitted', className: 'bg-purple-100 text-purple-700' },
  'qa-review': { label: 'QA Review', className: 'bg-orange-100 text-orange-700' },
  'approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
  'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

export function AssessmentHeader({
  patient,
  admission,
  assessment,
  clinician,
}: AssessmentHeaderProps) {
  const statusInfo = statusConfig[assessment.status];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-sm text-gray-500">
                Created {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Patient */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Patient</p>
              <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
              <p className="text-xs text-gray-600">MRN: {patient.mrn}</p>
              <p className="text-xs text-gray-600">
                DOB: {new Date(patient.dob).toLocaleDateString()} ({patient.age}y)
              </p>
            </div>
          </div>

          {/* Admission */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Admission</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(admission.admissionDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600">{admission.diagnosis}</p>
              <p className="text-xs text-gray-600">{admission.physician}</p>
            </div>
          </div>

          {/* Clinician */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
              <Stethoscope className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Clinician</p>
              <p className="text-sm font-semibold text-gray-900">{clinician.name}</p>
              <p className="text-xs text-gray-600">{clinician.credentials}</p>
              <p className="text-xs text-gray-600">{clinician.discipline}</p>
            </div>
          </div>

          {/* Assessment Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1">Assessment Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
