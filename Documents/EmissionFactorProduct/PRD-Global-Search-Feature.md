# Product Requirements Document: Global Emission Factor Search

## Overview
The Global Emission Factor Search feature enables users to search, filter, and discover emission factors across the entire database through a centralized modal interface.

## Core Features

### 1. Search Interface
- **Modal Design**: Popup modal (6xl size, 95vw width) accessible via toolbar button
- **Search Input**: Text-based search with real-time filtering
- **Collapsible Filters**: Toggle-able advanced filter panel with settings button

### 2. Search Functionality
**Text Search** across multiple fields:
- Factor name
- Unit
- Region
- Source reference

**Advanced Filters**:
- **Region**: Multi-select checkbox filter
- **Year**: Multi-select year filter (sorted descending)
- **Unit**: Multi-select unit filter
- **Method**: Multi-select GWP methodology filter
- **Source Type**: Multi-select source classification filter
  - Standard Database (標準資料庫)
  - PACT Exchange (PACT交換)
  - Supplier Factors (供應商係數)
  - User Defined (自建係數)

### 3. Results Display
**Table Layout**:
- Fixed layout with percentage-based column widths
- Responsive design preventing overflow
- Sticky header for scrollable content

**Columns**:
- Name (30%): Factor name with text wrapping
- Value (12%): Numeric emission factor value
- Unit (12%): Measurement unit
- Year (8%): Publication/validity year
- Region (12%): Geographic region
- Source (12%): Source type badge with color coding
- Actions (14%): Dropdown menu for operations

**Pagination**:
- Configurable page size (10, 20, 50 items)
- Navigation controls with page indicators
- Result count display

### 4. User Actions

**Per-Factor Actions** (via dropdown menu):
- Add to Favorites
- Add to Project
- Add to Composite Factor
- View Details

**Bulk Operations**:
- Clear all filters
- Export results (future enhancement)

### 5. Operational Modes

**Search Mode** (default):
- General factor discovery
- Full action menu available

**Dataset Addition Mode**:
- Contextual mode for adding factors to specific datasets
- Simplified action menu focused on dataset addition
- Auto-close after selection

## Data Structure

### SearchResult Interface
```typescript
interface SearchResult {
  id: number
  type: 'emission_factor' | 'composite_factor'
  name: string
  value: number
  unit: string
  year?: number
  region?: string
  method_gwp?: string
  source_type: string
  source_ref?: string
  version: string
}
```

### Source Type Classifications
- `standard`: Standard Database factors
- `pact`: PACT Exchange factors
- `supplier`: Supplier-provided factors
- `user_defined`: User-created factors

## Technical Implementation

### State Management
- React hooks for local state management
- Memoized filter options generation
- Real-time search with debouncing (implicit)
- Pagination state management

### Performance Optimizations
- Virtualization for large result sets (future)
- Memoized filter computations
- Fixed table layout for consistent rendering
- Sticky headers for improved UX

### Integration Points
- Data service integration via `useMockData` hook
- Modal system integration with Chakra UI
- Action callbacks for external operations
- Composite factor editor integration

## User Experience

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- Proper ARIA labels and roles
- Focus management

### Responsive Design
- Modal adapts to viewport size
- Table scrolling on overflow
- Collapsible filter panel on mobile
- Touch-friendly controls

### Visual Design
- Consistent with system design language
- Color-coded source type badges
- Clear visual hierarchy
- Hover states and interactions

## Future Enhancements
1. Advanced search operators (AND, OR, NOT)
2. Saved search queries
3. Bulk factor operations
4. Export functionality
5. Search result sorting options
6. Factor comparison features
7. Search analytics and usage tracking

## Success Metrics
- Search query performance (<500ms response)
- User adoption rate
- Filter usage patterns
- Factor discovery success rate
- Modal conversion rate (search to action)