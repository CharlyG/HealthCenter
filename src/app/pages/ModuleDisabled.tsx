import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function ModuleDisabled() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldOff className="size-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Module Disabled</CardTitle>
          <CardDescription>
            This module has been disabled by your organization administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Access Restricted:</strong> The module you're trying to access is currently disabled. 
              Please contact your system administrator if you believe you should have access to this functionality.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              <ArrowLeft className="size-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
