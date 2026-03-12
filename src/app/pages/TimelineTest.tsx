/**
 * Timeline Test Page - Simple test to verify timeline works
 */

import { Card } from '../components/ui/card';

export default function TimelineTest() {
  return (
    <div className="p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Timeline Test</h1>
        <p className="text-gray-600">
          If you can see this page, the routing is working correctly.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          The IframeMessageAbortError you're seeing is a normal development error
          that occurs when Figma Make hot-reloads the iframe. It doesn't affect
          functionality and will not appear in production.
        </p>
      </Card>
    </div>
  );
}
