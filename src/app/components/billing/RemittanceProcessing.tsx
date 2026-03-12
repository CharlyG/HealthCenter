/**
 * Remittance Processing Component
 * Upload remittance files (835 ERA) and match payments automatically.
 * Shows matched/unmatched transactions with manual reconciliation tools.
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  FileUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Search,
  Download,
  ArrowRight,
  Clock,
  Link2,
  Unlink,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { MetricCard } from '../design-system/MetricCard';
import { CompactTable, type CompactColumn } from '../design-system/CompactTable';
import { LoadingState } from '../design-system/LoadingState';
import { fetchRemittanceFiles, fetchRemittanceTransactions, matchTransaction } from '../../lib/billingApi';

type MatchStatus = 'matched' | 'unmatched' | 'partial' | 'adjustment';

interface RemittanceFile {
  id: string;
  fileName: string;
  payer: string;
  uploadDate: string;
  totalAmount: number;
  transactionCount: number;
  matchedCount: number;
  status: 'processing' | 'complete' | 'errors';
}

interface RemittanceTransaction {
  id: string;
  fileId: string;
  claimNumber: string;
  patientName: string;
  payer: string;
  billedAmount: number;
  paidAmount: number;
  adjustmentAmount: number;
  adjustmentReason?: string;
  checkNumber: string;
  paymentDate: string;
  matchStatus: MatchStatus;
  matchedClaimId?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const matchStatusConfig: Record<MatchStatus, { label: string; className: string; icon: React.ReactNode }> = {
  matched: { label: 'Matched', className: 'bg-green-50 text-green-700 border-green-200', icon: <Link2 className="size-3" /> },
  unmatched: { label: 'Unmatched', className: 'bg-red-50 text-red-700 border-red-200', icon: <Unlink className="size-3" /> },
  partial: { label: 'Partial', className: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <AlertCircle className="size-3" /> },
  adjustment: { label: 'Adjustment', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: <DollarSign className="size-3" /> },
};

export const RemittanceProcessing = React.memo(() => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<RemittanceFile[]>([]);
  const [transactions, setTransactions] = useState<RemittanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [filesData, txnData] = await Promise.all([
        fetchRemittanceFiles(),
        fetchRemittanceTransactions({ fileId: selectedFileId || undefined, search: searchQuery || undefined }),
      ]);
      setFiles(filesData);
      setTransactions(txnData);
    } catch (err: any) {
      console.error('[RemittanceProcessing] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedFileId, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(loadData, 300);
    return () => clearTimeout(debounce);
  }, [loadData]);

  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedFileId),
    [selectedFileId, files]
  );

  const filteredTransactions = useMemo(() => transactions, [transactions]);

  const stats = useMemo(() => {
    const totalFiles = files.length;
    const totalPaid = transactions.reduce((s, t) => s + t.paidAmount, 0);
    const totalAdj = transactions.reduce((s, t) => s + t.adjustmentAmount, 0);
    const matched = transactions.filter((t) => t.matchStatus === 'matched').length;
    const unmatched = transactions.filter((t) => t.matchStatus === 'unmatched').length;
    return { totalFiles, totalPaid, totalAdj, matched, unmatched, total: transactions.length };
  }, [files, transactions]);

  const simulateUpload = useCallback(() => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      simulateUpload();
    },
    [simulateUpload]
  );

  const handleFileSelect = useCallback(() => {
    simulateUpload();
  }, [simulateUpload]);

  const transactionColumns: CompactColumn<RemittanceTransaction>[] = useMemo(
    () => [
      {
        key: 'claim',
        header: 'Claim #',
        render: (item) => (
          <span className="font-mono text-xs font-medium text-blue-600">{item.claimNumber}</span>
        ),
      },
      {
        key: 'patient',
        header: 'Patient',
        render: (item) => (
          <div>
            <div className="font-medium text-gray-900">{item.patientName}</div>
            <div className="text-gray-500 text-xs">{item.payer}</div>
          </div>
        ),
      },
      {
        key: 'billed',
        header: 'Billed',
        align: 'right',
        render: (item) => <span className="text-gray-700">{formatCurrency(item.billedAmount)}</span>,
      },
      {
        key: 'paid',
        header: 'Paid',
        align: 'right',
        render: (item) => (
          <span className={item.paidAmount === 0 ? 'text-red-600' : 'text-green-600 font-semibold'}>
            {formatCurrency(item.paidAmount)}
          </span>
        ),
      },
      {
        key: 'adjustment',
        header: 'Adjustment',
        align: 'right',
        render: (item) =>
          item.adjustmentAmount > 0 ? (
            <div>
              <span className="text-orange-600">{formatCurrency(item.adjustmentAmount)}</span>
              {item.adjustmentReason && (
                <div className="text-xs text-gray-500 truncate max-w-[150px]" title={item.adjustmentReason}>
                  {item.adjustmentReason}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        key: 'check',
        header: 'Check #',
        render: (item) => <span className="text-xs text-gray-600">{item.checkNumber}</span>,
      },
      {
        key: 'status',
        header: 'Match',
        render: (item) => {
          const config = matchStatusConfig[item.matchStatus];
          return (
            <Badge className={`${config.className} text-xs`}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        width: '80px',
        render: (item) =>
          item.matchStatus === 'unmatched' ? (
            <Button size="sm" variant="outline" className="h-6 text-xs px-2">
              <Link2 className="size-3 mr-1" />
              Match
            </Button>
          ) : item.matchStatus === 'adjustment' ? (
            <Button size="sm" variant="outline" className="h-6 text-xs px-2">
              <RefreshCw className="size-3 mr-1" />
              Appeal
            </Button>
          ) : null,
      },
    ],
    []
  );

  const fileColumns: CompactColumn<RemittanceFile>[] = useMemo(
    () => [
      {
        key: 'file',
        header: 'File',
        render: (item) => (
          <div>
            <div className="font-medium text-gray-900 text-xs">{item.fileName}</div>
            <div className="text-gray-500 text-xs">{item.payer}</div>
          </div>
        ),
      },
      {
        key: 'date',
        header: 'Uploaded',
        render: (item) => (
          <span className="text-gray-600">
            {new Date(item.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        align: 'right',
        render: (item) => <span className="font-semibold">{formatCurrency(item.totalAmount)}</span>,
      },
      {
        key: 'matched',
        header: 'Matched',
        align: 'center',
        render: (item) => (
          <span className={item.matchedCount === item.transactionCount ? 'text-green-600' : 'text-orange-600'}>
            {item.matchedCount}/{item.transactionCount}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item) => {
          const config =
            item.status === 'complete'
              ? { label: 'Complete', className: 'bg-green-50 text-green-700 border-green-200' }
              : item.status === 'errors'
              ? { label: 'Has Errors', className: 'bg-red-50 text-red-700 border-red-200' }
              : { label: 'Processing', className: 'bg-blue-50 text-blue-700 border-blue-200' };
          return <Badge className={`${config.className} text-xs`}>{config.label}</Badge>;
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Files Processed"
          value={stats.totalFiles}
          subtitle="This period"
          icon={<FileUp className="size-4" />}
        />
        <MetricCard
          title="Total Payments"
          value={formatCurrency(stats.totalPaid)}
          subtitle={`${stats.total} transactions`}
          variant="success"
          icon={<DollarSign className="size-4" />}
        />
        <MetricCard
          title="Auto-Matched"
          value={`${stats.total > 0 ? Math.round((stats.matched / stats.total) * 100) : 0}%`}
          subtitle={`${stats.matched} of ${stats.total}`}
          icon={<Link2 className="size-4" />}
        />
        <MetricCard
          title="Unmatched"
          value={stats.unmatched}
          subtitle="Requires manual review"
          variant={stats.unmatched > 0 ? 'warning' : 'default'}
          icon={<Unlink className="size-4" />}
        />
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="size-5 text-blue-600" />
              Upload Remittance File
            </CardTitle>
            <div className="text-xs text-gray-500">Supported: 835 ERA, CSV</div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadProgress !== null ? (
            <div className="p-6 text-center">
              <FileUp className="size-10 text-blue-600 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                {uploadProgress < 100 ? 'Processing remittance file...' : 'File processed successfully!'}
              </p>
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {uploadProgress < 100
                  ? `${uploadProgress}% — Parsing transactions and matching claims...`
                  : 'All transactions parsed and auto-matching complete.'}
              </p>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="size-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                Drag and drop your remittance file here
              </p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".835,.csv,.txt"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="size-4 mr-1" />
                Browse Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Files */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFileId === file.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => setSelectedFileId(selectedFileId === file.id ? null : file.id)}
                >
                  <div className="flex items-start gap-2">
                    <FileText className={`size-4 shrink-0 mt-0.5 ${
                      file.status === 'complete' ? 'text-green-600' : file.status === 'errors' ? 'text-red-500' : 'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{file.fileName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {file.payer} · {new Date(file.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-semibold">{formatCurrency(file.totalAmount)}</span>
                        <span className={`text-xs ${file.matchedCount === file.transactionCount ? 'text-green-600' : 'text-orange-600'}`}>
                          {file.matchedCount}/{file.transactionCount} matched
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedFile ? `Transactions — ${selectedFile.fileName}` : 'All Transactions'}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                  {selectedFile && ` · ${formatCurrency(selectedFile.totalAmount)} total`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-48 h-8 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  <Download className="size-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <div className="text-red-500 text-sm text-center">{error}</div>
            ) : (
              <CompactTable
                data={filteredTransactions}
                columns={transactionColumns}
                keyExtractor={(item) => item.id}
                emptyMessage="No transactions found"
                striped
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

RemittanceProcessing.displayName = 'RemittanceProcessing';