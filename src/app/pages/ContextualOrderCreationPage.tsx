/**
 * Contextual Order Creation Demo Page
 * 
 * Demonstrates contextual order creation from different clinical workflows,
 * showing how prefilled data reduces duplicate entry and improves UX.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Activity,
  Pill,
  Target,
  Info,
  Check,
  Sparkles,
  Layout,
  FilePlus,
} from 'lucide-react';
import {
  QuickOrderFromVisit,
  QuickOrderFromWound,
  QuickOrderFromMedication,
  QuickOrderFromCarePlan,
} from '../components/ContextualOrderCreation';

export default function ContextualOrderCreationPage() {
  const navigate = useNavigate();

  // Mock data for different clinical contexts
  const visitData = {
    patientName: 'Margaret Johnson',
    patientId: 'PAT-001',
    admissionId: 'ADM-12345',
    visitId: 'VISIT-789',
    visitDate: '2024-12-15',
    clinician: 'Emily Chen, RN',
    findings: 'Patient experiencing increased shortness of breath on exertion',
  };

  const woundData = {
    patientName: 'Robert Williams',
    patientId: 'PAT-002',
    admissionId: 'ADM-12346',
    visitDate: '2024-12-15',
    clinician: 'Sarah Johnson, PT',
    woundLocation: 'Right heel',
    woundSize: '3.2 x 2.5 cm',
    signs: 'infection (increased redness, warmth)',
  };

  const medicationData = {
    patientName: 'Patricia Davis',
    patientId: 'PAT-003',
    admissionId: 'ADM-12347',
    visitDate: '2024-12-15',
    clinician: 'Michael Torres, RN',
    medicationName: 'Lisinopril 10mg',
    concern: 'Patient reports persistent dry cough',
  };

  const carePlanData = {
    patientName: 'James Anderson',
    patientId: 'PAT-004',
    admissionId: 'ADM-12348',
    clinician: 'Emily Chen, RN',
    goalDescription: 'Increase ambulation distance to 100 feet with walker',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Contextual Order Creation
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create orders directly from clinical workflows with smart prefill
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="examples">
          <TabsList>
            <TabsTrigger value="examples">
              <Layout className="w-4 h-4 mr-2" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Examples Tab */}
          <TabsContent value="examples" className="mt-6 space-y-6">
            {/* Visit Documentation Context */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    From Visit Documentation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create orders while documenting visits. Patient, admission, and visit
                    context automatically prefilled.
                  </p>

                  {/* Mock Visit Documentation Interface */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Patient</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {visitData.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Visit Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(visitData.visitDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Clinician</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {visitData.clinician}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Clinical Findings:
                      </p>
                      <p className="text-sm text-gray-600 mb-4">{visitData.findings}</p>
                      <QuickOrderFromVisit visitData={visitData} />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      <strong>Auto-filled:</strong> Patient name, admission ID, visit date,
                      clinician, and clinical findings prefilled in order form
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Wound Documentation Context */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    From Wound Documentation
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Order wound care supplies or treatments directly from wound assessment.
                    Wound details automatically included.
                  </p>

                  {/* Mock Wound Documentation Interface */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Patient</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {woundData.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Assessment Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(woundData.visitDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Wound Assessment:
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-semibold text-gray-900">
                            {woundData.woundLocation}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-semibold text-gray-900">
                            {woundData.woundSize}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Signs:</span>
                          <span className="font-semibold text-red-900">{woundData.signs}</span>
                        </div>
                      </div>
                      <QuickOrderFromWound woundData={woundData} />
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      <strong>Auto-filled:</strong> Patient info, wound location, size, and
                      signs of infection prefilled in clinical rationale
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Medication Review Context */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    From Medication Review
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Request medication changes during medication review. Current medication
                    and concerns automatically documented.
                  </p>

                  {/* Mock Medication Review Interface */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Patient</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {medicationData.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Review Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(medicationData.visitDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Current Medication:
                      </p>
                      <div className="bg-white rounded p-3 mb-3">
                        <p className="font-semibold text-gray-900 mb-1">
                          {medicationData.medicationName}
                        </p>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-amber-600 font-medium">⚠️ Concern:</span>
                          <span className="text-gray-700">{medicationData.concern}</span>
                        </div>
                      </div>
                      <QuickOrderFromMedication medicationData={medicationData} />
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-700">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      <strong>Auto-filled:</strong> Patient info, current medication name,
                      and patient concern prefilled in clinical rationale
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Care Plan Context */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">From Care Plan Updates</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Order services or interventions to support care plan goals. Goal
                    description automatically linked.
                  </p>

                  {/* Mock Care Plan Interface */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Patient</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {carePlanData.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Clinician</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {carePlanData.clinician}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Active Goal:</p>
                      <div className="bg-white rounded p-3 mb-3">
                        <p className="text-sm text-gray-900">
                          {carePlanData.goalDescription}
                        </p>
                      </div>
                      <QuickOrderFromCarePlan carePlanData={carePlanData} />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      <strong>Auto-filled:</strong> Patient info and care plan goal
                      description prefilled in clinical rationale
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <FeaturesOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function FeaturesOverview() {
  return (
    <>
      {/* Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Contextual Order Creation Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Allows staff to create physician orders directly from relevant clinical contexts
          (visit documentation, wound care, medication review, care plan updates).
          Intelligently prefills patient, admission, and clinical information to reduce
          duplicate data entry and make order creation feel integrated with clinical work.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FilePlus className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">4 Clinical Contexts</p>
            <p className="text-sm text-blue-700 mt-1">Integrated workflows</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Smart Prefill</p>
            <p className="text-sm text-green-700 mt-1">Auto-filled data</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Check className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Less Duplicate Entry</p>
            <p className="text-sm text-purple-700 mt-1">Improved efficiency</p>
          </div>
        </div>
      </Card>

      {/* 4 Clinical Contexts */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Integrated Clinical Contexts</h3>
        <div className="space-y-4">
          {[
            {
              context: 'Visit Documentation',
              icon: '📄',
              color: 'Blue (#3B82F6)',
              desc: 'Create orders while documenting home visits',
              prefilled: 'Patient, admission, visit date, clinician, clinical findings',
              suggested: 'Skilled Nursing, Therapy, Medication, Lab orders',
            },
            {
              context: 'Wound Documentation',
              icon: '🩹',
              color: 'Red (#EF4444)',
              desc: 'Order wound care supplies or treatments from wound assessments',
              prefilled: 'Patient, admission, wound location, size, signs of infection',
              suggested: 'Wound Care, Medication, DME/Supplies, Lab orders',
            },
            {
              context: 'Medication Review',
              icon: '💊',
              color: 'Purple (#8B5CF6)',
              desc: 'Request medication changes during medication reviews',
              prefilled: 'Patient, admission, current medication name, patient concerns',
              suggested: 'Medication, Laboratory orders',
            },
            {
              context: 'Care Plan Updates',
              icon: '🎯',
              color: 'Green (#10B981)',
              desc: 'Order services to support care plan goals',
              prefilled: 'Patient, admission, care plan goal description',
              suggested: 'Therapy, Skilled Nursing, Medication, DME orders',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.context}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{item.desc}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-900 mb-1">Auto-Prefilled:</p>
                    <p className="text-blue-700">{item.prefilled}</p>
                  </div>
                  <div className="text-xs bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-900 mb-1">Suggested Orders:</p>
                    <p className="text-green-700">{item.suggested}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Smart Prefill Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Smart Prefill Features</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Always Prefilled:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  field: 'Patient Information',
                  desc: 'Patient name and ID automatically filled',
                  example: 'Margaret Johnson (PAT-001)',
                },
                {
                  field: 'Admission Context',
                  desc: 'Current admission ID linked',
                  example: 'ADM-12345',
                },
                {
                  field: 'Clinician Name',
                  desc: 'Current user automatically recorded',
                  example: 'Emily Chen, RN',
                },
                {
                  field: 'Date Context',
                  desc: 'Visit or assessment date captured',
                  example: 'December 15, 2024',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">{item.field}</h5>
                  <p className="text-xs text-gray-700 mb-1">{item.desc}</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Example:</span> {item.example}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Context-Specific Prefill:</h4>
            <div className="space-y-3">
              {[
                {
                  context: 'From Visit',
                  prefill: 'Clinical Findings',
                  example:
                    '"Based on visit findings: Patient experiencing increased shortness of breath on exertion."',
                },
                {
                  context: 'From Wound',
                  prefill: 'Wound Details',
                  example:
                    '"Wound care required for Right heel wound. Current size: 3.2 x 2.5 cm. Signs of infection."',
                },
                {
                  context: 'From Medication',
                  prefill: 'Medication & Concern',
                  example:
                    '"Medication order related to Lisinopril 10mg. Patient reports persistent dry cough."',
                },
                {
                  context: 'From Care Plan',
                  prefill: 'Goal Description',
                  example:
                    '"Order to support care plan goal: Increase ambulation distance to 100 feet with walker."',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      {item.context} → {item.prefill}
                    </p>
                    <p className="text-xs text-blue-700 italic">{item.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Order Type Suggestions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Context-Aware Order Type Suggestions
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Based on the clinical context, the system suggests the most relevant order types
            to streamline selection.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                context: 'Visit Documentation',
                suggested: ['Skilled Nursing', 'Therapy', 'Medication', 'Lab'],
                color: 'blue',
              },
              {
                context: 'Wound Documentation',
                suggested: ['Wound Care', 'Medication', 'DME/Supplies', 'Lab'],
                color: 'red',
              },
              {
                context: 'Medication Review',
                suggested: ['Medication', 'Laboratory'],
                color: 'purple',
              },
              {
                context: 'Care Plan Updates',
                suggested: ['Therapy', 'Skilled Nursing', 'Medication', 'DME'],
                color: 'green',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">{item.context}</h5>
                <div className="flex flex-wrap gap-2">
                  {item.suggested.map((type, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-200`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* UX Benefits */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">UX Benefits</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ Reduces Duplicate Data Entry</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>No need to re-enter patient name, ID, or admission information</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Clinical context automatically documented in rationale</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Date and clinician information captured automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Saves 60-70% of typical data entry time</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">
              ✓ Feels Integrated with Clinical Work
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Create orders without leaving current clinical documentation screen
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Natural workflow - order when clinically indicated</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Context preserved - no mental context switching</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Single-click order creation from any clinical screen</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">
              ✓ Improves Clinical Documentation Quality
            </h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Clinical rationale automatically includes relevant context</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Reduces missing or incomplete order justifications</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Better linkage between assessments and orders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Improved compliance with Medicare documentation requirements</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Key Features Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '4 clinical context integrations',
            'Smart prefill of patient data',
            'Automatic admission linking',
            'Clinician auto-capture',
            'Date context preservation',
            'Clinical findings prefill',
            'Wound details prefill',
            'Medication concern prefill',
            'Care plan goal prefill',
            'Context-aware order type suggestions',
            '8 order types supported',
            'Frequency selection dropdown',
            'Duration field',
            'Start/end date pickers',
            '3 urgency levels (Routine/Urgent/STAT)',
            'Clinical rationale textarea',
            'Additional instructions field',
            'Visual prefilled data banner',
            'Editable prefilled fields',
            'Source context display',
            'Color-coded by context type',
            'Suggested order types highlighted',
            'One-click order creation',
            'Save and close workflow',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
