/**
 * Integration Documentation Panel
 * 
 * Contextual documentation including vendor docs, configuration guides,
 * and troubleshooting help embedded within the configuration interface.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Book,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { VENDORS } from '../../lib/integrationTypes';
import type { VendorId } from '../../lib/integrationTypes';

interface IntegrationDocumentationPanelProps {
  vendorId: VendorId;
}

export default function IntegrationDocumentationPanel({
  vendorId,
}: IntegrationDocumentationPanelProps) {
  const vendor = VENDORS[vendorId];

  const sections = [
    {
      id: 'quick-start',
      title: 'Quick Start Guide',
      icon: Lightbulb,
      items: [
        '1. Obtain API credentials from ' + vendor.name + ' portal',
        '2. Enter credentials in the configuration panel',
        '3. Configure webhook URL for callbacks',
        '4. Run connection test to verify setup',
        '5. Switch to production mode when ready',
      ],
    },
    {
      id: 'configuration',
      title: 'Configuration Requirements',
      icon: FileText,
      items: vendor.supportedFeatures.map((f) => `Configure ${f} settings`),
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues',
      icon: AlertCircle,
      items: [
        'Authentication failed: Verify API key is not expired',
        'Connection timeout: Check firewall and network settings',
        'Invalid response: Ensure API endpoint URL is correct',
        'Rate limit exceeded: Implement exponential backoff',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Vendor Documentation Links */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Book className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Official Documentation</h3>
        </div>

        <div className="space-y-2">
          <a
            href={vendor.documentation}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-blue-900">
                {vendor.name} API Documentation
              </div>
              <div className="text-xs text-blue-700">Complete API reference and guides</div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </a>

          <a
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">{vendor.name} Website</div>
              <div className="text-xs text-gray-600">Product information and support</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
      </Card>

      {/* Integration Guides */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
            </div>

            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {/* Support Info */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-700 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Need Help?</h4>
            <p className="text-sm text-purple-700 mb-3">
              Our support team can assist with integration setup and troubleshooting.
            </p>
            <Button size="sm" variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
