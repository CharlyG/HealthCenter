/**
 * Patient Recent Documents - Right Drawer Component
 * Shows recent documentation drafts from the documentation-assist backend
 */
import { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { documentationGateway } from '../../../lib/dataGateway';

interface PatientRecentDocumentsProps {
  patientId: string;
}

export default function PatientRecentDocuments({ patientId }: PatientRecentDocumentsProps) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentationGateway.getDrafts(patientId);
      setDocs((res as any).drafts || []);
    } catch (err) {
      console.error('[PatientRecentDocuments] error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Sort by most recently updated, take 5
  const sorted = [...docs]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="size-4" />
          Recent Documents
          <Badge variant="secondary" className="ml-auto text-xs">{docs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            <FileText className="size-8 mx-auto mb-2 text-gray-400" />
            <p>No documents yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((doc: any) => (
              <div key={doc.id} className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2">
                  <FileText className="size-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.templateName || doc.formName || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1 ${
                          doc.status === 'completed' ? 'bg-green-50 text-green-700 border-green-300' :
                          doc.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {doc.status?.replace(/_/g, ' ') || 'draft'}
                      </Badge>
                      {doc.completionPercent != null && (
                        <span className="text-[10px] text-gray-400">{doc.completionPercent}%</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''} {doc.clinicianName ? `· ${doc.clinicianName}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
