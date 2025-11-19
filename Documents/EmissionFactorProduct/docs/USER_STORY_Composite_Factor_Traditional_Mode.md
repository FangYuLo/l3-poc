# User Story: Creating Custom Composite Factor (Traditional Mode)

**Document Version:** 1.0
**Last Updated:** 2025-10-28
**Status:** 📝 Draft

---

## User Story 1: Creating First Composite Factor

**As a** Carbon Accounting Specialist
**I want to** create a custom composite emission factor by combining multiple base factors
**So that** I can accurately represent complex emission scenarios specific to my organization

---

### AC 1: Access Composite Editor

**Given** the user is in the User-defined factors section
**When** they click the "Create Composite Factor" button
**Then** the system opens the composite editor drawer with an empty placeholder

**Detailed Requirements:**
- "Create Composite Factor" button is visible in the top-right corner of the factor list
- Button displays with a [+] icon and text "Create Composite Factor"
- Clicking the button opens a drawer from the right side with a 300ms slide animation
- Drawer width is 800px on desktop, 90vw on tablet, 100vw on mobile
- Drawer displays the title "Create Composite Factor" at the top
- All form fields are empty or set to default values
- Factor Name input field is automatically focused
- Close button (×) is visible in the top-right corner of the drawer

---

### AC 2: Enter Basic Information

**Given** the composite editor drawer is open
**When** the user enters the factor name, description, and selects region/date
**Then** the system validates the input in real-time and provides feedback

**Detailed Requirements:**

**2.1 Factor Name:**
- Input field labeled "Factor Name" with red asterisk (required)
- Placeholder text: "e.g., Steel Product Lifecycle"
- Min length: 3 characters, Max length: 100 characters
- Real-time uniqueness check with 300ms debounce
- Visual feedback:
  - ✓ Green checkmark when name is valid and unique
  - ❌ Red error message "Name already exists" if duplicate
  - ❌ Red error message "Name must be at least 3 characters" if too short
- Character count not shown (only length validation)

**2.2 Description:**
- Textarea field labeled "Description" (optional)
- Placeholder text: "Describe the purpose and composition of this factor..."
- Auto-expanding textarea (max height: 120px)
- Max length: 500 characters
- Character counter displays: "X/500 characters"
- Multi-line input allowed

**2.3 Region/Country:**
- Dropdown field labeled "Region/Country" (optional)
- Placeholder: "Select region..."
- Options: 台灣, 美國, 英國, 中國, 日本, 歐盟, 全球, 國際
- Single selection only
- Can be left unselected (shows "—" when saved)

**2.4 Enabled Date:**
- Date picker field labeled "Enabled Date" (optional)
- Default value: Today's date (current date)
- Date range: 1900-01-01 to 2100-12-31
- Calendar picker UI for easy selection
- Format: YYYY-MM-DD
- Can set past or future dates

---

### AC 3: Configure Calculation Settings

**Given** basic information has been entered
**When** the user selects the result unit and calculation method
**Then** the system configures the calculation framework and updates the preview accordingly

**Detailed Requirements:**

**3.1 Result Unit Selection:**
- Two-tier dropdown system:
  - **First dropdown:** Unit category
    - Options: Mass, Energy, Volume, Distance, Time, etc.
    - Labeled "Unit Category"
  - **Second dropdown:** Specific unit (filtered by selected category)
    - Options depend on category selection
    - Example for Mass: kg, g, ton, lb
    - Labeled "Specific Unit"
- Result format: "kg CO₂e/{selected_unit}"
- Default: "kg CO₂e/kg"
- Changing unit triggers re-validation of all components for compatibility

**3.2 Calculation Method:**
- Radio button group labeled "Calculation Method"
- Two options displayed horizontally:
  - **Weighted Average:**
    - Label: "Weighted Average"
    - Description: "Weights must sum to 1.0"
    - Icon: ∑w=1.0
  - **Weighted Sum:**
    - Label: "Weighted Sum"
    - Description: "Weights can be any positive value"
    - Icon: ∑(value × weight)
