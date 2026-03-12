import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="size-8 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="size-4 mr-2" />
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
