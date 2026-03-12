# Clinical Module - Testing & Verification Guide

**Date:** March 6, 2026  
**Purpose:** Step-by-step verification of backend integration

---

## 🧪 Backend Verification

### Step 1: Verify Seed Data Loaded
Check the backend logs for successful seed:

```
[seed] Running idempotent seed...
[seed] Found X existing auth users
[seed] Demo users seeded ✓
[seed] Idempotent seed complete ✓
```

### Step 2: Test Seed Endpoint
Make a POST request to trigger manual re-seed:

```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-845bc545/seed/demo
```

Expected response:
```json
{
  "success": true,
  "message": "Demo database seeded successfully (idempotent)",
  "data": {
    "org": "org-demo",
    "offices": ["Downtown Medical Center", "North Bay Clinic", "Peninsula Health Services"],
    "users": [...],
    "modules": 8,
    "features": 24,
    "patients": 6,
    "visitNotes": 5,
    "plansOfCare": 4,
    "verbalOrders": 5,
    "qaDocuments": 5
  }
}
```

### Step 3: Test API Endpoints

**Visit Notes:**
```bash
# List all
curl https://{projectId}.supabase.co/functions/v1/make-server-845bc545/clinical/visit-notes \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "X-User-Token: {userToken}"

# Expected: { visitNotes: [...5 records...] }
```

**Plans of Care:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-845bc545/clinical/plans-of-care \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "X-User-Token: {userToken}"

# Expected: { plansOfCare: [...4 records...] }
```

**Verbal Orders:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-845bc545/clinical/verbal-orders \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "X-User-Token: {userToken}"

# Expected: { verbalOrders: [...5 records...] }
```

**QA Documents:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-845bc545/clinical/qa-documents \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "X-User-Token: {userToken}"

