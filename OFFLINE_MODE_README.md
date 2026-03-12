# Offline Mode System

Complete offline experience for clinicians working in areas with poor connectivity.

## 📁 Files Created

- `/src/app/hooks/useOfflineSync.ts` - Core hook for offline sync logic
- `/src/app/components/offline/OfflineModeManager.tsx` - UI components (banner, badge, modal)
- `/src/app/components/offline/OfflineModeDemo.tsx` - Demo page
- `/src/app/pages/OfflineModeDemoPage.tsx` - Route wrapper
- `/src/app/context/OfflineModeProvider.tsx` - Global provider

## ✨ Features

### 1. **Offline Detection**
- Automatic online/offline detection
- Visual indicators (banner + badge)
- Real-time status updates

### 2. **Sync Queue Management**
- Local storage persistence
- Item-level status tracking (pending, syncing, failed, synced)
- Automatic retry logic (up to 3 attempts)
- Manual retry for failed items

### 3. **User Interface**
- **Top Banner** - Shows when offline or has unsynced records
- **Floating Badge** - Always visible status indicator
- **Queue Modal** - Full queue management interface

### 4. **Sync Operations**
- Auto-sync when connection restored
- Manual sync trigger
- Progress tracking
- Batch synchronization

### 5. **Data Types Supported**
- Visit documentation
- Vital signs
- Medications
- Assessments
- Visit notes

## 🚀 Usage

### Basic Usage (Hook Only)

```tsx
import { useOfflineSync } from '../hooks/useOfflineSync';

function MyComponent() {
  const { isOnline, addToQueue, triggerSync } = useOfflineSync();

  const handleSaveData = () => {
    addToQueue({
      type: 'visit_documentation',
      data: { /* your data */ },
      patient_id: 'PAT-001',
      patient_name: 'Mary Johnson',
      visit_id: 'VST-001',
    });
  };

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <button onClick={handleSaveData}>Save Data</button>
    </div>
  );
}
```

### Full UI Components

```tsx
import OfflineModeManager from '../components/offline/OfflineModeManager';

function MyPage() {
  return (
    <div>
      <OfflineModeManager />
      {/* Your page content */}
    </div>
  );
}
```

### Global Provider (Recommended)

Add to your Root component or App.tsx:

```tsx
import OfflineModeProvider from '../context/OfflineModeProvider';

function App() {
  return (
    <OfflineModeProvider>
      {/* Your app content */}
    </OfflineModeProvider>
  );
}
```

## 🧪 Testing Offline Mode

### Option 1: Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Change dropdown from "Online" to "Offline"
4. Create records
5. Switch back to "Online" to see auto-sync

### Option 2: Demo Page
Visit `/offline-mode-demo` to test with simulated data.

## 📊 Queue Item Structure

```typescript
interface SyncQueueItem {
  id: string;                    // Auto-generated
  type: 'visit_documentation' | 'visit_note' | 'vital_signs' | 'medication' | 'assessment';
  data: any;                     // Your data payload
  timestamp: string;             // ISO timestamp
  patient_id: string;
  patient_name: string;
  visit_id?: string;
  retry_count: number;           // Auto-tracked
  last_error?: string;           // If sync failed
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}
```

## 🎨 UI Components

### 1. Offline Banner (Top)
```
┌────────────────────────────────────────────────┐
│ 🚫 You're working offline                      │
│ 3 records waiting to sync          [View Queue]│
└────────────────────────────────────────────────┘
```

### 2. Floating Badge (Bottom Right)
```
         ┌─────────────┐
         │ 🌐 Offline  │
         │ 3 pending   │
         └─────────────┘
```

### 3. Queue Modal
```
┌─────────────────────────────────────────┐
│ Sync Queue                          [X] │
├─────────────────────────────────────────┤
│ 🌐 Connected                            │
│ Last sync: 2:45 PM        [Sync Now]    │
├─────────────────────────────────────────┤
│ Total: 3 | Pending: 2 | Failed: 1       │
├─────────────────────────────────────────┤
│ 📄 Mary Johnson - Visit Documentation   │
│    Created: 2:30 PM          [Pending]  │
│                                          │
│ 💉 John Smith - Medication              │
│    Error: Network timeout   [Retry] [×] │
└─────────────────────────────────────────┘
```

## 🔄 Auto-Sync Behavior

1. **When Online**: Items sync immediately (1 second delay)
2. **When Offline**: Items queued locally
3. **Connection Restored**: Auto-sync all pending items
4. **Sync Failure**: Retry up to 3 times with exponential backoff
5. **Success**: Item removed from queue after 2 seconds

## 💾 Data Persistence

- Uses `localStorage` for queue persistence
- Survives page refresh
- Cleared when items successfully sync
- Manual clear option available

## 🔧 Integration with Smart Documentation Editor

```tsx
import { useOfflineSync } from '../../hooks/useOfflineSync';
import SmartDocumentationEditor from '../documentation/SmartDocumentationEditor';

function VisitPage() {
  const { addToQueue } = useOfflineSync();

  const handleSubmit = (data) => {
    addToQueue({
      type: 'visit_documentation',
      data,
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      visit_id: data.visit_id,
    });
  };

  return (
    <>
      <OfflineModeManager />
      <SmartDocumentationEditor onSubmit={handleSubmit} />
    </>
  );
}
```

## 📈 Future Enhancements

- [ ] IndexedDB for larger data storage
- [ ] Conflict resolution for concurrent edits
- [ ] Partial sync for large datasets
- [ ] Background sync API integration
- [ ] Service Worker for true offline PWA
- [ ] Compression for queued data
- [ ] Analytics on sync patterns

## 🐛 Troubleshooting

### Issue: Items not syncing
- Check browser console for errors
- Verify network connection in DevTools
- Try manual sync button
- Check retry count (max 3)

### Issue: Queue not persisting
- Verify localStorage is enabled
- Check browser storage limits
- Clear cache and try again

### Issue: Sync failures
- Check API endpoint availability
- Verify data format
- Review error message in queue item
- Use retry button
