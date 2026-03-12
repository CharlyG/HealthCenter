/**
 * Patient Billing Section - Admission-Based
 * 
 * Displays billing information grouped by admission episode:
 * - Claims grouped by admission
 * - Admission summary panel (charges, payments, balance)
 * - Transactions and payments by admission
 * - Statement periods and billing history
 */
import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  FileCheck,
  AlertCircle,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientBillingProps {
  patientId: string;
  admissionId?: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  admissionId: string;
  admissionStartDate: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  payer: string;
  payerType: 'primary' | 'secondary' | 'tertiary';
  totalCharges: number;
  adjustments: number;
  allowedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  status: 'draft' | 'pending' | 'submitted' | 'accepted' | 'paid' | 'partial_payment' | 'denied' | 'appealed';
  submittedDate?: string;
  paidDate?: string;
  serviceCount: number;
  denialReason?: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'charge' | 'payment' | 'adjustment' | 'refund';
  description: string;
  amount: number;
  payer?: string;
  claimNumber?: string;
  status: 'posted' | 'pending' | 'reversed';
}

interface AdmissionBillingSummary {
  admissionId: string;
  admissionStartDate: string;
  status: string;
  primaryPayer: string;
  totalCharges: number;
  totalAdjustments: number;
  totalPayments: number;
  outstandingBalance: number;
  claimCount: number;
  lastClaimDate?: string;
}