- Default selection: "Weighted Sum"
- Changing method shows confirmation if components already exist:
  - Modal: "⚠️ Switching calculation method will require weight revalidation. Continue?"
  - Buttons: [Cancel] [Continue]

---

### AC 4: Add Component Factors

**Given** calculation settings are configured
**When** the user clicks "Add Factor" and selects emission factors
**Then** the system adds the selected factors to the component list with equal weight distribution

**Detailed Requirements:**

**4.1 Open Factor Selection Modal:**
- Button labeled "+ Add Factor" is prominently displayed
- Button is always enabled (can add up to 50 components)
- Clicking opens a modal dialog within 200ms
- Modal title: "Add Emission Factors"
- Modal size: 900px width (desktop), 95vw (mobile), 80vh max height

**4.2 Factor Search and Selection:**
- Search input at the top with placeholder "Search factors..."
- Search is real-time with 300ms debounce
- Results display in a scrollable list
- Each factor card shows:
  - Factor name (bold)
  - Emission value + unit
  - Source database + region
  - Checkbox for selection
- Source tabs: "Central" and "Cedars" with factor counts
- Filter dropdowns: Unit category, Region
- Selected factors appear in a preview panel on the right
- Preview panel title: "Selected (N)" where N = count

**4.3 Add Selected Factors:**
- Button text: "Add Selected Factors (N)" where N = selected count
- Button disabled if 0 factors selected (gray)
- Button enabled if ≥1 factors selected (blue)
- Clicking the button:
  - Closes the modal with fade animation (200ms)
  - Adds factors to the component list
  - Displays toast: "N factors added successfully" (3 seconds)
- Maximum 50 factors can be added total

**4.4 Component List Display:**
- Each component displays as a card with:
  - Drag handle (≡) on the left for reordering
  - Factor name and details
  - Emission value + unit
  - Source database + region
  - Unit compatibility status indicator
  - Weight input field
  - Remove button (×) on the right
- Components appear in the order they were added
- Each component is draggable for reordering

**4.5 Auto-Weight Distribution:**
- Weights are automatically distributed equally among all components:
  - 2 components: [0.500, 0.500]
  - 3 components: [0.333, 0.333, 0.334]
  - 4 components: [0.250, 0.250, 0.250, 0.250]
- Last component receives rounding adjustment to ensure exact sum = 1.0
- Formula: weight = 1.0 / total_components (rounded to 3 decimal places)

**4.6 Unit Compatibility Check:**
- System automatically checks each component's unit against the result unit
- Status indicators:
  - **✓ Compatible:** Green checkmark "Unit Compatible" (units match exactly)
  - **⚠️ Auto-convertible:** Orange warning "Auto-convert: L → mL" (same category)
  - **⚠️ Custom required:** Red warning "Custom conversion required" (different category)
