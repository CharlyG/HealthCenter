/**
 * Admission Compliance Tab
 * Track regulatory compliance requirements and documentation
 */
import { CheckCircle, XCircle, AlertTriangle, FileCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';

interface AdmissionComplianceTabProps {
  admissionId?: string;
}

interface ComplianceItem {
  id: string;
  category: string;
  item: string;
  status: 'complete' | 'pending' | 'missing' | 'not_required';
  due_date?: string;
  completed_date?: string;
  completed_by?: string;
}

export default function AdmissionComplianceTab({ admissionId }: AdmissionComplianceTabProps) {
  // Mock compliance data
  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      category: 'Start of Care',
      item: 'OASIS-E Assessment',
      status: 'complete',
      due_date: '2024-03-10',
      completed_date: '2024-03-09',
      completed_by: 'Jane Smith, RN',
    },
    {
      id: '2',
      category: 'Start of Care',
      item: 'Physician Orders',
      status: 'complete',
      due_date: '2024-03-10',
      completed_date: '2024-03-08',
      completed_by: 'Dr. Johnson',
    },
    {
      id: '3',
      category: 'Start of Care',
      item: 'Plan of Care',
      status: 'pending',
      due_date: '2024-03-10',
    },
    {
      id: '4',
      category: 'Documentation',
      item: 'Face Sheet',
      status: 'complete',
      completed_date: '2024-03-08',
      completed_by: 'Admin User',
    },
    {
      id: '5',
      category: 'Documentation',
      item: 'Advanced Directives',
      status: 'missing',
      due_date: '2024-03-10',
    },
    {
      id: '6',
      category: 'Authorization',
      item: 'Insurance Verification',
      status: 'complete',
      completed_date: '2024-03-08',
      completed_by: 'Billing Coordinator',
    },
    {
      id: '7',
      category: 'Authorization',
      item: 'Prior Authorization',
      status: 'pending',
      due_date: '2024-03-12',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="size-5 text-green-600" />;
      case 'pending':
        return <Clock className="size-5 text-yellow-600" />;
      case 'missing':
        return <XCircle className="size-5 text-red-600" />;
      case 'not_required':
        return <AlertTriangle className="size-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'missing':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'not_required':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedItems = complianceItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComplianceItem[]>);

  const totalItems = complianceItems.length;
  const completedItems = complianceItems.filter(i => i.status === 'complete').length;
  const completionPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Completion</span>
                <span className="font-semibold text-gray-900">
                  {completedItems} of {totalItems} complete
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="size-6 mx-auto mb-1 text-green-600" />
                <p className="text-2xl font-bold text-green-900">{completedItems}</p>
                <p className="text-xs text-green-700">Complete</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="size-6 mx-auto mb-1 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-900">
                  {complianceItems.filter(i => i.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-700">Pending</p>
              </div>
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="size-6 mx-auto mb-1 text-red-600" />
                <p className="text-2xl font-bold text-red-900">
                  {complianceItems.filter(i => i.status === 'missing').length}
                </p>
                <p className="text-xs text-red-700">Missing</p>
              </div>
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FileCheck className="size-6 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                <p className="text-xs text-blue-700">Total Items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items by Category */}
      {Object.entries(groupedItems).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{item.item}</p>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {item.status === 'complete' && item.completed_date && (
                        <p className="text-sm text-gray-600">
                          Completed {item.completed_date} by {item.completed_by}
                        </p>
                      )}
                      
                      {item.status === 'pending' && item.due_date && (
                        <p className="text-sm text-gray-600">
                          Due by {item.due_date}
                        </p>
                      )}
                      
                      {item.status === 'missing' && item.due_date && (
                        <p className="text-sm text-red-600">
                          <AlertTriangle className="inline size-3 mr-1" />
                          Overdue since {item.due_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.status !== 'complete' && (
                    <Button variant="outline" size="sm">
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