// Mock data generator
function generateMockClaims(patientId: string, admissionId: string): Claim[] {
  const claims: Claim[] = [];
  const now = new Date();
  const admissionStart = new Date('2026-02-15');

  const statuses: Claim['status'][] = [
    'paid',
    'paid',
    'partial_payment',
    'submitted',
    'accepted',
    'pending',
    'draft',
  ];

  for (let i = 0; i < 7; i++) {
    const periodStart = new Date(admissionStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    const totalCharges = 800 + Math.random() * 1200;
    const adjustments = totalCharges * 0.15;
    const allowedAmount = totalCharges - adjustments;
    const status = statuses[i];
    const paidAmount = status === 'paid' ? allowedAmount : status === 'partial_payment' ? allowedAmount * 0.6 : 0;

    claims.push({
      id: `claim-${i}`,
      claimNumber: `CLM-2026-${String(i + 1).padStart(4, '0')}`,
      admissionId,
      admissionStartDate: admissionStart.toISOString(),
      statementPeriodStart: periodStart.toISOString(),
      statementPeriodEnd: periodEnd.toISOString(),
      payer: i % 3 === 0 ? 'Medicare Part A' : i % 3 === 1 ? 'Blue Cross Blue Shield' : 'Aetna',
      payerType: 'primary',
      totalCharges,
      adjustments,
      allowedAmount,
      paidAmount,
      patientResponsibility: status === 'paid' ? 0 : allowedAmount * 0.2,
      status,
      submittedDate: i < 5 ? new Date(periodEnd.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      paidDate: status === 'paid' ? new Date(periodEnd.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      serviceCount: 8 + Math.floor(Math.random() * 7),
      denialReason: status === 'denied' ? 'Missing documentation' : undefined,
    });
  }

  return claims;
}

function generateMockTransactions(claims: Claim[]): Transaction[] {
  const transactions: Transaction[] = [];

  claims.forEach((claim) => {
    // Charge transaction
    transactions.push({
      id: `txn-charge-${claim.id}`,
      date: claim.statementPeriodEnd,
      type: 'charge',
      description: `Services for period ${new Date(claim.statementPeriodStart).toLocaleDateString()} - ${new Date(claim.statementPeriodEnd).toLocaleDateString()}`,
      amount: claim.totalCharges,
      claimNumber: claim.claimNumber,
      status: 'posted',
    });

    // Adjustment
    if (claim.adjustments > 0) {
      transactions.push({
        id: `txn-adj-${claim.id}`,
        date: claim.submittedDate || claim.statementPeriodEnd,
        type: 'adjustment',
        description: 'Contractual adjustment',
        amount: -claim.adjustments,
        payer: claim.payer,
        claimNumber: claim.claimNumber,
        status: 'posted',
      });
    }

    // Payment
    if (claim.paidAmount > 0 && claim.paidDate) {
      transactions.push({
        id: `txn-pay-${claim.id}`,
        date: claim.paidDate,
        type: 'payment',
        description: 'Insurance payment',
        amount: -claim.paidAmount,
        payer: claim.payer,
        claimNumber: claim.claimNumber,
        status: 'posted',
      });
    }
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function PatientBilling({ patientId, admissionId }: PatientBillingProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'claims' | 'transactions'>('summary');

  useEffect(() => {
    if (admissionId) {
      loadBillingData();
    } else {
      setLoading(false);
    }
  }, [admissionId, patientId]);

  const loadBillingData = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      // TODO: Replace with real API calls
      // const result = await billingGateway.getAdmissionBilling(patientId, admissionId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockClaims = generateMockClaims(patientId, admissionId);
      const mockTransactions = generateMockTransactions(mockClaims);
      
      setClaims(mockClaims);
      setTransactions(mockTransactions);
    } catch (err) {
      console.error('[PatientBilling] Load error:', err);
      setClaims([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate admission billing summary
  const billingSummary: AdmissionBillingSummary | null = useMemo(() => {
    if (!admissionId || claims.length === 0) return null;

    const totalCharges = claims.reduce((sum, c) => sum + c.totalCharges, 0);
    const totalAdjustments = claims.reduce((sum, c) => sum + c.adjustments, 0);
    const totalPayments = claims.reduce((sum, c) => sum + c.paidAmount, 0);
    const outstandingBalance = totalCharges - totalAdjustments - totalPayments;

    const sortedClaims = [...claims].sort((a, b) => 
      new Date(b.submittedDate || b.statementPeriodEnd).getTime() - 
      new Date(a.submittedDate || a.statementPeriodEnd).getTime()
    );

    return {
      admissionId,
      admissionStartDate: claims[0].admissionStartDate,
      status: 'active',
      primaryPayer: claims[0].payer,
      totalCharges,
      totalAdjustments,
      totalPayments,
      outstandingBalance,
      claimCount: claims.length,
      lastClaimDate: sortedClaims[0]?.submittedDate,
    };
  }, [claims, admissionId]);

  if (!admissionId) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its billing information"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="size-6 text-gray-600" />
            Billing
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Billing information for the selected admission
          </p>
        </div>
      </div>

      {/* Admission Billing Summary Card */}
      {billingSummary && (
        <Card className="border-2 border-green-100 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Receipt className="size-4 text-green-600" />
              Admission Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admission Info */}
            <div className="grid grid-cols-4 gap-4 pb-3 border-b border-green-200">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Admission Start</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(billingSummary.admissionStartDate).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Primary Payer</p>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">{billingSummary.primaryPayer}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Claims Submitted</p>
                <p className="text-sm font-semibold text-gray-900">{billingSummary.claimCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Last Claim</p>
                <p className="text-sm font-semibold text-gray-900">
                  {billingSummary.lastClaimDate 
                    ? new Date(billingSummary.lastClaimDate).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="size-5 text-blue-600" />
                  <TrendingUp className="size-4 text-blue-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Total Charges</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${billingSummary.totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="size-5 text-amber-600" />
                  <span className="text-[10px] text-amber-600 font-medium">ADJUSTMENTS</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">Adjustments</p>
                <p className="text-2xl font-bold text-amber-700">
                  -${billingSummary.totalAdjustments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <TrendingDown className="size-4 text-green-500" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Payments Received</p>
                <p className="text-2xl font-bold text-green-700">
                  ${billingSummary.totalPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className={`size-5 ${billingSummary.outstandingBalance > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  {billingSummary.outstandingBalance > 0 && (
                    <AlertTriangle className="size-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">Outstanding Balance</p>
                <p className={`text-2xl font-bold ${billingSummary.outstandingBalance > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                  ${billingSummary.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Payment Rate */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">Payment Collection Rate</p>
                <p className="text-xs text-gray-600">
                  {((billingSummary.totalPayments / (billingSummary.totalCharges - billingSummary.totalAdjustments)) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                  style={{
                    width: `${Math.min((billingSummary.totalPayments / (billingSummary.totalCharges - billingSummary.totalAdjustments)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="summary">
            Summary
          </TabsTrigger>
          <TabsTrigger value="claims">
            Claims ({claims.length})
          </TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <ClaimsSummaryView claims={claims} />
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-3">
          <ClaimsListView claims={claims} />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-3">
          <TransactionsListView transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Claims Summary View Component
interface ClaimsSummaryViewProps {
  claims: Claim[];
}

function ClaimsSummaryView({ claims }: ClaimsSummaryViewProps) {
  const statusGroups = useMemo(() => {
    const groups: Record<string, Claim[]> = {};
    
    claims.forEach((claim) => {
      if (!groups[claim.status]) {
        groups[claim.status] = [];
      }
      groups[claim.status].push(claim);
    });

    return groups;
  }, [claims]);

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    paid: { label: 'Paid', color: 'text-green-600', icon: CheckCircle2 },
    partial_payment: { label: 'Partial Payment', color: 'text-amber-600', icon: Clock },
    submitted: { label: 'Submitted', color: 'text-blue-600', icon: FileText },
    accepted: { label: 'Accepted', color: 'text-blue-600', icon: FileCheck },
    pending: { label: 'Pending', color: 'text-gray-600', icon: Clock },
    draft: { label: 'Draft', color: 'text-gray-400', icon: FileText },
    denied: { label: 'Denied', color: 'text-red-600', icon: XCircle },
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Claims by Status</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(statusGroups).map(([status, claimsInStatus]) => {
          const config = statusConfig[status] || statusConfig.pending;
          const Icon = config.icon;
          const totalAmount = claimsInStatus.reduce((sum, c) => sum + c.totalCharges, 0);

          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`size-5 ${config.color}`} />
                    <p className="font-semibold text-gray-900">{config.label}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {claimsInStatus.length}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-600 mt-1">Total charges</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Claims List View Component
interface ClaimsListViewProps {
  claims: Claim[];
}

function ClaimsListView({ claims }: ClaimsListViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial_payment':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted':
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (claims.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <FileText className="size-12 text-gray-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">No claims found</p>
              <p className="text-xs text-gray-600 mt-1">
                Claims will appear here when submitted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <Card key={claim.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
                <FileText className="size-5 text-blue-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{claim.claimNumber}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {claim.serviceCount} services
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(claim.status)} text-xs border`}>
                    {claim.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Admission and Period */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="size-3.5" />
                    <div>
                      <p className="text-[10px] text-gray-500">Admission Start</p>
                      <p className="font-medium">
                        {new Date(claim.admissionStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="size-3.5" />
                    <div>
                      <p className="text-[10px] text-gray-500">Statement Period</p>
                      <p className="font-medium">
                        {new Date(claim.statementPeriodStart).toLocaleDateString()} - {new Date(claim.statementPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CreditCard className="size-3.5" />
                    <div>
                      <p className="text-[10px] text-gray-500">Payer</p>
                      <p className="font-medium">{claim.payer}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="grid grid-cols-5 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Charges</p>
                      <p className="font-semibold text-gray-900">
                        ${claim.totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Adjustments</p>
                      <p className="font-semibold text-amber-700">
                        -${claim.adjustments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Allowed</p>
                      <p className="font-semibold text-blue-700">
                        ${claim.allowedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Paid</p>
                      <p className="font-semibold text-green-700">
                        ${claim.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Balance</p>
                      <p className={`font-semibold ${claim.allowedAmount - claim.paidAmount > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                        ${(claim.allowedAmount - claim.paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                {(claim.submittedDate || claim.paidDate) && (
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    {claim.submittedDate && (
                      <span>Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                    )}
                    {claim.paidDate && (
                      <span>Paid: {new Date(claim.paidDate).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {/* Denial Reason */}
                {claim.denialReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-center gap-2">
                    <AlertTriangle className="size-3.5 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-700">
                      <span className="font-semibold">Denial Reason:</span> {claim.denialReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Transactions List View Component
interface TransactionsListViewProps {
  transactions: Transaction[];
}

function TransactionsListView({ transactions }: TransactionsListViewProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
        return <FileText className="size-4 text-blue-600" />;
      case 'payment':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'adjustment':
        return <TrendingDown className="size-4 text-amber-600" />;
      case 'refund':
        return <TrendingUp className="size-4 text-purple-600" />;
      default:
        return <Receipt className="size-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'charge':
        return 'text-blue-700';
      case 'payment':
        return 'text-green-700';
      case 'adjustment':
        return 'text-amber-700';
      case 'refund':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Receipt className="size-12 text-gray-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">No transactions found</p>
              <p className="text-xs text-gray-600 mt-1">
                Transactions will appear here when posted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-1">{getTransactionIcon(txn.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className={`text-sm font-medium ${getTransactionColor(txn.type)} capitalize`}>
                        {txn.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-600">{txn.description}</p>
                    </div>
                    <p className={`text-lg font-bold flex-shrink-0 ml-4 ${
                      txn.amount > 0 ? 'text-blue-700' : 'text-green-700'
                    }`}>
                      {txn.amount > 0 ? '+' : ''}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                    <span>{new Date(txn.date).toLocaleDateString()}</span>
                    {txn.payer && (
                      <>
                        <span>•</span>
                        <span>{txn.payer}</span>
                      </>
                    )}
                    {txn.claimNumber && (
                      <>
                        <span>•</span>
                        <span>{txn.claimNumber}</span>
                      </>
                    )}
                    <Badge variant="outline" className="text-[10px] h-4 px-1 ml-auto">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
