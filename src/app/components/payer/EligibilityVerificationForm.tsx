/**
 * Eligibility Verification Form
 * User enters payer, policy number, patient info → System returns coverage status
 */
import React, { useState, useMemo } from 'react';
import { cn } from '../ui/utils';
import {
  Shield, Search, User, CreditCard, Calendar, CheckCircle2,
  AlertCircle, Loader2, FileCheck, Activity, DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { verifyEligibilityReal } from '../../lib/payerApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

interface EligibilityRequest {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  payer: string;
  memberId: string;
  serviceDate?: string;
}

interface EligibilityResponse {
  status: 'active' | 'inactive' | 'pending';
  coverageActive: boolean;
  planName: string;
  groupNumber: string;
  effectiveDate: string;
  terminationDate?: string;
  copay: number;
  coinsurance: number;
  deductible: number;
  deductibleMet: number;
  oopMax: number;
  oopMet: number;
  homeHealthCovered: boolean;
  authorizationRequired: boolean;
  visitsAuthorized?: number;
  visitLimits?: string;
  planDetails?: string;
  responseCode: string;
  responseMessage: string;
}

const PAYER_OPTIONS = [
  'Medicare',
  'Medicaid',
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Aetna',
  'Cigna',
  'Humana',
  'Anthem',
  'WellCare',
  'Centene',
  'Other',
];

// ─── Verification Result ───────────────────────────────────────────────────

const VerificationResult = React.memo(function VerificationResult({
  result,
  onReset,
}: {
  result: EligibilityResponse;
  onReset: () => void;
}) {
  const isActive = result.status === 'active' && result.coverageActive;
  const deductiblePct = result.deductible > 0
    ? Math.min(100, (result.deductibleMet / result.deductible) * 100)
    : 100;
  const oopPct = result.oopMax > 0
    ? Math.min(100, (result.oopMet / result.oopMax) * 100)
    : 100;

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card className={cn(
        'border-2',
        isActive ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
      )}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              isActive ? 'bg-green-100' : 'bg-red-100'
            )}>
              {isActive ? (
                <CheckCircle2 className="size-6 text-green-600" />
              ) : (
                <AlertCircle className="size-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn(
                'text-lg font-semibold mb-1',
                isActive ? 'text-green-900' : 'text-red-900'
              )}>
                {isActive ? 'Coverage Active' : 'Coverage Inactive'}
              </h3>
              <p className={cn(
                'text-sm',
                isActive ? 'text-green-700' : 'text-red-700'
              )}>
                {result.responseMessage}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isActive ? 'default' : 'destructive'} className="text-xs">
                  {result.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-600">Code: {result.responseCode}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Coverage Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-600">Plan Name</Label>
              <p className="font-semibold text-gray-900 mt-1">{result.planName}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Group Number</Label>
              <p className="font-semibold text-gray-900 mt-1">{result.groupNumber || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Effective Date</Label>
              <p className="font-semibold text-gray-900 mt-1">
                {new Date(result.effectiveDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Termination Date</Label>
              <p className="font-semibold text-gray-900 mt-1">
                {result.terminationDate ? new Date(result.terminationDate).toLocaleDateString() : 'Ongoing'}
              </p>
            </div>
          </div>

          {result.planDetails && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{result.planDetails}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="size-5" />
            Cost Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-gray-600">Copay</Label>
              <p className="font-semibold text-gray-900 mt-1 text-lg">
                {result.copay > 0 ? formatCurrency(result.copay) : '$0'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Coinsurance</Label>
              <p className="font-semibold text-gray-900 mt-1 text-lg">{result.coinsurance}%</p>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Deductible</Label>
              <p className="font-semibold text-gray-900 mt-1 text-lg">{formatCurrency(result.deductible)}</p>
            </div>
          </div>

          {/* Deductible Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">Deductible Met</Label>
              <span className="text-xs font-semibold text-gray-900">
                {formatCurrency(result.deductibleMet)} / {formatCurrency(result.deductible)}
              </span>
            </div>
            <Progress value={deductiblePct} className="h-2" />
          </div>

          {/* Out-of-Pocket Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-gray-600">Out-of-Pocket Maximum</Label>
              <span className="text-xs font-semibold text-gray-900">
                {formatCurrency(result.oopMet)} / {formatCurrency(result.oopMax)}
              </span>
            </div>
            <Progress value={oopPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Authorization Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="size-5" />
            Authorization Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Home Health Covered</span>
            <Badge variant={result.homeHealthCovered ? 'default' : 'destructive'}>
              {result.homeHealthCovered ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Authorization Required</span>
            <Badge variant={result.authorizationRequired ? 'outline' : 'secondary'}>
              {result.authorizationRequired ? 'Required' : 'Not Required'}
            </Badge>
          </div>
          {result.visitsAuthorized && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Visits Authorized</span>
              <span className="text-sm font-semibold text-gray-900">{result.visitsAuthorized}</span>
            </div>
          )}
          {result.visitLimits && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">{result.visitLimits}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={onReset} variant="outline" className="flex-1">
          Verify Another
        </Button>
        <Button className="flex-1">
          Save to Patient Record
        </Button>
      </div>
    </div>
  );
});

// ─── Main Form ─────────────────────────────────────────────────────────────

export const EligibilityVerificationForm = React.memo(function EligibilityVerificationForm() {
  const [formData, setFormData] = useState<Partial<EligibilityRequest>>({
    serviceDate: new Date().toISOString().split('T')[0],
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<EligibilityResponse | null>(null);

  const isValid = useMemo(() => {
    return !!(
      formData.patientName &&
      formData.dateOfBirth &&
      formData.payer &&
      formData.memberId
    );
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setVerifying(true);
      const response = await verifyEligibilityReal(formData as EligibilityRequest);
      setResult(response);
      toast.success('Eligibility verified successfully');
    } catch (err: any) {
      console.error('[EligibilityVerificationForm] Error:', err);
      toast.error(err.message || 'Failed to verify eligibility');
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ serviceDate: new Date().toISOString().split('T')[0] });
  };

  if (result) {
    return <VerificationResult result={result} onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              placeholder="Last, First"
              value={formData.patientName || ''}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="patientId">Patient ID (Optional)</Label>
            <Input
              id="patientId"
              placeholder="MRN or Patient ID"
              value={formData.patientId || ''}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payer">Payer *</Label>
            <Select
              value={formData.payer}
              onValueChange={(value) => setFormData({ ...formData, payer: value })}
            >
              <SelectTrigger id="payer">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {PAYER_OPTIONS.map((payer) => (
                  <SelectItem key={payer} value={payer}>
                    {payer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memberId">Member ID / Policy Number *</Label>
            <Input
              id="memberId"
              placeholder="Member ID or policy number"
              value={formData.memberId || ''}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="serviceDate">Service Date (Optional)</Label>
            <Input
              id="serviceDate"
              type="date"
              value={formData.serviceDate || ''}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
            />
            <p className="text-xs text-gray-600 mt-1">
              Leave blank to verify current coverage
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={!isValid || verifying} className="w-full" size="lg">
        {verifying ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Verifying Eligibility...
          </>
        ) : (
          <>
            <Search className="size-4 mr-2" />
            Verify Eligibility
          </>
        )}
      </Button>
    </form>
  );
});
