/**
 * UX Patterns Demonstration
 * 
 * Interactive showcase of all UX patterns:
 * 1. Save & Autosave Behavior
 * 2. Unsaved Changes Protection
 * 3. Create/Edit/View Modes
 * 4. Status Transitions
 * 5. Confirmation Dialogs
 * 6. Toast Notifications
 */

import { useState } from 'react';
import { useFormAutosave } from '../hooks/useFormAutosave';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import {
  FormModeWrapper,
  useFormMode,
  AutosaveIndicator,
  UnsavedChangesDialog,
  StatusTransition,
  StatusTransitionRule,
  ConfirmDialog,
  useConfirmDialog,
  StatusBadge,
} from '../components/patterns';
import { toast } from '../lib/toastNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  FileText, 
  Calendar, 
  Send, 
  CheckCircle, 
  Trash2,
  Info,
  AlertCircle,
} from 'lucide-react';

export default function UXPatternsDemo() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UX Patterns Demonstration
          </h1>
          <p className="text-gray-600">
            Interactive showcase of all UX interaction patterns used throughout the healthcare platform.
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="autosave" className="space-y-6">
          <TabsList className="bg-white p-1">
            <TabsTrigger value="autosave">Autosave</TabsTrigger>
            <TabsTrigger value="navigation-guard">Navigation Guard</TabsTrigger>
            <TabsTrigger value="form-modes">Form Modes</TabsTrigger>
            <TabsTrigger value="status-transitions">Status Transitions</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            <TabsTrigger value="toasts">Toasts</TabsTrigger>
          </TabsList>

          {/* 1. Autosave Demo */}
          <TabsContent value="autosave">
            <AutosaveDemo />
          </TabsContent>

          {/* 2. Navigation Guard Demo */}
          <TabsContent value="navigation-guard">
            <NavigationGuardDemo />
          </TabsContent>

          {/* 3. Form Modes Demo */}
          <TabsContent value="form-modes">
            <FormModesDemo />
          </TabsContent>

          {/* 4. Status Transitions Demo */}
          <TabsContent value="status-transitions">
            <StatusTransitionsDemo />
          </TabsContent>

          {/* 5. Confirmations Demo */}
          <TabsContent value="confirmations">
            <ConfirmationsDemo />
          </TabsContent>

          {/* 6. Toasts Demo */}
          <TabsContent value="toasts">
            <ToastsDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. AUTOSAVE DEMO
// ═══════════════════════════════════════════════════════════════════════════