# Expected: { qaDocuments: [...5 records...] }
```

---

## 🖥️ Frontend Verification

### Step 1: Login
1. Open the application
2. Login with: **nurse@demo.com** / **demo123**
3. Verify successful authentication

### Step 2: Navigate to Clinical Module
1. Click **Clinical** in the left sidebar
2. Verify the Clinical landing page loads
3. Check all 4 tiles are present:
   - Visit Notes
   - Plans of Care
   - Verbal Orders
   - QA Review

---

## ✅ Visit Notes Testing

### Navigation
1. Click **Visit Notes** tile
2. URL should be: `/clinical/visit-notes`

### Data Display
- ✅ **Count:** "Visit Notes (5)"
- ✅ **Stats visible:**
  - In Progress: 1
  - Completed: 1
  - Returned: 1
  - Approved: 1

### Verify All Records
| ✓ | Patient | Discipline | Status |
|---|---|---|---|
| ☐ | John Smith | RN | Completed |
| ☐ | Mary Johnson | PT | Approved |
| ☐ | Robert Williams | OT | Returned |
| ☐ | Patricia Brown | LPN | In Progress |
| ☐ | James Davis | ST | Corrected |

### Filter Testing
1. **Discipline Filter:** Select "RN" → Should show 1 record (John Smith)
2. **Status Filter:** Select "Approved" → Should show 1 record (Mary Johnson)
3. **Search:** Type "Williams" → Should show 1 record (Robert Williams)
4. **Reset:** Clear filters → Should show all 5 records

### Visual Verification
- ☐ Loading spinner appeared briefly
- ☐ No error messages
- ☐ Patient names are bold
- ☐ MRN badges visible (gray outline)
- ☐ Discipline badges visible (gray secondary)
- ☐ Status badges color-coded correctly
- ☐ Hover state works (background turns gray)
- ☐ Chevron icons on right side

---

## ✅ Plans of Care Testing

### Navigation
1. Go back to Clinical
2. Click **Plans of Care** tile
3. URL should be: `/clinical/plans-of-care`

### Data Display
- ✅ **Count:** "Plans of Care (4)"
- ✅ **Stats visible:**
  - In Progress: 1
  - Pending Signatures: 2
  - Returned: 1
  - Approved: 1

### Verify All Records
| ✓ | Patient | Type | Signatures | Status |
|---|---|---|---|---|
| ☐ | John Smith | Initial POC | 2/3 | Completed |
| ☐ | Mary Johnson | Recertification | 3/3 | Approved |
| ☐ | Robert Williams | Revision | 1/2 | Returned |
| ☐ | Patricia Brown | Initial POC | 0/2 | In Progress |

### Special Checks
- ☐ **Signature progress** showing correctly (2/3, 3/3, etc.)
- ☐ **"Pending Signatures" badge** visible on incomplete POCs
- ☐ **POC type badges** displaying correctly
- ☐ **Date ranges** formatted properly

### Filter Testing
1. **Type Filter:** Select "Initial POC" → Should show 2 records
2. **Status Filter:** Select "Approved" → Should show 1 record (Mary Johnson)
3. **Search:** Type "Smith" → Should show 1 record
4. **Reset:** Clear filters → Should show all 4 records

---

## ✅ Verbal Orders Testing

### Navigation
1. Go back to Clinical
2. Click **Verbal Orders** tile
3. URL should be: `/clinical/verbal-orders`

### Data Display
- ✅ **Count:** "Verbal Orders (5)"
- ✅ **Stats visible:**
  - Pending Physician Signature: 2
  - Pending Nurse Signature: 3
  - Expiring Soon: 3
  - Approved: 1

### Verify All Records
| ✓ | Patient | Type | Expiry | Physician | Nurse |
|---|---|---|---|---|---|
| ☐ | John Smith | Medication | 5 days | ✓ | ✓ |
| ☐ | Mary Johnson | Diagnostic | 2 days ⚠️ | ✗ | ✓ |
| ☐ | Robert Williams | Therapy | 10 days | ✓ | ✓ |
| ☐ | Patricia Brown | Treatment | 3 days ⚠️ | ✗ | ✓ |
| ☐ | James Davis | Equipment | 1 day 🔴 | ✓ | ✓ |

### Special Checks
- ☐ **Red "Expires in X days" badge** visible on orders ≤3 days
- ☐ **Physician signature status:** "✓ Signed" or "Pending"
- ☐ **Nurse signature status:** "✓ Signed" or "Pending"
- ☐ **"Follow-up Required" badge** visible on applicable orders
- ☐ **Order description** displaying full text

### Filter Testing
1. **Type Filter:** Select "Medication" → Should show 1 record
2. **Signature Filter:** Select "Pending Physician" → Should show 2 records
3. **Status Filter:** Select "Approved" → Should show 1 record
4. **Search:** Type "CBC" → Should show diagnostic order
5. **Reset:** Clear filters → Should show all 5 records

---

## ✅ QA Review Testing

### Navigation
1. Go back to Clinical
2. Click **QA Review** tile
3. URL should be: `/clinical/qa-review`

### Data Display
- ✅ **Count:** "Documents for Review (5)"
- ✅ **Stats visible:**
  - In Queue: 2
  - In Review: varies
  - Returned: 1
  - Approved Today: 2

### Verify All Records
| ✓ | Type | Patient | Priority | Status | Assigned |
|---|---|---|---|---|---|
| ☐ | Visit Note | John Smith | Medium | Completed | Jane Reviewer |
| ☐ | Visit Note | Mary Johnson | Low | Approved | Jane Reviewer |
| ☐ | Visit Note | Robert Williams | High | Returned | John QA Manager |
| ☐ | Plan of Care | John Smith | Medium | Completed | Jane Reviewer |
| ☐ | Verbal Order | Mary Johnson | High | Completed | Unassigned |

### Special Checks
- ☐ **Document type icons** visible (FileText, ClipboardList, FileSignature)
- ☐ **Priority badges** color-coded (Red=High, Blue=Medium, Gray=Low)
- ☐ **Return reason** displayed in red box for returned document
- ☐ **Days in queue** showing for all documents
- ☐ **Assignment** visible ("Assigned to: Jane Reviewer")

### Filter Testing
1. **Type Filter:** Select "Visit Note" → Should show 3 records
2. **Status Filter:** Select "Approved" → Should show 1 record
3. **Priority Filter:** Select "High" → Should show 2 records
4. **Search:** Type "Williams" → Should show 1 record
5. **Reset:** Clear filters → Should show all 5 records

---

## 🔍 Edge Case Testing

### Empty States
1. **Create filter combination with no results**
   - Example: Type="Plan of Care" + Status="Approved"
   - Should show: "No documents found" message
   - Reset filters to restore data

### Loading States
1. **Refresh page**
   - Brief loading spinner should appear
   - Data should load smoothly
   - No flickering or layout shifts

### Error Handling
1. **Test with invalid auth** (if possible)
   - Should show error message
   - Should not crash the app

---

## 📊 Performance Checks

### Page Load Times
- ☐ Visit Notes: Loads in <1 second
- ☐ Plans of Care: Loads in <1 second
- ☐ Verbal Orders: Loads in <1 second
- ☐ QA Review: Loads in <1 second

### Filter Performance
- ☐ Filters update instantly (no lag)
- ☐ Search is responsive
- ☐ Stats recalculate immediately

### UI Responsiveness
- ☐ No jank or stuttering
- ☐ Smooth transitions
- ☐ Hover states instant

---

## ✅ Final Checklist

### Backend
- ☐ All 15 API endpoints responding
- ☐ Seed data persisting correctly
- ☐ Authentication working
- ☐ Audit logs being created

### Frontend - Visit Notes
- ☐ Data loads from backend
- ☐ All 5 records display
- ☐ Filters work correctly
- ☐ Stats accurate
- ☐ Loading/error states functional

### Frontend - Plans of Care
- ☐ Data loads from backend
- ☐ All 4 records display
- ☐ Signature tracking works
- ☐ Filters work correctly
- ☐ Stats accurate

### Frontend - Verbal Orders
- ☐ Data loads from backend
- ☐ All 5 records display
- ☐ Expiration alerts visible
- ☐ Signature status accurate
- ☐ Filters work correctly

### Frontend - QA Review
- ☐ Data loads from backend
- ☐ All 5 records display
- ☐ Priority badges correct
- ☐ Return reasons display
- ☐ Filters work correctly

### UX/UI
- ☐ Consistent styling across pages
- ☐ Clear visual hierarchy
- ☐ Exception-first design evident
- ☐ Fast data density achieved
- ☐ Professional appearance

---

## 🐛 Known Issues / Future Work

### To Be Implemented
- [ ] Create/Edit forms for all document types
- [ ] Signature capture workflow
- [ ] QA approval/return actions
- [ ] Real-time updates (WebSocket)
- [ ] Pagination for large datasets
- [ ] Export to PDF

### Nice to Have
- [ ] Keyboard shortcuts
- [ ] Command palette (⌘K)
- [ ] Bulk actions
- [ ] Advanced filtering (date ranges, etc.)
- [ ] Saved filter presets

---

## 🎉 Success Criteria

**All tests pass = Clinical Module ready for production use!**

- ✅ Backend serving real data
- ✅ Frontend consuming backend correctly
- ✅ All filters functional
- ✅ Loading states professional
- ✅ Error handling graceful
- ✅ Performance acceptable (<1s loads)
- ✅ UI/UX matches design system
- ✅ No console errors
- ✅ No broken links
- ✅ All seed data visible

**Next Step:** Build create/edit forms to complete CRUD operations.

---

**Last Updated:** March 6, 2026  
**Tester:** _______________  
**Test Date:** _______________  
**Pass/Fail:** _______________
