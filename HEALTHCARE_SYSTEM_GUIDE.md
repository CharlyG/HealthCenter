# HIPAA-Compliant Healthcare Platform

## Overview

This is a comprehensive healthcare management system built with React, Supabase, and following HIPAA compliance best practices. The platform includes modular access control, role-based permissions, comprehensive audit logging, and a flexible architecture designed for easy migration to production infrastructure.

## ⚠️ CRITICAL SECURITY NOTICE

**THIS IS A DEVELOPMENT/PROTOTYPE ENVIRONMENT**

- **DO NOT** use real patient data (PHI - Protected Health Information)
- **DO NOT** use real personally identifiable information (PII)
- **DO NOT** deploy this directly to production without proper security hardening
- For production use, you MUST:
  - Obtain Business Associate Agreements (BAAs) with all service providers
  - Implement encryption at rest and in transit
  - Set up comprehensive audit logging
  - Configure Row-Level Security (RLS) policies in Supabase
  - Deploy to HIPAA-compliant infrastructure
  - Conduct security audits and penetration testing

## Quick Start

### 1. First Time Setup

1. Open the application - you'll see the login page
2. Click **"First Time? Run Setup Wizard"** button
3. Follow the 3-step wizard:
   - **Step 1**: Create your organization
   - **Step 2**: Create your first office
   - **Step 3**: Create admin user account
4. After setup completes, you'll be redirected to login
5. Sign in with the credentials you just created

### 2. Default Demo Credentials (after running setup)

```
Email: admin@healthcare.com
Password: healthcare123
```

## Architecture

### Three-Tier Architecture

Following the POC architecture rules for easy migration:

```
Frontend (React) → Data Gateway → Backend Server (Supabase Edge Functions) → Database (Postgres)
```

### Key Design Principles

1. **Data Gateway Pattern**: All database operations go through `/src/app/lib/dataGateway.ts`
   - Easy to swap implementations when migrating to .NET or other backends
   - Consistent error handling and authentication

2. **Abstract Auth & Permissions**:
   - Built around roles, module toggles, and feature toggles
   - Office-scoped permissions
   - Easy to migrate to different auth providers (JWT/claims-based)

3. **Audit Everything**:
   - Every configuration change is logged
   - Who/When/What changed tracking
   - Immutable audit trail

## Core Modules

The platform includes 7 core modules:

### 1. **Patient Management**
- Patient records and demographics
- CRUD operations for patient data
- Search and filtering capabilities

### 2. **Admissions**
- Patient admission and discharge
- Insurance management
- Admission status tracking

### 3. **Scheduling**
- Visit scheduling and calendar
- Conflict detection
- Visit management

### 4. **CareConnect**
- Real-time care coordination
- Visit status tracking
- Clock-in/out functionality

### 5. **Monitor**
- Visit monitoring and oversight
- Alert management
- Quality assurance metrics
- Compliance tracking

### 6. **Hospice**
- Hospice care management
- HOPE timeline (Hospice Outcomes and Patient Evaluation)
- Medical Director signature queue

### 7. **Admin**
- Platform configuration
- Module and feature toggles
- Audit log viewer

## Platform Configuration

### Accessing Admin Panel

1. Navigate to **Admin** → **Platform Configuration** from the sidebar
2. Three tabs available:
   - **Modules**: Enable/disable entire modules
   - **Features**: Enable/disable specific features within modules
   - **Audit Logs**: View all configuration changes

### Module Management

**Organization-Level Control**:
- Toggle entire modules on/off for your organization
- Disabled modules disappear from navigation
- Routes become inaccessible with friendly error messages

**Office-Level Overrides**:
- Override organization settings for specific offices
- Granular control per location
- Useful for pilot programs or phased rollouts

### Feature Management

- Features are grouped by module
- Each feature can be toggled independently
- Examples:
  - Patient Create, Edit, Delete
  - Admission Insurance Management
  - Schedule Visit Cancellation
  - HOPE Timeline, MD Queue

### Audit Logging

Every change is tracked:
- User who made the change
- Timestamp
- Entity type and ID
- Old value → New value (full JSON diff)

## Database Schema

The system uses Supabase's key-value store with the following structure:

### Core Tables (Key Prefixes)

```typescript
// Organizations
org:{orgId} → { id, name, type, created_at, updated_at }

// Offices
office:{orgId}:{officeId} → { id, org_id, name, address, phone, ... }

// Modules (Catalog)
module:{moduleId} → { id, name, description, icon, order, ... }

// Features (Catalog)
feature:{featureId} → { id, moduleId, name, description, ... }

// Module Settings (Per Org)
module-setting:{orgId}:{moduleId} → { 
  org_id, module_id, enabled, office_overrides, 
  updated_at, updated_by 
}

// Feature Settings (Per Org)
feature-setting:{orgId}:{featureId} → { 
  org_id, feature_id, enabled, office_overrides,
  updated_at, updated_by 
}

// User Profiles
profile:{userId} → { 
  id, email, name, role, org_id, office_ids,
  created_at, updated_at 
}

// Audit Logs
audit:{timestamp}:{userId} → {
  user_id, action, entity_type, entity_id,
  old_value, new_value, timestamp
}

// Patients
patient:{officeId}:{patientId} → {
  id, office_id, first_name, last_name, dob, mrn,
  phone, address, created_at, updated_at
}
```

