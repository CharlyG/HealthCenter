/**
 * Vendor Integrations Panel
 * 
 * Quick access to integration management with status overview.
 */

import { useNavigate } from 'react-router';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ExternalLink, CheckCircle, XCircle, Settings } from 'lucide-react';
import { INTEGRATION_CATEGORIES } from '../../lib/integrationTypes';

export default function VendorIntegrationsPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const navigate = useNavigate();

  const integrationStatus = [
    { category: 'evv', status: 'connected', vendor: 'HHAeXchange' },
    { category: 'medication', status: 'connected', vendor: 'Medispan' },
    { category: 'sms', status: 'connected', vendor: 'Twilio' },
    { category: 'email', status: 'connected', vendor: 'SendGrid' },
    { category: 'fax', status: 'error', vendor: 'SRFax' },
    { category: 'push-notifications', status: 'connected', vendor: 'Firebase' },
  ] as const;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vendor Integrations</h2>
          <p className="text-sm text-gray-600">Manage external service integrations</p>
        </div>
        <Button onClick={() => navigate('/integration-management')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Integration Center
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {integrationStatus.map((item) => {
          const category = INTEGRATION_CATEGORIES[item.category];
          return (
            <div key={item.category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{category.label}</div>
                  <div className="text-xs text-gray-600">{item.vendor}</div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  item.status === 'connected'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                }
              >
                {item.status === 'connected' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {item.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
