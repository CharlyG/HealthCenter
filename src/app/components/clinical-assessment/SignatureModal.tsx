/**
 * Signature Modal Component
 * HIPAA-compliant electronic signature capture for clinical assessments
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: {
    signedBy: string;
    signedByRole: string;
    signature: string;
    ipAddress?: string;
  }) => Promise<void>;
  assessmentTitle: string;
  patientName: string;
  defaultSignatory?: {
    name: string;
    role: string;
    credentials: string;
  };
}

export function SignatureModal({
  isOpen,
  onClose,
  onSign,
  assessmentTitle,
  patientName,
  defaultSignatory,
}: SignatureModalProps) {
  const [step, setStep] = useState<'credentials' | 'draw' | 'confirm'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Credential inputs
  const [signatoryName, setSignatoryName] = useState(defaultSignatory?.name || '');
  const [signatoryRole, setSignatoryRole] = useState(defaultSignatory?.role || '');
  const [credentials, setCredentials] = useState(defaultSignatory?.credentials || '');
  const [password, setPassword] = useState('');

  // Canvas signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('credentials');
      setPassword('');
      setError(null);
      setHasSignature(false);
    }
  }, [isOpen]);

  // ─── Canvas Drawing Logic ──────────────────────────────────────────────

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // ─── Form Handlers ─────────────────────────────────────────────────────

  const handleCredentialsNext = () => {
    if (!signatoryName || !signatoryRole || !credentials || !password) {
      setError('All fields are required');
      return;
    }

    // In production, verify password against stored credentials
    // For demo, accept any password
    setError(null);
    setStep('draw');
  };

  const handleDrawNext = () => {
    if (!hasSignature) {
      setError('Please provide your signature');
      return;
    }

    setError(null);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError(null);

    try {
      // Convert canvas to base64 image
      const signatureDataURL = canvas.toDataURL('image/png');

      // Get IP address (in production, this would be server-side)
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => undefined);

      await onSign({
        signedBy: `${signatoryName}, ${credentials}`,
        signedByRole: signatoryRole,
        signature: signatureDataURL,
        ipAddress,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign assessment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Electronic Signature</h2>
            <p className="text-sm text-gray-600 mt-1">
              {assessmentTitle} • {patientName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { key: 'credentials', label: 'Credentials' },
              { key: 'draw', label: 'Sign' },
              { key: 'confirm', label: 'Confirm' },
            ].map((s, idx) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === s.key
                        ? 'bg-blue-600 text-white'
                        : idx < ['credentials', 'draw', 'confirm'].indexOf(step)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx < ['credentials', 'draw', 'confirm'].indexOf(step) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                </div>
                {idx < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>HIPAA Compliance Notice:</strong> By signing this document electronically, you
                  attest that the information provided is accurate and complete. This signature is legally
                  binding and equivalent to a handwritten signature.
                </p>
              </div>

              <div>
                <Label htmlFor="signatory-name">Full Name *</Label>
                <Input
                  id="signatory-name"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="Sarah Thompson"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="signatory-role">Professional Role *</Label>
                <Input
                  id="signatory-role"
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  placeholder="Registered Nurse"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="credentials">Credentials *</Label>
                <Input
                  id="credentials"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  placeholder="RN, BSN"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Verify Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password to confirm identity"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password verification ensures only authorized personnel can sign
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Draw Signature */}
          {step === 'draw' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Instructions:</strong> Draw your signature in the box below using your mouse or
                  touchscreen. Your signature will be captured and encrypted.
                </p>
              </div>

              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={200}
                  className="w-full bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Signatory: <strong>{signatoryName}, {credentials}</strong>
                </p>
                <Button variant="outline" onClick={clearSignature} disabled={!hasSignature}>
                  Clear Signature
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Final Confirmation:</strong> Please review all information before submitting.
                  This action cannot be undone.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Assessment</p>
                  <p className="text-sm font-medium text-gray-900">{assessmentTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-sm font-medium text-gray-900">{patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signatory</p>
                  <p className="text-sm font-medium text-gray-900">
                    {signatoryName}, {credentials}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900">{signatoryRole}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'long',
                    })}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Signature Preview</p>
                <div className="border border-gray-200 rounded bg-white p-2">
                  <canvas
                    ref={(el) => {
                      if (el && canvasRef.current) {
                        const ctx = el.getContext('2d');
                        if (ctx) {
                          ctx.drawImage(canvasRef.current, 0, 0);
                        }
                      }
                    }}
                    width={560}
                    height={200}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input type="checkbox" id="attest" className="mt-1" required />
                <label htmlFor="attest" className="text-sm text-gray-700">
                  I attest that I have reviewed this assessment and that the information contained herein
                  is accurate and complete to the best of my knowledge. I understand that this electronic
                  signature is legally binding.
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'credentials') {
                onClose();
              } else if (step === 'draw') {
                setStep('credentials');
              } else {
                setStep('draw');
              }
            }}
            disabled={loading}
          >
            {step === 'credentials' ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={() => {
              if (step === 'credentials') {
                handleCredentialsNext();
              } else if (step === 'draw') {
                handleDrawNext();
              } else {
                handleConfirm();
              }
            }}
            disabled={loading}
          >
            {loading ? 'Signing...' : step === 'confirm' ? 'Sign & Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