## Navigation & Access Control

### Dynamic Navigation

- Navigation items are generated from enabled modules
- Automatically updates when module settings change
- Only shows modules the user has access to

### AppGate Layer

The system includes route protection:
- Checks if module is enabled before rendering
- Redirects to "Module Disabled" page if access denied
- Clear user communication about why access is blocked

### Patient Context Header

When a patient is selected:
- Sticky header appears below top bar
- Shows: Name, DOB/Age, MRN, Office, Admission Status, Payer tags
- Persists across navigation
- Close button to clear context

## User Roles & Permissions

### Role-Based Access

Default role structure:
- **Admin**: Full access to all modules and configuration
- **Clinical**: Access to patient care modules
- **Scheduler**: Access to scheduling and coordination
- **Viewer**: Read-only access

### Permission Levels

Permissions are checked at:
1. **Module Level**: Can the user access this module?
2. **Feature Level**: Can the user perform this action?
3. **Office Level**: Does the user have access to this office?

## API Endpoints

All endpoints are prefixed with `/make-server-845bc545/`

### Authentication
- `POST /auth/signup` - Create new user
- `GET /auth/profile` - Get current user profile

### Organizations
- `GET /orgs` - List organizations
- `POST /orgs` - Create organization

### Offices
- `GET /offices/:orgId` - List offices for org
- `POST /offices` - Create office

### Modules
- `GET /modules` - List all modules
- `POST /modules/init` - Initialize default modules

### Features
- `GET /features` - List all features
- `POST /features/init` - Initialize default features

### Module Settings
- `GET /module-settings/:orgId` - Get org module settings
- `PUT /module-settings` - Update module setting

### Feature Settings
- `GET /feature-settings/:orgId` - Get org feature settings
- `PUT /feature-settings` - Update feature setting

### Audit Logs
- `GET /audit-logs` - Get all audit logs

### Patients
- `GET /patients/:officeId` - List patients for office
- `POST /patients` - Create patient

## Migration Path to Production

### Phase 1: Current State (POC)
- React frontend
- Supabase Auth
- Supabase Postgres (via KV store)
- Edge Functions for business logic

### Phase 2: Production Migration
1. **Backend Migration**:
   - Swap `dataGateway.ts` implementation
   - Point to .NET 8 API instead of Supabase
   - UI code remains unchanged

2. **Auth Migration**:
   - .NET API issues JWTs with claims
   - Frontend validates tokens
   - Permission checks remain identical

3. **Database Migration**:
   - Export data from KV store
   - Import to production Postgres with proper schema
   - Implement Row-Level Security (RLS)

4. **Infrastructure**:
   - Deploy to HIPAA-compliant hosting
   - Set up encryption at rest and in transit
   - Configure backup and disaster recovery
   - Implement comprehensive monitoring

## Development Guidelines

### Adding a New Module

1. Create the module entry in `/supabase/functions/server/index.tsx` (init modules)
2. Add features for the module in init features
3. Create page component in `/src/app/pages/`
4. Add route to `/src/app/routes.ts`
5. Add icon mapping in `/src/app/components/Sidebar.tsx`
6. Test module toggle functionality

### Adding a New Feature

1. Add feature definition in init features endpoint
2. Update relevant page to check `isFeatureEnabled()`
3. Show/hide UI elements based on feature state
4. Test feature toggle

### Best Practices

1. **Always use Data Gateway**: Never call Supabase directly from components
2. **Check permissions**: Use `isModuleEnabled()` and `isFeatureEnabled()` before rendering
3. **Audit important actions**: Call `createAuditLog()` for any data changes
4. **Handle errors gracefully**: Show user-friendly messages
5. **Never log PHI**: Sanitize logs in production

## Testing the System

### Test Scenarios

1. **Module Toggle**:
   - Go to Admin → Platform Configuration
   - Disable "Patient Management" module
   - Navigate to sidebar - module should disappear
   - Try accessing `/patient` - should redirect to "Module Disabled"
   - Re-enable module - should reappear

2. **Office Override**:
   - Create multiple offices
   - Disable a module at org level
   - Enable for specific office
   - Verify office-scoped access works

3. **Feature Toggle**:
   - Disable specific features (e.g., "Create Patient")
   - Verify buttons/actions are hidden
   - Check audit log for changes

4. **Audit Trail**:
   - Make several configuration changes
   - View audit log
   - Verify all changes are tracked with old/new values

## Troubleshooting

### "Module Disabled" Error
- Check Platform Configuration
- Verify module is enabled at org level
- Check for office-level overrides

### Authentication Errors
- Clear browser storage
- Re-run setup wizard
- Check Supabase credentials in environment

### Data Not Loading
- Check browser console for errors
- Verify API endpoints are accessible
- Check authentication token is valid

## Support & Documentation

For more information:
- Architecture: See `/src/imports/poc-architecture-db-figma.md`
- Component Library: Shadcn/ui components in `/src/app/components/ui/`
- API Reference: Review `/supabase/functions/server/index.tsx`

---

**Remember**: This is a prototype for development and demonstration. Never use with real patient data until properly secured and deployed to HIPAA-compliant infrastructure.
