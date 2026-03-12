# Integration Examples for New Features

Quick copy-paste examples for integrating the 5 new features into existing components.

---

## 1. Adding Notification Center to Header

### Basic Integration
```typescript
// In your main layout or header component
import { NotificationCenter } from './components/notifications/NotificationCenter';

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Home Health Platform</h1>
      
      <div className="flex items-center gap-4">
        {/* Other header items */}
        <NotificationCenter />
      </div>
    </header>
  );
};
```

### Sending Notifications from Components
```typescript
import { NotificationService } from './services/NotificationService';

// Example: Schedule change notification
const handleScheduleChange = (visit) => {
  NotificationService.send({
    type: 'schedule_change',
    priority: 'medium',
    title: 'Visit Rescheduled',
    message: `Your visit with ${visit.patientName} has been moved to ${visit.newTime}`,
    actionUrl: `/visits/${visit.id}`,
    actionLabel: 'View Visit'
  });
};

// Example: Critical patient alert
const handleVitalSignsAlert = (patient, vitals) => {
  NotificationService.send({
    type: 'patient_alert',
    priority: 'critical',
    title: 'Critical Vital Signs',
    message: `${patient.name} - BP: ${vitals.bp}, HR: ${vitals.hr}`,
    actionUrl: `/patients/${patient.id}`,
    actionLabel: 'View Patient'
  });
};

// Example: Documentation reminder
const sendDocumentationReminder = (clinician, pendingCount) => {
  NotificationService.send({
    type: 'documentation_reminder',
    priority: 'high',
    title: 'Pending Documentation',
    message: `You have ${pendingCount} visit notes pending signature`,
    actionUrl: '/documentation/pending',
    actionLabel: 'Complete Now'
  });
};
```

---

## 2. Adding Advanced Search to Documentation Workspace

### Basic Integration
```typescript
import { AdvancedSearch, SearchResult, SearchFilters } from './components/search/AdvancedSearch';

export const DocumentationWorkspace = () => {
  const handleSearch = async (filters: SearchFilters): Promise<SearchResult[]> => {
    // Call your backend API
    const response = await fetch('/api/documents/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    return response.json();
  };

  const handleSelectResult = (result: SearchResult) => {
    // Navigate to document
    window.location.href = `/documents/${result.id}`;
    // Or use React Router:
    // navigate(`/documents/${result.id}`);
  };

  return (
    <div className="workspace">
      <h1>Clinical Documentation</h1>
      
      <AdvancedSearch
        onSearch={handleSearch}
        onSelectResult={handleSelectResult}
      />
      
      {/* Rest of workspace */}
    </div>
  );
};
```

### Backend API Example (Express/Node)
```typescript
// Server-side search implementation example
app.post('/api/documents/search', async (req, res) => {
  const { query, documentTypes, dateRange, icd10Codes, medications } = req.body;
  
  const documents = await db.documents
    .where('content', 'like', `%${query}%`)
    .whereIn('type', documentTypes.length ? documentTypes : ['visit_note', 'assessment', 'care_plan'])
    .whereBetween('date', [dateRange.start, dateRange.end])
    .get();

  const results = documents.map(doc => ({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    patientName: doc.patient.name,
    patientMRN: doc.patient.mrn,
    clinicianName: doc.clinician.name,
    date: doc.createdAt,
    snippet: extractSnippet(doc.content, query),
    matchedTerms: findMatches(doc.content, query),
    score: calculateRelevance(doc, query)
  }));

  res.json(results);
});
```

---

## 3. Adding Voice-to-Text to Documentation Forms