- Warning banner displays if any conversions needed:
  - Text: "⚠️ N factors need unit conversion"
  - Action button: "Review Conversions"
  - Orange background (#FEF0C7)

**4.7 Empty State:**
- Before adding first factor, displays:
  - Icon: 📊
  - Text: "No factors added yet"
  - Subtext: "Add at least 2 emission factors to create a composite."
  - CTA button: "+ Add Your First Factor"
- Empty state disappears once first factor is added

---

### AC 5: Set Component Weights

**Given** component factors have been added to the list
**When** the user adjusts weight values
**Then** the system validates the weights and updates the calculation preview in real-time

**Detailed Requirements:**

**5.1 Weight Input Field:**
- Numeric input field for each component
- Input specifications:
  - Type: number
  - Input mode: decimal
  - Width: 80px
  - Text alignment: right
  - Font: monospace (for number alignment)
  - Decimal places: 3 (auto-rounds on blur)
- Stepper controls [↑] [↓]:
  - Increment/decrement by 0.1
  - Visible on hover or always visible on mobile
  - Disabled at min/max boundaries
- Keyboard support:
  - Up/Down arrow keys increment/decrement
  - Tab to move to next weight field
  - Enter to apply and move to next

**5.2 Weight Validation:**
- **Weighted Average mode:**
  - Min: 0.001, Max: 1.0
  - Sum constraint: Σ(weights) = 1.0 ± 0.001
  - Error if out of range or invalid sum
- **Weighted Sum mode:**
  - Min: 0.001, Max: 999.999
  - No sum constraint
- Real-time validation on blur or value change
- Invalid values show red border and error message below field

**5.3 Weight Sum Indicator:**
- Fixed banner above component list (always visible, sticky)
- Layout: "Weight Sum: {value} {icon} [Action]"
- Display precision: 3 decimal places
- Updates immediately on any weight change (no debounce)

**5.4 Color-Coded Status (Weighted Average Mode):**
- **Green (#12B76A):** Sum = 1.000 ± 0.001
  - Icon: ✓
  - Message: "Weight Sum: 1.000 ✓"
  - No action needed
- **Yellow (#F79009):** Sum between 0.99-0.999 or 1.001-1.01
  - Icon: ⚠️
  - Message: "Weight Sum: {value} (Close to 1.0)"
  - Action: [Auto-normalize] button visible
- **Red (#F04438):** Sum < 0.99 or > 1.01
  - Icon: ❌
  - Message: "Weight Sum: {value} (Must equal 1.0)"
  - Action: [Auto-normalize] button visible
  - Save button disabled

**5.5 Weighted Sum Mode Indicator:**
- Color: Blue (#2E90FA)
- Icon: ℹ️
- Message: "Weight Sum: {value} (No constraint)"
- Any sum value accepted
- No auto-normalize option

**5.6 Auto-Normalize Feature:**
- Button appears when sum ≠ 1.0 in Weighted Average mode
- Button text: "Auto-normalize"
- Clicking:
  - Recalculates all weights proportionally: new_weight = old_weight / current_sum
  - Animates weights to new values (300ms smooth transition)
  - Updates sum indicator to green (1.000 ✓)
  - Shows toast: "Weights normalized to 1.0"
- Example:
  - Before: [0.6, 0.5, 0.2] → Sum: 1.3
  - After: [0.462, 0.385, 0.154] → Sum: 1.001 ✓

---

### AC 6: Apply Unit Conversions (If Needed)

**Given** some component factors have incompatible units
**When** the user applies unit conversions
**Then** the system converts values and updates the calculation

**Detailed Requirements:**

**6.1 Auto-Conversion (Same Category Units):**
- Applicable when component unit is in same category as result unit
- Example: L → mL, kg → g, km → m
- Click "⚠️ Auto-convert" indicator to expand conversion panel
- Panel displays:
  - System conversion formula: "1 L = 1000 mL"
  - Converted value preview: "0.00015 kg CO₂e/mL"
  - [Apply Conversion] [Cancel] buttons
- Clicking "Apply Conversion":
  - Updates component value
  - Changes status to ✓ "Converted (Auto)"
  - Collapses panel
  - Recalculates preview

**6.2 Custom Conversion (Different Category Units):**
- Required when component unit is different category from result unit
- Example: km → kg, kWh → kg, L → kg
- Click "⚠️ Custom conversion required" to expand conversion panel
- Panel displays:
  - From unit: {component_unit}
  - To unit: {result_unit}
  - Conversion ratio input: "1 {from_unit} = [____] {to_unit}"
  - Explanation textarea (optional but recommended, 500 chars max)
  - Converted value preview (updates in real-time as user types)
  - Formula display: "{original_value} × {ratio} = {converted_value}"
  - [Apply Conversion] [Cancel] buttons

**6.3 Conversion Validation:**
- Ratio must be > 0 and < 1,000,000
- Warning (not error) if ratio > 1000 or < 0.001 (likely user error)
- Explanation recommended for audit trail (shows warning if empty)
- Preview updates with 100ms debounce as user types ratio

**6.4 Conversion Applied Status:**
- Status changes to ✓ "Converted (Custom)" with blue text
- Conversion badge: "🔄" displayed next to factor name
- Badge is clickable to re-open conversion panel and modify
- Converted value used in all calculations
- Original value preserved in metadata

---

### AC 7: Handle Multi-Gas Factors (If Applicable)

**Given** a selected factor contains multiple greenhouse gases (CO₂, CH₄, N₂O)
**When** the user adds the factor
**Then** the system automatically opens the GWP conversion modal

**Detailed Requirements:**

**7.1 Multi-Gas Detection:**
- System detects if factor has separate values for CO₂, CH₄, N₂O
- Multi-gas factors show 🌡️ badge in factor selection modal
- Adding a multi-gas factor triggers GWP conversion before adding to list

**7.2 GWP Conversion Modal:**
- Modal title: "GWP Conversion Required"
- Displays original gas values:
  - CO₂: {value} kg
  - CH₄: {value} kg
  - N₂O: {value} kg
- GWP version selector (radio buttons):
  - ○ AR4 (2007): CH₄=25, N₂O=298
  - ● AR5 (2013): CH₄=28, N₂O=265 (Recommended, pre-selected)
  - ○ AR6 (2021): CH₄=27.9, N₂O=273
- Real-time calculation preview:
  - Formula: CO₂ + (CH₄ × GWP_CH₄) + (N₂O × GWP_N₂O)
  - Result: {value} kg CO₂e/{unit}
  - Precision: 3 decimal places
- Buttons: [Cancel] [Confirm Conversion]

**7.3 GWP Conversion Applied:**
- Clicking "Confirm Conversion":
  - Closes modal
  - Adds factor to component list
  - Displays 🌡️ badge with GWP version (e.g., "🌡️ AR5")
  - Badge is clickable to re-open modal and change GWP version
- Converted CO₂e value used in calculations
- GWP metadata saved with component:
  - GWP version used
  - Original gas values
  - Conversion formula
  - Timestamp

---

### AC 8: Review Calculation Preview

**Given** components and weights have been configured
**When** the calculation preview updates
**Then** the system displays the formula, result, and conversion summary

**Detailed Requirements:**

**8.1 Preview Panel Location:**
- Fixed panel at bottom of drawer (always visible, doesn't scroll)
- Background: Light gray (#F9FAFB)
- Border: Top border only (1px solid #E5E7EB)
- Padding: 16px
- Height: Auto (min 120px)

**8.2 Preview Content:**
- **Section 1: Calculation Method**
  - Label: "Calculation Method:"
  - Value: "Weighted Sum" or "Weighted Average"
  - Font: 14px, medium weight

- **Section 2: Component Count**
  - Label: "Component Count:"
  - Value: "{N} factors"
  - Updates when factors added/removed

- **Section 3: Formula Display**
  - Label: "Formula:"
  - **Weighted Sum formula:**
    ```
    (value1 × weight1) + (value2 × weight2) + (value3 × weight3)
    = term1 + term2 + term3
    ```
  - **Weighted Average formula:**
    ```
    [(value1 × weight1) + (value2 × weight2)] / (weight1 + weight2)
    = [term1 + term2] / sum_weights
    ```
  - Converted values shown in blue text
  - Full precision in intermediate steps
  - Collapsible if formula is too long (>5 components)

- **Section 4: Result**
  - Large, bold display (20px font)
  - Format: "Result: {value} {unit}"
  - Example: "Result: 1.3260 kg CO₂e/kg"
  - Precision: 4 decimal places
  - Unit matches selected result unit

- **Section 5: Conversion Summary**
  - Text: "Conversions Applied: ✓ {n} Auto, {m} Custom"
  - Shows count of applied conversions
  - Color-coded: Green for applied, Orange if pending
  - Clickable to expand details

**8.3 Update Triggers:**
- Preview recalculates when:
  - Component added or removed
  - Weight value changed (300ms debounce)
  - Calculation method changed
  - Unit conversion applied
  - GWP conversion applied
  - Component order changed (for display purposes)

**8.4 Performance:**
- Target calculation time: <50ms
- Show spinner if calculation takes >100ms
- Use Web Workers for >20 components (performance optimization)

---

### AC 9: Manage Components (Optional Operations)

**Given** components are in the list
**When** the user reorders or removes components
**Then** the system updates the list and recalculates accordingly

**Detailed Requirements:**

**9.1 Drag-and-Drop Reordering:**
- Drag handle (≡) on left side of each component card
- Cursor changes to "grab" on hover over handle
- Visual feedback:
  - Hover: Blue drag handle
  - Dragging: 50% opacity, elevated shadow
  - Drop zone: Dashed border, blue highlight
- Only vertical dragging (up/down)
- Smooth animation on drop (200ms ease-out)
- Order changes reflected immediately in formula preview
- Keyboard alternative: Alt+↑ (move up), Alt+↓ (move down)

**9.2 Remove Component:**
- Remove button (×) on right side of each component
- Button visible on hover (desktop) or always visible (mobile)
- Clicking remove:
  - No confirmation dialog (quick workflow)
  - Component fades out (200ms animation)
  - Component removed from list
  - Weights NOT auto-redistributed
  - Toast appears: "'{name}' removed [Undo]" (5 seconds)
- Cannot remove if only 2 components remain (minimum)
  - Remove button disabled
  - Tooltip: "Cannot remove. Minimum 2 factors required."
- Undo functionality:
  - Click [Undo] in toast to restore component
  - Component restored to original position
  - After 5 seconds, undo unavailable

---

### AC 10: Save Composite Factor

**Given** all required fields are filled and validations pass
**When** the user clicks "Save & Close" or "Save Draft"
**Then** the system creates version 1.0 and displays the factor in the list

**Detailed Requirements:**

**10.1 Pre-Save Validation:**
- **Name validation:**
  - Required: Yes
  - Min length: 3 characters
  - Max length: 100 characters
  - Must be unique (case-insensitive)
  - Error messages displayed if invalid

- **Component validation:**
  - Min components: 2
  - Max components: 50
  - Error: "Composite must have at least 2 factors"

- **Weight validation (Weighted Average):**
  - Sum must equal 1.0 ± 0.001
  - Error: "Weight sum must equal 1.0 (currently {sum})"
  - Save button disabled until fixed

- **Weight validation (Weighted Sum):**
  - All weights: 0.001 ≤ weight ≤ 999.999
  - Error: "Weight must be between 0.001 and 999.999"

- **Unit conversion check:**
  - Warning (not error) if conversions pending
  - Modal: "⚠️ N factors have incompatible units. Continue anyway?"
  - User can acknowledge and proceed

**10.2 Save Button Options:**
- **"Save & Close" button:**
  - Primary action (blue)
  - Saves and closes drawer
  - Located bottom-right
- **"Save Draft" button:**
  - Secondary action (gray outline)
  - Saves but keeps drawer open
  - Allows continued editing

**10.3 Save Operation:**
- Button shows loading state: "Saving..." with spinner
- API request: POST /api/composite-factors
- Request body includes:
  - All basic information (name, description, region, date)
  - Calculation settings (unit, method)
  - All components with weights
  - Conversion metadata
  - GWP conversion data (if applicable)
- Timeout: 10 seconds

**10.4 Version 1.0 Creation:**
- System creates initial version:
  - Version number: "1.0"
  - Status: "active"
  - Created by: Current user ID
  - Created at: ISO 8601 timestamp
  - Computed value: Final calculated result
- All component data preserved
- Conversion metadata stored
- Audit log entry created

**10.5 Success Feedback:**
- Success toast displays:
  - Message: "Composite factor '{name}' created (v1.0)"
  - Icon: ✓ (green checkmark)
  - Duration: 5 seconds
  - Action link: [View Details →]
- If "Save & Close":
  - Drawer closes with slide animation (300ms)
  - Focus returns to factor list
- If "Save Draft":
  - Drawer remains open
  - Title changes to "Edit Composite Factor"
  - Version indicator: "Currently editing v1.0"
  - Can continue editing

**10.6 Factor List Update:**
- List automatically refreshes
- New factor appears at top of list
- Factor card displays:
  - Name (bold)
  - Description (truncated to 2 lines)
  - Computed result value + unit (large, monospace)
  - Region badge (if set)
  - Component count: "N components"
  - Created timestamp: "Just now"
  - Version badge: "v1.0"
  - "NEW" badge (green, fades after 10 seconds)
  - Blue highlight border (fades after 3 seconds)
- Factor is immediately usable in calculations

**10.7 Error Handling:**
- **Network errors:**
  - Timeout: "Request timed out. Please try again."
  - Offline: "You're offline. Changes saved locally."
  - Server error: "Server error. Please try again."
  - Retry button available
- **Validation errors:**
  - Duplicate name: "A factor with this name already exists"
  - Invalid data: Highlights problematic fields
  - Scroll to first error
- **Concurrent conflicts:**
  - Rare, but handled if name taken between validation and save
  - Error message with suggested alternative names

---

## Success Metrics

**Efficiency:**
- Time to create first composite: <3 minutes
- Number of clicks: 12-15 clicks
- Error rate: <5%

**User Satisfaction:**
- Task completion rate: >95%
- User satisfaction score: >4/5
- Support tickets related to composite creation: <2 per week

**System Performance:**
- Drawer open time: <300ms
- Factor search response: <100ms
- Calculation preview update: <100ms
- Save operation: <2 seconds

---

## Edge Cases and Special Scenarios

### Edge Case 1: Adding Duplicate Factor
**Given** a factor is already in the component list
**When** the user tries to add the same factor again
**Then** the factor is greyed out in the selection modal with tooltip "Already added"

### Edge Case 2: Maximum Components Reached
**Given** 50 components are already added (maximum)
**When** the user tries to add more factors
**Then** the "Add Factor" button is disabled with tooltip "Maximum 50 components reached"

### Edge Case 3: Network Failure During Save
**Given** the user clicks "Save" but network connection is lost
**When** the save operation fails
**Then** the system saves data locally and shows "Saved locally. Will sync when online."

### Edge Case 4: Browser Closed with Unsaved Changes
**Given** the user has unsaved changes in the editor
**When** they try to close the browser tab or navigate away
**Then** a browser confirmation dialog appears: "You have unsaved changes. Leave anyway?"

### Edge Case 5: Very Long Factor Names
**Given** component factors have very long names
**When** they are displayed in the component list
**Then** names are truncated with ellipsis "..." and full name shown on hover tooltip

---

## Accessibility Requirements

**Keyboard Navigation:**
- Tab: Move to next field
- Shift+Tab: Move to previous field
- Enter: Submit form / Apply action
- Escape: Close drawer / Cancel dialog
- Arrow keys: Navigate dropdowns, adjust numeric inputs
- Alt+↑/↓: Reorder components (alternative to drag-drop)

**Screen Reader Support:**
- All interactive elements have proper ARIA labels
- Form validation errors announced to screen readers
- Loading states announced: "Loading factors..."
- Success/error messages announced
- Component count announced when list changes

**Visual Accessibility:**
- Color contrast meets WCAG 2.1 AA (4.5:1 minimum)
- Focus indicators visible on all interactive elements
- Error states not indicated by color alone (also icons and text)
- Font size minimum 14px for body text
- Sufficient spacing between interactive elements (min 8px)

---

**Document End**
