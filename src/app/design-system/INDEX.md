# Design System Documentation Index

Complete index of all design system documentation.

---

## 🎯 Start Here

### For Developers Building Screens
1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - One-page cheat sheet (2 min read)
2. **[SCREEN_GENERATION.md](./SCREEN_GENERATION.md)** - Master guide (15 min read)

### For Designers
1. **[README.md](./README.md)** - System overview
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Design principles
3. **[PATTERNS.md](./PATTERNS.md)** - UI patterns catalog

### For System Architects
1. **[MIGRATION.md](./MIGRATION.md)** - Backend migration strategy
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
3. **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance rules

---

## 📚 Complete Documentation

### Foundation (Design Tokens)
- **[foundations/tokens.ts](./foundations/tokens.ts)** - Raw design values
- **[semantic/tokens.ts](./semantic/tokens.ts)** - Usage-based tokens

### Architecture & Principles
- **[README.md](./README.md)** - Design system overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 6-layer architecture, design principles
- **[COMPONENTS.md](./COMPONENTS.md)** - Component development rules

### Screen Generation (PRIMARY GUIDES)
- **[SCREEN_GENERATION.md](./SCREEN_GENERATION.md)** - Master guide for all screens ⭐
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - One-page cheat sheet ⭐

### Performance & Data
- **[PERFORMANCE.md](./PERFORMANCE.md)** - React performance patterns
- **[LARGE_DATA.md](./LARGE_DATA.md)** - Pagination, virtualization, lazy loading

### Navigation & Layout
- **[ROUTING.md](./ROUTING.md)** - Route patterns, layout stability
- **[REUSABILITY.md](./REUSABILITY.md)** - Pattern reuse enforcement

### UI Components
- **[FIELDS.md](./FIELDS.md)** - 13 field component types
- **[FORMS.md](./FORMS.md)** - Form architecture & validation
- **[TABLES.md](./TABLES.md)** - Table patterns
- **[STICKY_FOOTER.md](./STICKY_FOOTER.md)** - Action bars & footers
- **[DRAWERS.md](./DRAWERS.md)** - Drawer patterns

### UI Patterns
- **[PATTERNS.md](./PATTERNS.md)** - Cards, badges, timelines, search, loading, accessibility

### Workflow Patterns
- **[FOCUS_MODE.md](./FOCUS_MODE.md)** - High-concentration workflows

### Healthcare Domain
- **[HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md)** - 16 healthcare-specific components

### Migration & Backend
- **[MIGRATION.md](./MIGRATION.md)** - Backend-agnostic architecture, Supabase → .NET

---

## 📖 Documentation by Use Case

### "I need to build a new list page"
1. Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Check available shells
2. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - List page example
3. Read: [LARGE_DATA.md](./LARGE_DATA.md) - Pagination patterns
4. Read: [TABLES.md](./TABLES.md) - Table implementation

### "I need to build a form"
1. Read: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Check shells
2. Read: [FORMS.md](./FORMS.md) - Form architecture
3. Read: [FIELDS.md](./FIELDS.md) - Field components
4. Read: [STICKY_FOOTER.md](./STICKY_FOOTER.md) - Form actions

### "I need to build a detail page with tabs"
1. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Detail page example
2. Read: [ROUTING.md](./ROUTING.md) - Layout stability
3. Read: [LARGE_DATA.md](./LARGE_DATA.md) - Lazy loading tabs

### "I need to build a dashboard/workspace"
1. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Workspace example
2. Read: [PATTERNS.md](./PATTERNS.md) - Card patterns
3. Read: [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md) - Metric cards

### "I need to optimize a slow page"
1. Read: [PERFORMANCE.md](./PERFORMANCE.md) - Performance rules
2. Read: [LARGE_DATA.md](./LARGE_DATA.md) - Data loading strategies
3. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Performance-first rules

### "I need to make UI consistent"
1. Read: [REUSABILITY.md](./REUSABILITY.md) - Pattern enforcement
2. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Consistency rules
3. Read: [PATTERNS.md](./PATTERNS.md) - Standard patterns