### Replace Standard Textarea
```typescript
import { VoiceToTextEditor } from './components/documentation/VoiceToTextEditor';

export const VisitNoteForm = () => {
  const [visitNote, setVisitNote] = useState('');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  const handleSave = async () => {
    await saveVisitNote({
      visitNote,
      subjective,
      objective,
      assessment,
      plan
    });
  };

  return (
    <form>
      {/* Traditional fields */}
      <div>
        <label>Patient Name</label>
        <input type="text" />
      </div>

      {/* BEFORE: Standard textarea
      <div>
        <label>Subjective</label>
        <textarea
          value={subjective}
          onChange={e => setSubjective(e.target.value)}
          rows={4}
        />
      </div>
      */}

      {/* AFTER: Voice-enabled editor */}
      <div>
        <label>Subjective (Voice-enabled)</label>
        <VoiceToTextEditor
          value={subjective}
          onChange={setSubjective}
          placeholder="Click 'Start Dictation' or type manually..."
          medicalTermsEnabled={true}
        />
      </div>

      <div>
        <label>Objective (Voice-enabled)</label>
        <VoiceToTextEditor
          value={objective}
          onChange={setObjective}
          placeholder="Vital signs, observations..."
          medicalTermsEnabled={true}
        />
      </div>

      <div>
        <label>Assessment (Voice-enabled)</label>
        <VoiceToTextEditor
          value={assessment}
          onChange={setAssessment}
          placeholder="Clinical assessment..."
          medicalTermsEnabled={true}
        />
      </div>

      <div>
        <label>Plan (Voice-enabled)</label>
        <VoiceToTextEditor
          value={plan}
          onChange={setPlan}
          onSave={handleSave}
          placeholder="Plan of care..."
          medicalTermsEnabled={true}
        />
      </div>
    </form>
  );
};
```

### Pro Tip: Disable Voice for Non-Clinical Fields
```typescript
// For fields that don't need medical terminology
<VoiceToTextEditor
  value={administrativeNotes}
  onChange={setAdministrativeNotes}
  medicalTermsEnabled={false} // Disable medical term corrections
/>
```

---

## 4. Adding Predictive Scheduling to Scheduler

### Visit Duration Prediction
```typescript
import { PredictiveSchedulingService, Visit } from './services/PredictiveSchedulingService';

export const ScheduleVisitForm = ({ patient, visitType }) => {
  const [scheduledDuration, setScheduledDuration] = useState(60);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    // Auto-predict duration when form loads
    const visit: Visit = {
      id: 'temp',
      patientId: patient.id,
      patientAcuity: patient.acuity,
      visitType: visitType,
      disciplines: [visitType],
      scheduledDuration: 60,
      isFirstVisit: patient.visitCount === 0,
      requiresSupervision: patient.requiresSupervision,
      complexityFactors: patient.complexityFactors || [],
      // ... other required fields
    };

    const result = PredictiveSchedulingService.predictVisitDuration(visit);
    setPrediction(result);
    setScheduledDuration(result.predictedDuration);
  }, [patient, visitType]);

  return (
    <div>
      <label>Scheduled Duration</label>
      <input
        type="number"
        value={scheduledDuration}
        onChange={e => setScheduledDuration(parseInt(e.target.value))}
      />
      
      {prediction && (
        <div className={`mt-2 p-3 rounded ${
          prediction.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
          prediction.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-green-50 border-green-200'
        } border`}>
          <div className="font-semibold">AI Prediction</div>
          <div className="text-sm">
            Predicted: {prediction.predictedDuration} minutes
            (Confidence: {Math.round(prediction.confidence * 100)}%)
          </div>
          {prediction.riskLevel === 'high' && (
            <div className="text-sm text-red-700 mt-1">
              ⚠️ High complexity - may take longer than scheduled
            </div>
          )}
          <details className="mt-2">
            <summary className="text-xs cursor-pointer">View details</summary>
            <div className="text-xs mt-2 space-y-1">
              {prediction.factors.map((f, i) => (
                <div key={i}>• {f.factor}: {f.impact > 0 ? '+' : ''}{f.impact} min</div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
```

