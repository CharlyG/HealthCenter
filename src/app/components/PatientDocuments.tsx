/**
 * Patient Documents Section
 * Uploaded patient documents organized by folders/categories.
 * Features:
 *  - Upload to Supabase Storage (click + drag-and-drop)
 *  - Folder navigation with 8 healthcare categories
 *  - File type filtering (PDF, Image, Spreadsheet, Other)
 *  - Client-side pagination with configurable page size
 *  - Document version history tracking
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FileText,
  FolderOpen,
  Upload,
  Search,
  Loader2,
  RefreshCw,
  File,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
  Clock,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { patientDocumentGateway, type PatientDocumentMeta } from '../lib/dataGateway';

interface PatientDocumentsProps {
  patientId: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  count: number;
}

// Predefined folder structure for healthcare documents
const FOLDER_DEFINITIONS = [
  { id: 'clinical', name: 'Clinical Documents' },
  { id: 'orders', name: 'Physician Orders' },
  { id: 'insurance', name: 'Insurance & Authorization' },
  { id: 'consent', name: 'Consent Forms' },
  { id: 'labs', name: 'Lab Results' },
  { id: 'imaging', name: 'Imaging & Reports' },
  { id: 'correspondence', name: 'Correspondence' },
  { id: 'other', name: 'Other' },
];

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Images' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'other', label: 'Other' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <FileText className="size-5 text-red-500" />;
    case 'image':
      return <Image className="size-5 text-blue-500" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="size-5 text-green-500" />;
    default:
      return <File className="size-5 text-gray-500" />;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PatientDocuments({ patientId }: PatientDocumentsProps) {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [documents, setDocuments] = useState<PatientDocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('other');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolder, searchQuery, fileTypeFilter, pageSize]);

  // Load documents from server
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await patientDocumentGateway.list(patientId);
      setDocuments(docs);
    } catch (err) {
      console.error('[PatientDocuments] Load error:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle file upload
  const handleUpload = useCallback(async (files: FileList | File[] | null) => {
    if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) return;
    const targetFolder = currentFolder || uploadFolder;
    setUploading(true);

    const fileArr = files instanceof FileList ? Array.from(files) : files;
    let successCount = 0;
    for (const file of fileArr) {
      const result = await patientDocumentGateway.upload(
        patientId,
        file,
        targetFolder,
        'Current User',
      );
      if (result) {
        successCount++;
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
      await loadDocuments();
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [patientId, currentFolder, uploadFolder, loadDocuments]);

  // ─── Drag & Drop ──────────────────────────────────────────────────
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      // Only deactivate if leaving the drop zone entirely
      const rect = dropRef.current?.getBoundingClientRect();
      if (rect) {
        const { clientX, clientY } = e;
        if (
          clientX < rect.left || clientX > rect.right ||
          clientY < rect.top || clientY > rect.bottom
        ) {
          setDragActive(false);
        }
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }, [handleUpload]);

  // Handle document delete
  const handleDelete = useCallback(async (doc: PatientDocumentMeta) => {
    if (!confirm(`Delete "${doc.name}"? This action cannot be undone.`)) return;
    const success = await patientDocumentGateway.delete(patientId, doc.id);
    if (success) {
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } else {
      toast.error('Failed to delete document');
    }
  }, [patientId]);

  // Handle document download/view via signed URL
  const handleView = useCallback((doc: PatientDocumentMeta) => {
    if (doc.signed_url) {
      window.open(doc.signed_url, '_blank');
    } else {
      toast.info('Preview not available for demo documents. Upload a real file to enable download.');
    }
  }, []);

  // Compute folder counts
  const folders: DocumentFolder[] = useMemo(() =>
    FOLDER_DEFINITIONS.map((f) => ({
      ...f,
      count: documents.filter((d) => d.folder === f.id).length,
    })),
    [documents]
  );

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((d) => currentFolder ? d.folder === currentFolder : true)
      .filter((d) =>
        searchQuery
          ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
      .filter((d) => {
        if (fileTypeFilter === 'all') return true;
        if (fileTypeFilter === 'other') return !['pdf', 'image', 'spreadsheet'].includes(d.type);
        return d.type === fileTypeFilter;
      });
  }, [documents, currentFolder, searchQuery, fileTypeFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const currentFolderDef = folders.find((f) => f.id === currentFolder);

  const showFolderGrid = !loading && documents.length > 0 && !currentFolder && !searchQuery && fileTypeFilter === 'all';
  const showDocumentList = !loading && (currentFolder || searchQuery || fileTypeFilter !== 'all');
  const showRecentDocs = !loading && documents.length > 0 && !currentFolder && !searchQuery && fileTypeFilter === 'all';

  return (
    <div
      ref={dropRef}
      className="space-y-6 relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
      />

      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div className="absolute inset-0 z-50 bg-blue-50/90 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Upload className="size-12 mx-auto mb-3 text-blue-500 animate-bounce" />
            <p className="text-lg font-semibold text-blue-700">Drop files to upload</p>
            <p className="text-sm text-blue-500 mt-1">
              Files will be uploaded to {currentFolder ? (currentFolderDef?.name || currentFolder) : (FOLDER_DEFINITIONS.find(f => f.id === uploadFolder)?.name || uploadFolder)}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {currentFolder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setCurrentFolder(null); setFileTypeFilter('all'); }}
              className="gap-1"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {currentFolder ? currentFolderDef?.name || 'Documents' : 'Documents'}
          </h2>
          {!loading && (
            <Badge variant="secondary" className="text-xs">
              {filteredDocuments.length} file{filteredDocuments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              className="pl-9 w-[200px] h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* File Type Filter */}
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <Filter className="size-3.5 mr-1 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadDocuments} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {!currentFolder && (
            <Select value={uploadFolder} onValueChange={setUploadFolder}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Upload to..." />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_DEFINITIONS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading documents...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="size-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700 mb-2">No documents yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop files here, or click Upload to add patient documents.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="gap-1.5">
              <Upload className="size-4" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Folder Grid */}
      {showFolderGrid && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setCurrentFolder(folder.id)}
              className="text-left p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="size-6 text-amber-500 group-hover:text-blue-500 transition-colors" />
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {folder.count}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-gray-900">{folder.name}</p>
            </button>
          ))}
        </div>
      )}

      {/* Drop Zone Hint (when folder grid is showing) */}
      {showFolderGrid && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-200 transition-colors">
          <Upload className="size-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">
            Drag and drop files anywhere on this page to upload
          </p>
        </div>
      )}

      {/* Document List */}
      {showDocumentList && (
        <Card>
          <CardContent className="p-0">
            {paginatedDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="size-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No documents found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Try a different search term' :
                   fileTypeFilter !== 'all' ? 'Try a different file type filter' :
                   'Upload documents to this folder'}
                </p>
                {currentFolder && !searchQuery && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5" />
                    Upload to {currentFolderDef?.name}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {paginatedDocuments.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      patientId={patientId}
                      folders={folders}
                      showFolder={!currentFolder}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                {filteredDocuments.length > pageSize && (
                  <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredDocuments.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      {showRecentDocs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {documents.slice(0, 8).map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  patientId={patientId}
                  folders={folders}
                  showFolder
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {documents.length > 8 && (
              <div className="text-center py-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 text-xs"
                  onClick={() => setSearchQuery(' ')}
                >
                  View all {documents.length} documents
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Document Row ────────────────────────────────────────────────────────────

const DocumentRow = React.memo(function DocumentRow({
  doc,
  patientId,
  folders,
  showFolder,
  onView,
  onDelete,
}: {
  doc: PatientDocumentMeta;
  patientId: string;
  folders: DocumentFolder[];
  showFolder: boolean;
  onView: (doc: PatientDocumentMeta) => void;
  onDelete: (doc: PatientDocumentMeta) => void;
}) {
  const [showVersions, setShowVersions] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getFileIcon(doc.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
              {(doc as any).version && (doc as any).version > 1 && (
                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200">
                  v{(doc as any).version}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span>{doc.uploaded_by}</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDate(doc.uploaded_at)}
              </span>
              <span>{doc.size}</span>
              {showFolder && (
                <Badge variant="outline" className="text-[10px] h-4 px-1">
                  {folders.find((f) => f.id === doc.folder)?.name || doc.folder}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Version History */}
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            title="Version History"
            onClick={() => setShowVersions(!showVersions)}
          >
            <History className="size-4 text-gray-400 hover:text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            title="View / Download"
            onClick={() => onView(doc)}
          >
            <Eye className="size-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            title="Download"
            onClick={() => {
              if (doc.signed_url) {
                const a = document.createElement('a');
                a.href = doc.signed_url;
                a.download = doc.name;
                a.click();
              } else {
                toast.info('Download not available for demo documents.');
              }
            }}
          >
            <Download className="size-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 hover:text-red-600"
            title="Delete"
            onClick={() => onDelete(doc)}
          >
            <Trash2 className="size-4 text-gray-500" />
          </Button>
        </div>
      </div>
      {/* Version History Panel */}
      {showVersions && (
        <VersionHistoryPanel
          patientId={patientId}
          docId={doc.id}
          docName={doc.name}
          onClose={() => setShowVersions(false)}
        />
      )}
    </>
  );
});

// ── Version History Panel ───────────────────────────────────────────────────

interface VersionHistoryPanelProps {
  patientId: string;
  docId: string;
  docName: string;
  onClose: () => void;
}

const VersionHistoryPanel = React.memo(function VersionHistoryPanel({
  patientId,
  docId,
  docName,
  onClose,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await patientDocumentGateway.getVersionHistory(patientId, docId);
        setVersions(data.versions || []);
      } catch (err) {
        console.error('[VersionHistoryPanel] Error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [patientId, docId]);

  return (
    <div className="px-4 pb-3 bg-gray-50 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <History className="size-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-gray-700">
            Version History — {docName}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="size-3.5 text-gray-400" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="size-3.5 animate-spin text-gray-400" />
          <span className="text-xs text-gray-500">Loading versions...</span>
        </div>
      ) : versions.length <= 1 ? (
        <p className="text-xs text-gray-400 py-1">
          This is the only version. Re-upload a file with the same name to create a new version.
        </p>
      ) : (
        <div className="space-y-1">
          {versions.map((v, idx) => (
            <div
              key={v.docId}
              className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${
                v.isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] h-4 px-1 ${
                    v.isCurrent ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  v{v.version || versions.length - idx}
                </Badge>
                <span className="text-gray-600">{v.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>{v.size}</span>
                <span>{formatDateTime(v.uploadedAt)}</span>
                {v.isCurrent && (
                  <Badge className="text-[9px] h-4 px-1 bg-blue-600 text-white">Current</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ── Pagination Bar ──────────────────────────────────────────────────────────

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PaginationBar = React.memo(function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>
          {startItem}–{endItem} of {totalItems}
        </span>
        <span className="text-gray-300">|</span>
        <span>Show</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-[60px] h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let page: number;
          if (totalPages <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= totalPages - 2) {
            page = totalPages - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          return (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
});
