/**
 * ASSESSMENT SIGNATURE PANEL
 * 
 * Electronic signature capture with attestation
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { CheckCircle2, FileCheck, AlertCircle, User, Calendar, MapPin } from 'lucide-react';
import type { Assessment, AssessmentSignature } from '../../types/assessment';

interface AssessmentSignaturePanelProps {
  assessment: Assessment;
  onSign: (signature: Omit<AssessmentSignature, 'id'>) => void;
  onCancel: () => void;
}

export function AssessmentSignaturePanel({
  assessment,
  onSign,
  onCancel,
}: AssessmentSignaturePanelProps) {
  const [signatureName, setSignatureName] = useState('');
  const [credentials, setCredentials] = useState('');
  const [attestation1, setAttestation1] = useState(false);
  const [attestation2, setAttestation2] = useState(false);
  const [attestation3, setAttestation3] = useState(false);

  const canSign = signatureName && credentials && attestation1 && attestation2 && attestation3;

  const handleSign = () => {
    if (!canSign) return;

    const signature: Omit<AssessmentSignature, 'id'> = {
      signedBy: `${signatureName}, ${credentials}`,
      signedByRole: credentials,
      signedAt: new Date().toISOString(),
      signatureType: 'electronic',
      ipAddress: '192.168.1.1', // This would come from backend
      location: 'Web Application',
    };

    onSign(signature);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Sign Assessment</h2>
        <p className="text-gray-600 mt-2">
          By signing, you attest that this assessment is accurate and complete
        </p>
      </div>

      {/* Assessment Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Patient:</span>
            <span className="font-medium text-gray-900 ml-2">{assessment.patientName}</span>
          </div>
          <div>
            <span className="text-gray-600">Assessment Type:</span>
            <span className="font-medium text-gray-900 ml-2">
              {assessment.type.replace(/-/g, ' ')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="font-medium text-gray-900 ml-2">
              {new Date(assessment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Completion:</span>
            <Badge className="ml-2 bg-green-100 text-green-700">
              {assessment.percentComplete}% Complete
            </Badge>
          </div>
        </div>
      </div>

      {/* Validation Check */}
      {assessment.validationIssues.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Cannot Sign - Validation Issues</h4>
              <p className="text-sm text-red-700 mt-1">
                This assessment has {assessment.validationIssues.length} validation issue
                {assessment.validationIssues.length !== 1 ? 's' : ''} that must be resolved before signing.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onCancel}
              >
                Return to Assessment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Signature Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Enter your full name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Credentials <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="e.g., RN, PT, OTR, SLP, MSW"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
              />
            </div>
          </div>

          {/* Attestation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">Attestation</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                checked={attestation1}
                onCheckedChange={(checked) => setAttestation1(checked as boolean)}
                id="attest1"
              />
              <label htmlFor="attest1" className="text-sm text-gray-700 cursor-pointer">
                I attest that the information contained in this assessment is accurate and complete to
                the best of my knowledge and reflects my professional clinical judgment.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={attestation2}
                onCheckedChange={(checked) => setAttestation2(checked as boolean)}
                id="attest2"
              />
              <label htmlFor="attest2" className="text-sm text-gray-700 cursor-pointer">
                I have personally evaluated the patient and the assessment reflects my direct
                observation and clinical findings.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={attestation3}
                onCheckedChange={(checked) => setAttestation3(checked as boolean)}
                id="attest3"
              />
              <label htmlFor="attest3" className="text-sm text-gray-700 cursor-pointer">
                I understand that my electronic signature has the same legal effect as a handwritten
                signature and I am responsible for this documentation.
              </label>
            </div>
          </div>

          {/* Signature Metadata */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3 text-sm">Signature Details</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Signature Date/Time: {new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Location: Web Application</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Signature Type: Electronic</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              disabled={!canSign}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Sign Assessment
            </Button>
          </div>

          {!canSign && (
            <p className="text-sm text-center text-gray-600 mt-3">
              Please complete all required fields and check all attestations to sign
            </p>
          )}
        </>
      )}
    </div>
  );
}