### Identify Late Visit Patterns (Scheduler Dashboard)
```typescript
export const SchedulerDashboard = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Run analysis on mount
    const analyzeSchedule = async () => {
      const visits = await fetchAllVisits();
      const caregivers = await fetchAllCaregivers();
      
      const suggestions = PredictiveSchedulingService.identifyLateVisitPatterns(
        visits,
        caregivers
      );
      
      setSuggestions(suggestions);
    };
    
    analyzeSchedule();
  }, []);

  return (
    <div>
      <h2>Scheduling Insights</h2>
      
      {suggestions.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900">
            {suggestions.length} Rescheduling Suggestions
          </h3>
          {suggestions.map(suggestion => (
            <div key={suggestion.visitId} className="mt-3 p-3 bg-white rounded border">
              <div className="font-medium">Visit #{suggestion.visitId}</div>
              <div className="text-sm text-gray-600 mt-1">
                {suggestion.reason}
              </div>
              <div className="text-sm mt-2">
                <strong>Suggested:</strong> {suggestion.suggestedSchedule.time} with{' '}
                {caregivers.find(c => c.id === suggestion.suggestedSchedule.caregiverId)?.name}
              </div>
              <div className="text-sm text-green-700">
                {suggestion.expectedImprovement}
              </div>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => applyRescheduling(suggestion)}
              >
                Apply Suggestion
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Staffing Forecast (Weekly View)
```typescript
export const StaffingForecast = () => {
  const [forecasts, setForecasts] = useState([]);

  useEffect(() => {
    const generateForecast = async () => {
      const historical = await fetchHistoricalVisits(90); // Last 90 days
      const currentStaff = await fetchCaregivers();
      
      const forecasts = PredictiveSchedulingService.forecastStaffingNeeds(
        new Date(),
        14, // Next 2 weeks
        historical,
        currentStaff
      );
      
      setForecasts(forecasts);
    };
    
    generateForecast();
  }, []);

  return (
    <div>
      <h2>2-Week Staffing Forecast</h2>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Predicted Visits</th>
            <th>Staffing Status</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast => (
            <tr key={forecast.date.toISOString()}>
              <td>{forecast.date.toLocaleDateString()}</td>
              <td>{forecast.predictedVisitCount}</td>
              <td>
                {forecast.requiredStaff.map(staff => (
                  <div key={staff.discipline}>
                    {staff.discipline}: {staff.count} needed, {staff.currentAvailable} available
                    {staff.shortage > 0 && (
                      <span className="text-red-600 font-semibold">
                        {' '}(⚠️ Short {staff.shortage})
                      </span>
                    )}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 5. Adding Photo Capture to Wound Care

### Basic Wound Photo Integration
```typescript
import { PhotoVideoCapture, CapturedMedia } from './components/clinical/PhotoVideoCapture';

export const WoundAssessmentForm = ({ patient, visit }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [woundPhotos, setWoundPhotos] = useState([]);
  const [woundMeasurements, setWoundMeasurements] = useState({
    length: '',
    width: '',
    depth: ''
  });

  const handlePhotoCapture = async (media: CapturedMedia) => {
    // Upload to server
    const formData = new FormData();
    formData.append('photo', media.blob);
    formData.append('patientId', patient.id);
    formData.append('visitId', visit.id);
    formData.append('location', media.metadata.location);
    formData.append('notes', media.metadata.notes || '');
    
    const response = await fetch('/api/wound-photos', {
      method: 'POST',
      body: formData
    });
    
    const savedPhoto = await response.json();
    setWoundPhotos([...woundPhotos, savedPhoto]);
    setShowCamera(false);
  };

  return (
    <div>
      <h3>Wound Assessment</h3>
      
      {/* Wound measurements */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label>Length (cm)</label>
          <input
            type="number"
            value={woundMeasurements.length}
            onChange={e => setWoundMeasurements({...woundMeasurements, length: e.target.value})}
          />
        </div>
        <div>
          <label>Width (cm)</label>
          <input
            type="number"
            value={woundMeasurements.width}
            onChange={e => setWoundMeasurements({...woundMeasurements, width: e.target.value})}
          />
        </div>
        <div>
          <label>Depth (cm)</label>
          <input
            type="number"
            value={woundMeasurements.depth}
            onChange={e => setWoundMeasurements({...woundMeasurements, depth: e.target.value})}
          />
        </div>
      </div>

      {/* Photo capture button */}
      <div className="mt-4">
        <button
          onClick={() => setShowCamera(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          📷 Capture Wound Photo
        </button>
      </div>

      {/* Display captured photos */}
      {woundPhotos.length > 0 && (
        <div className="mt-4">
          <h4>Captured Photos ({woundPhotos.length})</h4>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {woundPhotos.map(photo => (
              <div key={photo.id} className="border rounded p-2">
                <img src={photo.url} alt="Wound" className="w-full rounded" />
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(photo.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera modal */}
      {showCamera && (
        <PhotoVideoCapture
          patientId={patient.id}
          visitId={visit.id}
          userId="current_user_id" // Replace with actual user ID
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          existingPhotos={woundPhotos}
          mode="photo"
        />
      )}
    </div>
  );
};
```

### Advanced: Before/After Comparison View
```typescript
export const WoundProgressTracking = ({ patientId }) => {
  const [woundHistory, setWoundHistory] = useState([]);
  const [selectedBaseline, setSelectedBaseline] = useState(null);
  const [selectedCurrent, setSelectedCurrent] = useState(null);

  useEffect(() => {
    // Fetch all wound photos for patient
    const loadHistory = async () => {
      const response = await fetch(`/api/patients/${patientId}/wound-photos`);
      const photos = await response.json();
      setWoundHistory(photos);
      
      // Auto-select oldest and newest for comparison
      if (photos.length >= 2) {
        setSelectedBaseline(photos[0]);
        setSelectedCurrent(photos[photos.length - 1]);
      }
    };
    
    loadHistory();
  }, [patientId]);

  return (
    <div>
      <h3>Wound Healing Progress</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Baseline photo */}
        <div>
          <h4>Baseline</h4>
          <select
            value={selectedBaseline?.id}
            onChange={e => setSelectedBaseline(woundHistory.find(p => p.id === e.target.value))}
          >
            {woundHistory.map(photo => (
              <option key={photo.id} value={photo.id}>
                {new Date(photo.timestamp).toLocaleDateString()}
              </option>
            ))}
          </select>
          {selectedBaseline && (
            <div className="mt-2">
              <img src={selectedBaseline.url} alt="Baseline" className="w-full rounded" />
              <div className="mt-2 text-sm">
                <div>Size: {selectedBaseline.measurements.length} x {selectedBaseline.measurements.width} cm</div>
                <div>Date: {new Date(selectedBaseline.timestamp).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Current photo */}
        <div>
          <h4>Current</h4>
          <select
            value={selectedCurrent?.id}
            onChange={e => setSelectedCurrent(woundHistory.find(p => p.id === e.target.value))}
          >
            {woundHistory.map(photo => (
              <option key={photo.id} value={photo.id}>
                {new Date(photo.timestamp).toLocaleDateString()}
              </option>
            ))}
          </select>
          {selectedCurrent && (
            <div className="mt-2">
              <img src={selectedCurrent.url} alt="Current" className="w-full rounded" />
              <div className="mt-2 text-sm">
                <div>Size: {selectedCurrent.measurements.length} x {selectedCurrent.measurements.width} cm</div>
                <div>Date: {new Date(selectedCurrent.timestamp).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Healing progress indicator */}
      {selectedBaseline && selectedCurrent && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold">Healing Progress</h4>
          <div className="mt-2">
            {calculateHealingProgress(selectedBaseline, selectedCurrent)}
          </div>
        </div>
      )}
    </div>
  );
};

function calculateHealingProgress(baseline, current) {
  const baselineArea = baseline.measurements.length * baseline.measurements.width;
  const currentArea = current.measurements.length * current.measurements.width;
  const reduction = ((baselineArea - currentArea) / baselineArea) * 100;
  
  return (
    <div>
      <div>Area reduction: {reduction.toFixed(1)}%</div>
      <div className={reduction > 0 ? 'text-green-700' : 'text-red-700'}>
        {reduction > 0 ? '✓ Healing progressing' : '⚠️ Wound not improving'}
      </div>
    </div>
  );
}
```

---

## Complete Example: Enhanced Visit Execution Screen

Putting it all together - a visit execution screen that uses all 5 new features:

```typescript
import { useState, useEffect } from 'react';
import { NotificationService } from './services/NotificationService';
import { VoiceToTextEditor } from './components/documentation/VoiceToTextEditor';
import { PhotoVideoCapture } from './components/clinical/PhotoVideoCapture';
import { PredictiveSchedulingService } from './services/PredictiveSchedulingService';

export const EnhancedVisitExecution = ({ visit, patient }) => {
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState([]);

  // Feature 4: Predictive scheduling - check if visit is running over
  useEffect(() => {
    const prediction = PredictiveSchedulingService.predictVisitDuration(visit);
    
    // Set timer to alert if visit exceeds predicted duration
    const timer = setTimeout(() => {
      // Feature 1: Send notification if over time
      NotificationService.send({
        type: 'schedule_change',
        priority: 'high',
        title: 'Visit Duration Alert',
        message: `This visit is approaching ${prediction.predictedDuration} minutes`,
        actionUrl: `/visits/${visit.id}`,
        actionLabel: 'View Visit'
      });
    }, prediction.predictedDuration * 60 * 1000);

    return () => clearTimeout(timer);
  }, [visit]);

  const handleSaveDocumentation = async () => {
    const documentation = {
      visitId: visit.id,
      subjective,
      objective,
      photos: photos.map(p => p.id)
    };

    await saveVisitNote(documentation);

    // Feature 1: Send success notification
    NotificationService.send({
      type: 'documentation_reminder',
      priority: 'low',
      title: 'Visit Note Saved',
      message: `Documentation for ${patient.name} has been saved`,
      actionUrl: `/documentation/${visit.id}`,
      actionLabel: 'View Note'
    });
  };

  return (
    <div className="visit-execution">
      <h1>Visit: {patient.name}</h1>

      {/* Feature 3: Voice-to-text documentation */}
      <section>
        <h2>Subjective</h2>
        <VoiceToTextEditor
          value={subjective}
          onChange={setSubjective}
          placeholder="Patient's reported symptoms..."
          medicalTermsEnabled={true}
        />
      </section>

      <section>
        <h2>Objective</h2>
        <VoiceToTextEditor
          value={objective}
          onChange={setObjective}
          placeholder="Clinical observations, vital signs..."
          medicalTermsEnabled={true}
        />
      </section>

      {/* Feature 5: Photo capture for wound documentation */}
      <section>
        <h2>Wound Assessment</h2>
        <button onClick={() => setShowCamera(true)}>
          📷 Capture Wound Photo
        </button>
        
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {photos.map(photo => (
              <img key={photo.id} src={photo.dataUrl} className="rounded" />
            ))}
          </div>
        )}
      </section>

      <button onClick={handleSaveDocumentation} className="save-btn">
        Save Visit Note
      </button>

      {/* Photo capture modal */}
      {showCamera && (
        <PhotoVideoCapture
          patientId={patient.id}
          visitId={visit.id}
          userId="current_user"
          onCapture={(media) => {
            setPhotos([...photos, media]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
          existingPhotos={photos}
        />
      )}
    </div>
  );
};
```

---

## Browser Compatibility Notes

### Feature Support Matrix

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Notifications | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Advanced Search | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Voice-to-Text | ✅ Full | ✅ Full | ✅ iOS 14.3+ | ❌ Limited |
| Predictive Scheduling | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Photo Capture | ✅ Full | ✅ Full | ✅ iOS 14.3+ | ⚠️ Partial |

### Fallback Patterns

```typescript
// Check for voice-to-text support
const isVoiceSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

{isVoiceSupported ? (
  <VoiceToTextEditor value={text} onChange={setText} />
) : (
  <textarea value={text} onChange={e => setText(e.target.value)} />
)}

// Check for camera support
const isCameraSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

{isCameraSupported ? (
  <button onClick={() => setShowCamera(true)}>Capture Photo</button>
) : (
  <input type="file" accept="image/*" capture="environment" />
)}
```

---

## Performance Optimization Tips

### 1. Lazy Load Heavy Components
```typescript
import { lazy, Suspense } from 'react';

const PhotoVideoCapture = lazy(() => import('./components/clinical/PhotoVideoCapture'));
const AdvancedSearch = lazy(() => import('./components/search/AdvancedSearch'));

// Usage:
<Suspense fallback={<div>Loading camera...</div>}>
  {showCamera && <PhotoVideoCapture {...props} />}
</Suspense>
```

### 2. Debounce Search Queries
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((filters) => handleSearch(filters), 500),
  []
);
```

### 3. Optimize Notification Rendering
```typescript
// Only re-render notification center when unread count changes
const MemoizedNotificationCenter = React.memo(NotificationCenter, (prev, next) => {
  return prev.unreadCount === next.unreadCount;
});
```

---

## Security Best Practices

### 1. Secure Photo Upload
```typescript
// Server-side validation
app.post('/api/wound-photos', authenticate, async (req, res) => {
  const file = req.files.photo;
  
  // Validate file type
  if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large' });
  }
  
  // Verify patient access
  const hasAccess = await verifyPatientAccess(req.user.id, req.body.patientId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Strip EXIF data (already done client-side, but verify)
  const cleanedImage = await stripExifData(file);
  
  // Save to secure storage
  const url = await saveToSecureStorage(cleanedImage, {
    patientId: req.body.patientId,
    visitId: req.body.visitId,
    uploadedBy: req.user.id
  });
  
  res.json({ url, id: generateId() });
});
```

### 2. Sanitize Search Queries
```typescript
// Prevent SQL injection in search
const sanitizeQuery = (query: string): string => {
  return query
    .replace(/[^\w\s]/gi, '') // Remove special chars
    .trim()
    .substring(0, 200); // Limit length
};

const handleSearch = async (filters: SearchFilters) => {
  const sanitizedFilters = {
    ...filters,
    query: sanitizeQuery(filters.query)
  };
  
  return searchAPI(sanitizedFilters);
};
```

---

## Troubleshooting Common Issues

### Voice-to-Text Not Working
```
Problem: Microphone permission denied
Solution: Check browser permissions, ensure HTTPS

Problem: No speech detected
Solution: Check microphone hardware, adjust sensitivity

Problem: Medical terms not correcting
Solution: Verify medicalTermsEnabled={true} prop is set
```

### Photo Capture Not Working
```
Problem: Camera access denied
Solution: Check permissions, ensure HTTPS on mobile

Problem: Photos appear rotated
Solution: EXIF orientation already handled, check browser version

Problem: Large file sizes
Solution: Reduce resolution or enable compression (already optimized to 0.9 quality)
```

### Notifications Not Appearing
```
Problem: Desktop notifications not showing
Solution: Check browser permissions, verify Notification.permission === 'granted'

Problem: Sounds not playing
Solution: Check volume, verify soundEnabled in settings

Problem: Notifications disappearing
Solution: Notifications persist to localStorage (max 100), check storage quota
```

---

This integration guide should get you up and running with all 5 new features quickly. Copy-paste the relevant examples and adapt to your specific use cases!