### "I need to prepare for backend migration"
1. Read: [MIGRATION.md](./MIGRATION.md) - Migration strategy
2. Read: [ARCHITECTURE.md](./ARCHITECTURE.md) - Separation of concerns
3. Read: [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Data gateway usage

### "I need to build a clinical workflow"
1. Read: [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md) - Domain components
2. Read: [FOCUS_MODE.md](./FOCUS_MODE.md) - Clinical documentation patterns
3. Read: [PATTERNS.md](./PATTERNS.md) - Timeline & status patterns

---

## 🗂️ Documentation by Component Type

### Shells (Page Layouts)
- [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - All shell usage examples
- [ROUTING.md](./ROUTING.md) - Context shells (Patient, Admission)
- [REUSABILITY.md](./REUSABILITY.md) - Shell inventory

### Cards
- [PATTERNS.md](./PATTERNS.md) - Card design patterns
- [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md) - Healthcare cards
- [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Card usage

### Forms & Fields
- [FORMS.md](./FORMS.md) - Form architecture
- [FIELDS.md](./FIELDS.md) - All field types
- [STICKY_FOOTER.md](./STICKY_FOOTER.md) - Form actions

### Tables & Lists
- [TABLES.md](./TABLES.md) - Table patterns
- [LARGE_DATA.md](./LARGE_DATA.md) - Pagination & virtualization
- [PATTERNS.md](./PATTERNS.md) - List patterns

### Overlays
- [DRAWERS.md](./DRAWERS.md) - Drawer patterns
- [PATTERNS.md](./PATTERNS.md) - Modal patterns

### Status & Indicators
- [PATTERNS.md](./PATTERNS.md) - Status badges, progress indicators
- [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md) - Clinical alerts

---

## 📊 Documentation Statistics

**Total Files**: 16 documents  
**Total Size**: ~210KB  
**Estimated Read Time**: 3-4 hours (complete)  
**Quick Start Time**: 15 minutes (QUICK_REFERENCE + SCREEN_GENERATION)

### Documentation Coverage

#### Core Concepts
- ✅ Architecture (6-layer system)
- ✅ Design tokens (foundation + semantic)
- ✅ Performance rules
- ✅ Accessibility (WCAG 2.1 AA)

#### Components
- ✅ 60+ UI components defined
- ✅ 13 field types documented
- ✅ 27+ page shells
- ✅ 16 healthcare components

#### Patterns
- ✅ 30+ UI patterns
- ✅ 20+ healthcare patterns
- ✅ 7 route patterns
- ✅ 10 card types

#### Guidelines
- ✅ Screen generation rules
- ✅ Performance optimization
- ✅ Data loading strategies
- ✅ Migration preparation
- ✅ Consistency enforcement

---

## 🎯 Learning Paths

### Path 1: Quick Start (30 min)
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 5 min
2. [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - 15 min
3. [README.md](./README.md) - 10 min
**Outcome**: Can build basic screens

### Path 2: Component Developer (2 hours)
1. Quick Start (30 min)
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - 20 min
3. [COMPONENTS.md](./COMPONENTS.md) - 15 min
4. [FIELDS.md](./FIELDS.md) - 20 min
5. [FORMS.md](./FORMS.md) - 20 min
6. [PATTERNS.md](./PATTERNS.md) - 30 min
**Outcome**: Can build complex components

### Path 3: Performance Expert (1.5 hours)
1. Quick Start (30 min)
2. [PERFORMANCE.md](./PERFORMANCE.md) - 20 min
3. [LARGE_DATA.md](./LARGE_DATA.md) - 25 min
4. [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Performance sections (15 min)
**Outcome**: Can optimize any screen

### Path 4: System Architect (3 hours)
1. [README.md](./README.md) - 15 min
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - 30 min
3. [MIGRATION.md](./MIGRATION.md) - 25 min
4. [ROUTING.md](./ROUTING.md) - 20 min
5. [REUSABILITY.md](./REUSABILITY.md) - 20 min
6. [PERFORMANCE.md](./PERFORMANCE.md) - 20 min
7. [LARGE_DATA.md](./LARGE_DATA.md) - 25 min
8. [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - 25 min
**Outcome**: Can design system architecture

### Path 5: Healthcare Specialist (2 hours)
1. Quick Start (30 min)
2. [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md) - 30 min
3. [FOCUS_MODE.md](./FOCUS_MODE.md) - 20 min
4. [PATTERNS.md](./PATTERNS.md) - Healthcare sections (20 min)
5. [SCREEN_GENERATION.md](./SCREEN_GENERATION.md) - Healthcare examples (20 min)
**Outcome**: Can build clinical workflows

---

## 🔍 Quick Lookup

### "Where do I find...?"

**Semantic tokens** → [semantic/tokens.ts](./semantic/tokens.ts)  
**Foundation tokens** → [foundations/tokens.ts](./foundations/tokens.ts)  
**Button component** → [COMPONENTS.md](./COMPONENTS.md)  
**Input field** → [FIELDS.md](./FIELDS.md)  
**Form validation** → [FORMS.md](./FORMS.md)  
**Table sorting** → [TABLES.md](./TABLES.md)  
**Pagination** → [LARGE_DATA.md](./LARGE_DATA.md)  
**Virtual scrolling** → [LARGE_DATA.md](./LARGE_DATA.md)  
**Drawer pattern** → [DRAWERS.md](./DRAWERS.md)  
**Status badge** → [PATTERNS.md](./PATTERNS.md)  
**Card patterns** → [PATTERNS.md](./PATTERNS.md)  
**Page shells** → [SCREEN_GENERATION.md](./SCREEN_GENERATION.md)  
**Route patterns** → [ROUTING.md](./ROUTING.md)  
**Focus mode** → [FOCUS_MODE.md](./FOCUS_MODE.md)  
**Patient header** → [HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md)  
**Data gateway** → [MIGRATION.md](./MIGRATION.md)  
**Memoization** → [PERFORMANCE.md](./PERFORMANCE.md)  
**Lazy loading** → [LARGE_DATA.md](./LARGE_DATA.md)  
**Accessibility** → [PATTERNS.md](./PATTERNS.md)  

---

## 📝 Documentation Maintenance

### Update Frequency
- **Foundation tokens**: Rarely (design system changes)
- **Semantic tokens**: Occasionally (new use cases)
- **Component docs**: As needed (new components)
- **Pattern docs**: Regularly (new patterns discovered)
- **Screen generation**: Occasionally (new rules)

### Version Control
Current version: **1.0.0**  
Last updated: **March 11, 2026**  
Next review: **June 2026**

---

**Navigation**: [Back to README](./README.md)
