/**
 * ERA Processing
 * Electronic Remittance Advice - Import and process 835 files
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '../ui/utils';
import {
  Upload, FileText, DollarSign, CheckCircle2, AlertCircle,
  Download, Search, Calendar, TrendingUp, Loader2,
  FileCheck, X, Eye, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LoadingState } from '../design-system/LoadingState';
import { fetchERAFiles, uploadERAFile, processERAFile } from '../../lib/payerApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

interface ERAFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedDate: string;
  uploadedBy: string;
  status: 'pending' | 'processing' | 'processed' | 'error';
  payer: string;
  checkNumber?: string;
  checkDate?: string;
  totalAmount: number;
  claimCount: number;
  processedDate?: string;
  errorMessage?: string;
  transactions?: ERATransaction[];
}

interface ERATransaction {
  id: string;
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  billedAmount: number;
  allowedAmount: number;
  paidAmount: number;
  adjustmentAmount: number;
  patientResponsibility: number;
  adjustments: {
    code: string;
    group: string;
    reason: string;
    amount: number;
  }[];
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-gray-50', color: 'text-gray-700', icon: <FileText className="size-3" /> },
  processing: { label: 'Processing', bg: 'bg-blue-50', color: 'text-blue-700', icon: <Loader2 className="size-3 animate-spin" /> },
  processed: { label: 'Processed', bg: 'bg-green-50', color: 'text-green-700', icon: <CheckCircle2 className="size-3" /> },
  error: { label: 'Error', bg: 'bg-red-50', color: 'text-red-700', icon: <AlertCircle className="size-3" /> },
};

// ─── Upload Area ───────────────────────────────────────────────────────────

const ERAUploadArea = React.memo(function ERAUploadArea({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      await handleUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      await handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      await uploadERAFile(file);
      toast.success('ERA file uploaded successfully');
      onUploadSuccess();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('[ERAUploadArea] Error:', err);
      toast.error(err.message || 'Failed to upload ERA file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
            uploading && 'opacity-50 pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <>
              <Loader2 className="size-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">Uploading ERA file...</p>
            </>
          ) : (
            <>
              <Upload className="size-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload ERA File</h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop 835 file here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".835,.txt,.x12"
                onChange={handleFileSelect}
                className="hidden"
                id="era-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="era-upload" className="cursor-pointer">
                  Browse Files
                </label>
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                Supports X12 835 EDI format (.835, .txt, .x12)
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Transaction Detail ────────────────────────────────────────────────────

const TransactionDetail = React.memo(function TransactionDetail({
  transaction,
}: {
  transaction: ERATransaction;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-l-2 border-gray-200 pl-4 space-y-2">
      <button
        className="w-full flex items-center gap-2 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="size-4 text-gray-400" /> : <ChevronRight className="size-4 text-gray-400" />}
        <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">{transaction.patientName}</p>
            <p className="text-xs text-gray-600">Claim #{transaction.claimNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">{formatCurrency(transaction.billedAmount)}</p>
            <p className="text-xs text-gray-600">Billed</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-blue-900">{formatCurrency(transaction.allowedAmount)}</p>
            <p className="text-xs text-blue-600">Allowed</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-900">{formatCurrency(transaction.paidAmount)}</p>
            <p className="text-xs text-green-600">Paid</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-amber-900">{formatCurrency(transaction.patientResponsibility)}</p>
            <p className="text-xs text-amber-600">Patient Resp.</p>
          </div>
        </div>
      </button>

      {expanded && transaction.adjustments && transaction.adjustments.length > 0 && (
        <div className="ml-6 space-y-2 p-3 bg-gray-50 rounded-lg">
          <h5 className="text-xs font-semibold text-gray-700 mb-2">Adjustments</h5>
          {transaction.adjustments.map((adj, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {adj.code}
                </Badge>
                <span className="text-gray-900">{adj.reason}</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(adj.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── ERA File Card ─────────────────────────────────────────────────────────

const ERAFileCard = React.memo(function ERAFileCard({
  file,
  onProcess,
}: {
  file: ERAFile;
  onProcess: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[file.status];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', statusConfig.bg)}>
                <FileText className={cn('size-6', statusConfig.color)} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{file.fileName}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{file.payer}</span>
                  <span>•</span>
                  <span>{new Date(file.uploadedDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Badge className={cn(statusConfig.bg, statusConfig.color)}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(file.totalAmount)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 mb-1">Claims</p>
              <p className="text-lg font-bold text-green-900">{file.claimCount}</p>
            </div>
            {file.checkNumber && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 mb-1">Check #</p>
                <p className="text-sm font-bold text-purple-900">{file.checkNumber}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {file.status === 'error' && file.errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{file.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {file.status === 'pending' && (
              <Button size="sm" onClick={() => onProcess(file.id)} className="flex-1">
                <Loader2 className="size-3 mr-1" />
                Process File
              </Button>
            )}
            {file.status === 'processed' && file.transactions && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="flex-1"
              >
                {expanded ? 'Hide' : 'View'} Transactions ({file.transactions.length})
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Download className="size-3 mr-1" />
              Download
            </Button>
          </div>

          {/* Transactions */}
          {expanded && file.transactions && (
            <div className="space-y-2 pt-3 border-t">
              <h4 className="text-sm font-semibold text-gray-900">Transactions</h4>
              {file.transactions.map((transaction) => (
                <TransactionDetail key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const ERAProcessing = React.memo(function ERAProcessing() {
  const [files, setFiles] = useState<ERAFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ERAFile['status'] | 'all'>('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchERAFiles();
      setFiles(data);
    } catch (err: any) {
      console.error('[ERAProcessing] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (fileId: string) => {
    try {
      await processERAFile(fileId);
      toast.success('ERA file processing started');
      await loadFiles();
    } catch (err: any) {
      console.error('[ERAProcessing] Process error:', err);
      toast.error(err.message || 'Failed to process ERA file');
    }
  };

  const filtered = useMemo(() => {
    let result = files;
    if (statusFilter !== 'all') {
      result = result.filter((f) => f.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          f.payer.toLowerCase().includes(q) ||
          f.checkNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [files, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const processed = files.filter((f) => f.status === 'processed');
    return {
      total: files.length,
      pending: files.filter((f) => f.status === 'pending').length,
      processed: processed.length,
      totalAmount: processed.reduce((sum, f) => sum + f.totalAmount, 0),
    };
  }, [files]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading ERA files..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">ERA Processing</h2>
        <p className="text-sm text-gray-600 mt-1">
          Import and process Electronic Remittance Advice (835) files
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
              </div>
              <FileCheck className="size-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.processed}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Remitted</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="size-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <ERAUploadArea onUploadSuccess={loadFiles} />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by file name, payer, or check number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Files List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No ERA files found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((file) => (
            <ERAFileCard key={file.id} file={file} onProcess={handleProcess} />
          ))}
        </div>
      )}
    </div>
  );
});
