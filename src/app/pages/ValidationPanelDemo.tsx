/**
 * Validation Panel Demo
 * 
 * Comprehensive demonstration of the document validation system
 * Shows various error types, navigation, and correction workflow
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ValidationPanel, ValidationSummaryBadges } from '../components/documentation/ValidationPanel';
import { 
  DocumentValidator, 
  ValidationResult,
  FieldValidationRule,
  commonValidators,
  createValidationRules
} from '../lib/documentValidation';
import { FormValues } from '../lib/documentationTypes';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { cn } from '../lib/utils';

// Mock form sections with validation rules
const DEMO_FORM_SECTIONS = [
  {
    id: 'patient_info',
    title: 'Patient Information',
    fields: [
      {
        id: 'patient_name',
        label: 'Patient Name',
        type: 'text',
        required: true,
        minLength: 2,
        maxLength: 100,
      },
      {
        id: 'dob',
        label: 'Date of Birth',
        type: 'date',
        required: true,
      },
      {
        id: 'medicare_number',
        label: 'Medicare Number',
        type: 'text',
        required: true,
        validationType: 'medicareNumber',
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'text',
        required: false,
        validationType: 'phoneNumber',
      },
      {
        id: 'email',
        label: 'Email',
        type: 'text',
        required: false,
        validationType: 'email',
      },
    ],
  },
  {
    id: 'vital_signs',
    title: 'Vital Signs',
    fields: [
      {
        id: 'heart_rate',
        label: 'Heart Rate (bpm)',
        type: 'number',
        required: true,
        min: 30,
        max: 250,
      },
      {
        id: 'systolic_bp',
        label: 'Systolic Blood Pressure',
        type: 'number',
        required: true,
        min: 70,
        max: 250,
      },
      {
        id: 'diastolic_bp',
        label: 'Diastolic Blood Pressure',
        type: 'number',
        required: true,
        min: 40,
        max: 150,
      },
      {
        id: 'temperature',
        label: 'Temperature (°F)',
        type: 'number',
        required: true,
        min: 95,
        max: 108,
      },
      {
        id: 'oxygen_saturation',
        label: 'Oxygen Saturation (%)',
        type: 'number',
        required: true,
        min: 70,
        max: 100,
      },
      {
        id: 'pain_scale',
        label: 'Pain Scale (0-10)',
        type: 'number',
        required: false,
        min: 0,
        max: 10,
      },
    ],
  },
  {
    id: 'clinical_notes',
    title: 'Clinical Notes',
    fields: [
      {
        id: 'chief_complaint',
        label: 'Chief Complaint',
        type: 'textarea',
        required: true,
        minLength: 10,
        maxLength: 500,
      },
      {
        id: 'assessment',
        label: 'Assessment',
        type: 'textarea',
        required: true,
        minLength: 20,
        maxLength: 2000,
      },
      {
        id: 'plan',
        label: 'Plan of Care',
        type: 'textarea',
        required: true,
        minLength: 20,
        maxLength: 2000,
      },
      {
        id: 'primary_diagnosis_code',
        label: 'Primary Diagnosis (ICD-10)',
        type: 'text',
        required: true,
        validationType: 'icd10Code',
      },
    ],
  },
];

export default function ValidationPanelDemo() {
  const navigate = useNavigate();
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  
  // Form values
  const [values, setValues] = useState<FormValues>({
    // Intentionally leave some fields empty or invalid to show validation
    patient_name: '', // Missing required
    dob: '',
    medicare_number: 'INVALID', // Invalid format
    phone: '555-12', // Invalid format
    email: 'not-an-email', // Invalid format
    heart_rate: 300, // Out of range
    systolic_bp: 120,
    diastolic_bp: 80,
    temperature: 98.6,
    oxygen_saturation: 95,
    pain_scale: 5,
    chief_complaint: 'Short', // Too short
    assessment: '', // Missing required
    plan: '', // Missing required
    primary_diagnosis_code: 'X99', // Invalid format
  });

  // Create validator
  const validator = new DocumentValidator(createValidationRules(DEMO_FORM_SECTIONS));
  
  // Validate on every change
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    validator.validate(values)
  );

  useEffect(() => {
    setValidationResult(validator.validate(values));
  }, [values]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNavigateToField = (fieldId: string, sectionId: string) => {
    // Scroll to field
    const element = fieldRefs.current[fieldId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Focus the field
      const input = element.querySelector('input, textarea, select') as HTMLElement;
      if (input) {
        setTimeout(() => {
          input.focus();
          // Add highlight animation
          element.classList.add('ring-2', 'ring-red-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-red-500', 'ring-offset-2');
          }, 2000);
        }, 500);
      }
    }
  };

  const handleSubmit = () => {
    if (validationResult.canSubmit) {
      alert('Document submitted successfully!');
    } else {
      alert(`Cannot submit: ${validationResult.errorCount} errors must be fixed first.`);
    }
  };

  const handleAutoFix = () => {
    // Auto-populate with valid values
    setValues({
      patient_name: 'Margaret Thompson',
      dob: '1945-06-15',
      medicare_number: '1AB2CD3EF45',
      phone: '555-123-4567',
      email: 'margaret.thompson@email.com',
      heart_rate: 72,
      systolic_bp: 120,
      diastolic_bp: 80,
      temperature: 98.6,
      oxygen_saturation: 97,
      pain_scale: 3,
      chief_complaint: 'Patient reports difficulty with ambulation and shortness of breath during activities.',
      assessment: 'Patient presents with decreased functional mobility and dyspnea on exertion. Vital signs within normal limits. Patient demonstrates good understanding of care plan.',
      plan: 'Continue physical therapy 3x weekly. Monitor vital signs. Provide oxygen as needed. Follow up with physician in 2 weeks for medication review.',
      primary_diagnosis_code: 'I50.9',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Clinical Document Validation System
                </h1>
                <p className="text-sm text-gray-600">
                  Interactive validation panel demonstration
                </p>
              </div>
            </div>
            
            <ValidationSummaryBadges validationResult={validationResult} size="lg" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form (Left Side) */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Visit Note Documentation
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAutoFix}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Auto-Fix All
                </Button>
              </div>

              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Mode</AlertTitle>
                <AlertDescription>
                  This form contains intentional errors to demonstrate the validation system.
                  Click "Auto-Fix All" or correct fields manually.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="patient_info" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="patient_info">Patient Info</TabsTrigger>
                  <TabsTrigger value="vital_signs">Vital Signs</TabsTrigger>
                  <TabsTrigger value="clinical_notes">Clinical Notes</TabsTrigger>
                </TabsList>

                {/* Patient Info Tab */}
                <TabsContent value="patient_info" className="space-y-4">
                  {DEMO_FORM_SECTIONS[0].fields.map(field => (
                    <div 
                      key={field.id} 
                      ref={el => fieldRefs.current[field.id] = el}
                      className="space-y-2 transition-all"
                    >
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.id}
                        type={field.type}
                        value={values[field.id] as string || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={cn(
                          validationResult.errors.some(e => e.fieldId === field.id) && 
                          'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {validationResult.errors.find(e => e.fieldId === field.id) && (
                        <p className="text-sm text-red-600">
                          {validationResult.errors.find(e => e.fieldId === field.id)?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>

                {/* Vital Signs Tab */}
                <TabsContent value="vital_signs" className="space-y-4">
                  {DEMO_FORM_SECTIONS[1].fields.map(field => (
                    <div 
                      key={field.id}
                      ref={el => fieldRefs.current[field.id] = el}
                      className="space-y-2 transition-all"
                    >
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={field.id}
                        type="number"
                        value={values[field.id] as number || ''}
                        onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                        className={cn(
                          validationResult.errors.some(e => e.fieldId === field.id) && 
                          'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {validationResult.errors.find(e => e.fieldId === field.id) && (
                        <p className="text-sm text-red-600">
                          {validationResult.errors.find(e => e.fieldId === field.id)?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>

                {/* Clinical Notes Tab */}
                <TabsContent value="clinical_notes" className="space-y-4">
                  {DEMO_FORM_SECTIONS[2].fields.map(field => (
                    <div 
                      key={field.id}
                      ref={el => fieldRefs.current[field.id] = el}
                      className="space-y-2 transition-all"
                    >
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.id}
                          value={values[field.id] as string || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          rows={4}
                          className={cn(
                            validationResult.errors.some(e => e.fieldId === field.id) && 
                            'border-red-500 focus:ring-red-500'
                          )}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type="text"
                          value={values[field.id] as string || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className={cn(
                            validationResult.errors.some(e => e.fieldId === field.id) && 
                            'border-red-500 focus:ring-red-500'
                          )}
                        />
                      )}
                      {validationResult.errors.find(e => e.fieldId === field.id) && (
                        <p className="text-sm text-red-600">
                          {validationResult.errors.find(e => e.fieldId === field.id)?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Action Buttons */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {validationResult.isValid ? (
                    <span className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Ready to submit
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      {validationResult.errorCount} {validationResult.errorCount === 1 ? 'error' : 'errors'} must be fixed
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!validationResult.canSubmit}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Validation Panel (Right Side) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <ValidationPanel
              validationResult={validationResult}
              onNavigateToField={handleNavigateToField}
              showWarnings={true}
              showInfos={false}
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Validation Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Required field validation</strong> - Ensures all mandatory fields are completed</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Format validation</strong> - Validates Medicare numbers, phone, email, ICD-10 codes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Range validation</strong> - Ensures vital signs are within acceptable ranges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Length validation</strong> - Min/max character limits for text fields</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Real-time validation</strong> - Instant feedback as you type</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span><strong>Direct navigation</strong> - Click "Go to field" to jump to error location</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Error Severity Levels</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">Error</div>
                  <div className="text-sm text-red-700">
                    Critical issues that prevent document submission. Must be fixed.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-medium text-amber-900">Warning</div>
                  <div className="text-sm text-amber-700">
                    Potential issues that should be reviewed but don't block submission.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Info</div>
                  <div className="text-sm text-blue-700">
                    Helpful suggestions and tips to improve documentation quality.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