function AutosaveDemo() {
  const [documentData, setDocumentData] = useState({
    title: 'Clinical Note',
    content: 'Start typing to see autosave in action...',
  });

  const autosave = useFormAutosave({
    formData: documentData,
    onSave: async (data, isDraft) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Auto-saved:', { data, isDraft });
    },
    autosaveInterval: 5000, // 5 seconds for demo
  });

  return (
    <div className="grid gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Autosave Pattern</AlertTitle>
        <AlertDescription>
          Start editing the form below. Changes will auto-save every 5 seconds.
          Watch the autosave indicator update.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Clinical Documentation Editor</CardTitle>
              <CardDescription>Auto-saves drafts every 5 seconds</CardDescription>
            </div>
            <AutosaveIndicator
              status={autosave.isSaving ? 'saving' : autosave.isDirty ? 'idle' : 'saved'}
              lastSaved={autosave.lastSaved}
              size="sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={documentData.title}
              onChange={(e) => setDocumentData({ ...documentData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={documentData.content}
              onChange={(e) => setDocumentData({ ...documentData, content: e.target.value })}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <AutosaveIndicator
              status={autosave.isSaving ? 'saving' : autosave.isDirty ? 'idle' : 'saved'}
              lastSaved={autosave.lastSaved}
              showTimestamp
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => autosave.saveNow(true)}
                disabled={autosave.isSaving}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => autosave.saveNow(false)}
                disabled={autosave.isSaving || !autosave.isDirty}
              >
                Submit
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Status:</strong>{' '}
            {autosave.isSaving ? 'Saving...' : autosave.isDirty ? 'Unsaved changes' : 'All changes saved'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. NAVIGATION GUARD DEMO
// ═══════════════════════════════════════════════════════════════════════════

function NavigationGuardDemo() {
  const [formData, setFormData] = useState({ name: '', notes: '' });
  const [isDirty, setIsDirty] = useState(false);
  const [simulatedNavigation, setSimulatedNavigation] = useState(false);

  const navigationGuard = useNavigationGuard({
    when: isDirty && simulatedNavigation,
    onSave: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDirty(false);
      toast.success('Changes saved before navigation');
    },
    onDiscard: () => {
      setIsDirty(false);
      toast.info('Changes discarded');
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setIsDirty(true);
  };

  const simulateNavigation = () => {
    if (isDirty) {
      setSimulatedNavigation(true);
    } else {
      toast.info('No unsaved changes - navigation allowed');
    }
  };

  return (
    <div className="grid gap-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Navigation Guard Pattern</AlertTitle>
        <AlertDescription>
          Make changes to the form, then click "Navigate Away" to see the protection dialog.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Protected form with unsaved changes detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Patient Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label>Clinical Notes</Label>
            <Textarea
              rows={6}
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {isDirty ? (
                <span className="text-amber-600 font-medium">⚠️ Unsaved changes</span>
              ) : (
                <span className="text-green-600 font-medium">✓ No unsaved changes</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={simulateNavigation}>
                Navigate Away
              </Button>
              <Button
                onClick={() => {
                  setIsDirty(false);
                  toast.success('Changes saved');
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={() => {
          navigationGuard.saveAndProceed();
          setSimulatedNavigation(false);
        }}
        onDiscard={() => {
          navigationGuard.discardAndProceed();
          setSimulatedNavigation(false);
        }}
        onCancel={() => {
          navigationGuard.cancelNavigation();
          setSimulatedNavigation(false);
        }}
        loading={navigationGuard.isSaving}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. FORM MODES DEMO
// ═══════════════════════════════════════════════════════════════════════════

function FormModesDemo() {
  const [patientData, setPatientData] = useState({
    name: 'John Doe',
    mrn: 'MRN-12345',
    diagnosis: 'Type 2 Diabetes',
  });

  const formMode = useFormMode({
    initialMode: 'view',
    onSave: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Patient information saved');
    },
  });

  return (
    <div className="grid gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Form Modes Pattern</AlertTitle>
        <AlertDescription>
          Switch between View, Edit, and Create modes. Notice how the UI and actions change.
        </AlertDescription>
      </Alert>

      <FormModeWrapper
        mode={formMode.mode}
        header={{
          title: formMode.isCreating ? 'New Patient' : patientData.name,
          subtitle: formMode.isCreating ? 'Fill in patient details' : `MRN: ${patientData.mrn}`,
        }}
        actions={{
          onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
          onSecondaryAction: formMode.cancel,
          loading: formMode.loading,
        }}
      >
        <div className="space-y-4">
          <div>
            <Label>Patient Name</Label>
            <Input
              value={patientData.name}
              onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              disabled={formMode.isReadOnly}
            />
          </div>

          <div>
            <Label>MRN</Label>
            <Input
              value={patientData.mrn}
              onChange={(e) => setPatientData({ ...patientData, mrn: e.target.value })}
              disabled={formMode.isReadOnly}
            />
          </div>

          <div>
            <Label>Primary Diagnosis</Label>
            <Input
              value={patientData.diagnosis}
              onChange={(e) => setPatientData({ ...patientData, diagnosis: e.target.value })}
              disabled={formMode.isReadOnly}
            />
          </div>
        </div>
      </FormModeWrapper>

      <Card>
        <CardHeader>
          <CardTitle>Mode Controls (Demo Only)</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant={formMode.mode === 'view' ? 'default' : 'outline'}
            onClick={() => formMode.setMode('view')}
          >
            View Mode
          </Button>
          <Button
            variant={formMode.mode === 'edit' ? 'default' : 'outline'}
            onClick={() => formMode.setMode('edit')}
          >
            Edit Mode
          </Button>
          <Button
            variant={formMode.mode === 'create' ? 'default' : 'outline'}
            onClick={() => formMode.setMode('create')}
          >
            Create Mode
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. STATUS TRANSITIONS DEMO
// ═══════════════════════════════════════════════════════════════════════════

function StatusTransitionsDemo() {
  const [currentStatus, setCurrentStatus] = useState<any>('draft');
  const [statusHistory, setStatusHistory] = useState([
    {
      status: 'draft' as any,
      timestamp: new Date(Date.now() - 86400000),
      user: 'Dr. Smith',
      notes: 'Initial draft created',
    },
  ]);

  const visitTransitions: StatusTransitionRule[] = [
    {
      from: 'draft',
      to: 'scheduled',
      label: 'Schedule Visit',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      from: 'scheduled',
      to: 'in-progress',
      label: 'Start Visit',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      from: 'in-progress',
      to: 'completed',
      label: 'Complete Visit',
      icon: <CheckCircle className="w-4 h-4" />,
      requiresConfirmation: true,
      confirmationMessage: 'Mark this visit as completed? Documentation must be finalized.',
    },
    {
      from: 'completed',
      to: 'submitted',
      label: 'Submit for Review',
      icon: <Send className="w-4 h-4" />,
      requiresConfirmation: true,
      confirmationMessage: 'Submit visit for QA review? You will not be able to edit after submission.',
    },
  ];

  const handleStatusChange = async (newStatus: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStatus(newStatus);
    setStatusHistory([
      ...statusHistory,
      {
        status: newStatus,
        timestamp: new Date(),
        user: 'Current User',
      },
    ]);
    toast.success(`Status changed to ${newStatus}`);
  };

  return (
    <div className="grid gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Status Transitions Pattern</AlertTitle>
        <AlertDescription>
          Watch how status transitions work with validation, confirmation, and history tracking.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Visit Status Management</CardTitle>
          <CardDescription>Clinical visit workflow with status transitions</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusTransition
            currentStatus={currentStatus}
            transitions={visitTransitions}
            onStatusChange={handleStatusChange}
            history={statusHistory}
            showHistory
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStatus('draft');
              setStatusHistory([
                {
                  status: 'draft',
                  timestamp: new Date(),
                  user: 'Current User',
                  notes: 'Reset to draft',
                },
              ]);
            }}
          >
            Reset to Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CONFIRMATIONS DEMO
// ═══════════════════════════════════════════════════════════════════════════

function ConfirmationsDemo() {
  const deleteDialog = useConfirmDialog({
    onConfirm: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Record deleted successfully');
    },
    variant: 'destructive',
  });

  const submitDialog = useConfirmDialog({
    onConfirm: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Document submitted for review');
    },
    variant: 'warning',
  });

  const signDialog = useConfirmDialog({
    onConfirm: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Document signed electronically');
    },
    variant: 'info',
  });

  return (
    <div className="grid gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Confirmation Dialogs Pattern</AlertTitle>
        <AlertDescription>
          Click the buttons below to see different confirmation dialog variants.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation Dialog Variants</CardTitle>
          <CardDescription>Different styles for different action types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Destructive Actions (Red)</h3>
            <Button variant="destructive" onClick={deleteDialog.show}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Patient Record
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Warning Actions (Amber)</h3>
            <Button variant="outline" onClick={submitDialog.show}>
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Info Actions (Blue)</h3>
            <Button onClick={signDialog.show}>
              <FileText className="w-4 h-4 mr-2" />
              Sign Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.setOpen}
        onConfirm={deleteDialog.confirm}
        loading={deleteDialog.loading}
        title="Delete Patient Record?"
        description="This action cannot be undone. All patient data, episodes, and documents will be permanently deleted."
        confirmText="Delete Patient"
        variant="destructive"
      />

      {/* Submit Dialog */}
      <ConfirmDialog
        open={submitDialog.open}
        onOpenChange={submitDialog.setOpen}
        onConfirm={submitDialog.confirm}
        loading={submitDialog.loading}
        title="Submit Documentation?"
        description="Once submitted, this document will be locked and sent to QA for review. You will not be able to make changes."
        confirmText="Submit"
        variant="warning"
      />

      {/* Sign Dialog */}
      <ConfirmDialog
        open={signDialog.open}
        onOpenChange={signDialog.setOpen}
        onConfirm={signDialog.confirm}
        loading={signDialog.loading}
        title="Sign Document Electronically?"
        description="This document will be electronically signed and locked. This action is final and legally binding."
        confirmText="Sign Document"
        variant="info"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. TOASTS DEMO
// ═══════════════════════════════════════════════════════════════════════════

function ToastsDemo() {
  const showSuccessToast = () => {
    toast.success('Document saved successfully');
  };

  const showErrorToast = () => {
    toast.error('Failed to load patient data');
  };

  const showWarningToast = () => {
    toast.warning('Session will expire in 5 minutes');
  };

  const showInfoToast = () => {
    toast.info('New message received');
  };

  const showLoadingToast = () => {
    const id = toast.loading('Processing request...');
    setTimeout(() => {
      toast.dismiss(id);
      toast.success('Request completed');
    }, 3000);
  };

  const showUndoToast = () => {
    toast.successWithUndo('Visit note deleted', () => {
      toast.info('Deletion undone');
    });
  };

  const showAsyncToast = async () => {
    await toast.asyncOperation(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Saving assessment...',
        success: 'Assessment saved successfully',
        error: 'Failed to save assessment',
      }
    );
  };

  const showActionToast = () => {
    toast.error('Integration test failed', {
      action: {
        label: 'Retry',
        onClick: () => toast.info('Retrying integration test...'),
      },
    });
  };

  return (
    <div className="grid gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Toast Notifications Pattern</AlertTitle>
        <AlertDescription>
          Click buttons below to see different toast notification types.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Toast Notification Types</CardTitle>
          <CardDescription>Brief, auto-dismissing feedback messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={showSuccessToast} variant="outline">
              Success Toast
            </Button>
            <Button onClick={showErrorToast} variant="outline">
              Error Toast
            </Button>
            <Button onClick={showWarningToast} variant="outline">
              Warning Toast
            </Button>
            <Button onClick={showInfoToast} variant="outline">
              Info Toast
            </Button>
            <Button onClick={showLoadingToast} variant="outline">
              Loading Toast
            </Button>
            <Button onClick={showUndoToast} variant="outline">
              Toast with Undo
            </Button>
            <Button onClick={showAsyncToast} variant="outline">
              Async Operation
            </Button>
            <Button onClick={showActionToast} variant="outline">
              Toast with Action
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Healthcare-Specific Toasts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => toast.visitScheduled('John Doe')}
            variant="outline"
            className="w-full justify-start"
          >
            Visit Scheduled
          </Button>
          <Button
            onClick={() => toast.documentSubmitted()}
            variant="outline"
            className="w-full justify-start"
          >
            Document Submitted
          </Button>
          <Button
            onClick={() => toast.assessmentApproved()}
            variant="outline"
            className="w-full justify-start"
          >
            Assessment Approved
          </Button>
          <Button
            onClick={() => toast.patientAdmitted('Jane Smith')}
            variant="outline"
            className="w-full justify-start"
          >
            Patient Admitted
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
