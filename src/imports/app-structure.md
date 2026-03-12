We are building a production-grade healthcare operations platform for home health and hospice agencies. This is not a prototype UI. The goal is to build the final product foundation that will later migrate to a .NET 8 API while keeping the React UI.

The app will initially use Supabase with PostgreSQL for authentication and database access, but the architecture must be designed so that Supabase can later be replaced by a .NET API without rewriting the UI.

Apply the following architecture rules:

1. React Architecture
- Build the application using modular reusable components.
- Separate layout components, data loading logic, orchestration components, and presentational components.
- Avoid large page components.
- Use composable React patterns.

2. Data Access Layer
Create a dedicated data access abstraction layer:
- dataGateway for database operations
- integrationGateway for external vendor connectors

All screens must call the gateway layer rather than directly accessing Supabase APIs.

3. Performance Rules
- Tables must support server-side pagination and filtering assumptions.
- Avoid loading full datasets unnecessarily.
- Lazy-load drawers, inspectors, and secondary panels.
- Virtualize large lists when appropriate.
- Split large forms into sections and lazy mount content.
- Memoize expensive calculations.

4. Product Design Philosophy
The product should be optimized for the daily workflows of:
- Intake coordinators
- Schedulers
- Clinicians
- QA reviewers
- Billing staff
- Hospice teams
- Administrators

Navigation must prioritize:
- work queues
- alerts
- due items
- operational exceptions

5. External Vendor Strategy
External vendors must be configurable connectors:
Examples:
- EVV vendors
- SMS providers
- Medication services
- Fax services
- Email providers

All integration operations must write to a database log.

6. Data Model Rules
All application state must be stored in the database except for external vendor responses which may be mocked.

The system must support:
- module enable/disable
- feature enable/disable
- vendor configuration
- audit logs
- office-level configuration
- role-based permissions

Generate the base application structure with routing, layout shell, and gateway abstractions.