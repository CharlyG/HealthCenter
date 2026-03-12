/**
 * NoAdmissionSelected Component
 * Displays a prompt when user tries to access admission-level data without selecting an admission
 */
import { FolderOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface NoAdmissionSelectedProps {
  message?: string;
  onSelectAdmission?: () => void;
}

export default function NoAdmissionSelected({ 
  message = 'Please select an admission to view this section',
  onSelectAdmission 
}: NoAdmissionSelectedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-blue-50 rounded-full p-4">
                <FolderOpen className="size-12 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                No Admission Selected
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex gap-2">
                <AlertCircle className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 space-y-1">
                  <p className="font-medium">This section contains admission-specific data:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>All records are filtered by the selected admission</li>
                    <li>Use the admission switcher at the top to change context</li>
                    <li>Patient-level data is always available regardless of selection</li>
                  </ul>
                </div>
              </div>
            </div>
            {onSelectAdmission && (
              <Button 
                onClick={onSelectAdmission}
                className="w-full"
              >
                Select an Admission
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
