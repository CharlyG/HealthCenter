# Demo Seeding Guide

## Overview

The healthcare platform includes a comprehensive demo seeding system that automatically populates the database with realistic test data for development and demonstration purposes.

## Quick Start

### Option 1: Using the Login Page (Recommended)

1. Navigate to the login page
2. Click "Demo Mode - Quick Login"
3. If no data exists, click "Seed Demo Database"
4. Wait for seeding to complete (~10-15 seconds)
5. Select any demo profile to login

### Option 2: API Endpoint

```bash
# Seed the database
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-845bc545/seed/demo \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json"

# Get available demo profiles
curl https://{projectId}.supabase.co/functions/v1/make-server-845bc545/seed/profiles \
  -H "Authorization: Bearer {publicAnonKey}"
```

## What Gets Seeded

### 1. Organization
- **Demo Healthcare Network** - Multi-office healthcare organization

### 2. Offices (3)
- **Downtown Medical Center** - San Francisco, CA
- **North Bay Clinic** - San Rafael, CA
- **Peninsula Health Services** - Redwood City, CA

### 3. Modules (7)
All modules are enabled by default:
- Patient Management
- Admissions
- Scheduling
- CareConnect
- Monitor
- Hospice
- Admin

### 4. Features (20+)
All features are enabled by default, including:
- Patient CRUD operations
- Admission management
- Visit scheduling
- Real-time care coordination
- Monitoring and alerts
- Hospice workflows
- System administration

### 5. Integration Catalog
Pre-configured integration categories:
- EVV (Electronic Visit Verification)
- SMS Messaging
- Email Service
- Push Notifications
- Medication Database
- Fax Service
- Mapping & Geolocation

### 6. Demo User Profiles

#### Admin Profile
- **Email**: admin@demo.com
- **Password**: demo123
- **Name**: Sarah Admin
- **Role**: admin
- **Access**: Full system access, can configure modules and integrations
- **Offices**: All offices

#### Physician Profile
- **Email**: doctor@demo.com
- **Password**: demo123
- **Name**: Dr. Michael Chen
- **Role**: physician
- **Access**: Clinical access, can manage patients and review charts
- **Offices**: Downtown, North Bay

#### Nurse Profile
- **Email**: nurse@demo.com
- **Password**: demo123
- **Name**: Jennifer Martinez RN
- **Role**: nurse
- **Access**: Care delivery, can document visits and update care plans
- **Offices**: Downtown only

#### Scheduler Profile
- **Email**: scheduler@demo.com
- **Password**: demo123
- **Name**: David Scheduler
- **Role**: scheduler
- **Access**: Scheduling focus, can create and manage visit schedules
- **Offices**: All offices

#### Care Coordinator Profile
- **Email**: coordinator@demo.com
- **Password**: demo123
- **Name**: Emily Care Coordinator
- **Role**: care_coordinator
- **Access**: Care coordination, can monitor visits and coordinate care
- **Offices**: Peninsula only

#### Billing Profile
- **Email**: biller@demo.com
- **Password**: demo123
- **Name**: Robert Billing
- **Role**: billing
- **Access**: Billing and insurance, can manage claims and reimbursement
- **Offices**: All offices

### 7. Sample Patients (4)
Each patient includes:
- Full demographics (name, DOB, MRN)
- Contact information
- Address
- Admission status
- Payer information

Sample patients:
- John Smith (Medicare, Downtown)
- Mary Johnson (Blue Cross, Downtown)
- Robert Williams (Medicare, North Bay)
- Patricia Brown (Medicaid, Peninsula)

## Testing Different Roles

### As Admin
- Access Platform Configuration (Admin > Platform Configuration)
- Toggle modules and features on/off
- Configure integrations
- View audit logs
- Create/manage users

### As Physician
- View patient lists
- Access patient charts
- Review care plans
- Approve medical orders

### As Nurse
- Document visits
- Update care plans
- Clock in/out of visits
- View assigned patients

### As Scheduler
- Create visit schedules
- Assign caregivers
- Manage calendars
- Handle visit conflicts

### As Care Coordinator
- Monitor visit status
- Coordinate care across offices
- Handle alerts
- Communicate with care team

### As Billing
- View patient insurance
- Manage claims
- Handle reimbursement
- Generate reports

## Reseeding

To reseed the database:

1. Go to Demo Mode in the login page
2. Click "Reseed Demo Data"
3. This will create a NEW organization with fresh data
4. Previous data remains but new users are created

**Note**: User accounts persist in Supabase Auth even after reseeding. This is expected behavior.

## Development Workflow

### Adding New Features

When you add new features to the system:

1. Add the feature to the seed data in `/supabase/functions/server/index.tsx`
2. Update the `features` array in the seed endpoint
3. Reseed the database to test with the new feature

Example:
```typescript
// Add to features array in seed endpoint
{
  id: 'new-feature-id',
  moduleId: 'module-id',
  name: 'New Feature Name',
  description: 'Feature description'
}
```

### Adding New Modules

1. Add the module to the `modules` array in the seed endpoint
2. Add corresponding features
3. Update navigation components to handle the new module
4. Reseed to test

### Adding New User Roles

1. Add the role to `demoUsers` array in seed endpoint
2. Add role-specific permissions
3. Add color coding to `getRoleBadgeColor` in Login.tsx
4. Update role descriptions

## API Endpoints

### Seed Demo Database
```
POST /make-server-845bc545/seed/demo
```
Creates complete demo organization with users, patients, and configuration.

### Get Demo Profiles
```
GET /make-server-845bc545/seed/profiles
```
Returns list of available demo profiles with credentials.

### Clear Demo Data (Testing Only)
```
POST /make-server-845bc545/seed/clear
```
Attempts to clear demo data (Note: User accounts remain in Auth).

## Security Notes

- All seed endpoints are PUBLIC for demo purposes
- Passwords are set to `demo123` for all demo users
- In production, these endpoints should be removed or protected
- Demo data includes NO real PHI/PII
- This is for development and demonstration only

## Troubleshooting

### "Failed to seed demo database"
- Check Supabase connection
- Verify environment variables are set
- Check server logs in Supabase dashboard

### "Failed to load demo profiles"
- Ensure seed endpoint has been called at least once
- Check network connection
- Verify API endpoint URL

### Users already exist
- This is normal when reseeding
- Supabase Auth will return an error for duplicate emails
- New organization data is still created

### Missing modules/features
- Run reseed to get latest configuration
- Check that modules are enabled in Platform Configuration
- Verify user has appropriate role permissions

## Best Practices

1. **Always seed before demos** - Ensures consistent demo experience
2. **Use role-appropriate accounts** - Demonstrate features in context
3. **Clean seed data regularly** - Keep demo environment fresh
4. **Document new seed data** - Update this guide when adding features
5. **Test with multiple roles** - Ensure permission system works correctly

## Future Enhancements

Potential improvements to the seeding system:

- [ ] Seed scheduled visits
- [ ] Seed care plans and notes
- [ ] Seed historical audit logs
- [ ] Seed insurance claims
- [ ] Seed medication orders
- [ ] Add more patient demographics
- [ ] Add caregiver profiles
- [ ] Seed relationships between entities
- [ ] Add time-based data (visits in progress, etc.)
- [ ] Configurable seed data (small/medium/large datasets)
