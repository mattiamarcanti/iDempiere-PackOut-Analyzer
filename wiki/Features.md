# Features

## Analysis Page

- **ZIP Upload & XML Parsing**: Upload a PackOut `.zip` and the tool extracts and parses the XML dictionary automatically
- **Element Cards**: Each `type="table"` element is displayed as a collapsible card showing its tag name, name, UUID, and all references
- **SQL Query Generation**: For each reference field, the tool generates a ready-to-use `SELECT` query (for both `id` and `uuid` reference types)
- **Copy to Clipboard**: One-click copy button for each generated query
- **UUID Color Coding**:
  - **Green**: UUID exists in the PackOut (internal reference) - clickable to navigate to that card
  - **Red**: UUID is not in the PackOut (external dependency)
- **Translation Badge**: Elements with `*_Trl` sub-tags display a "Tradotto" (Translated) badge
- **Detail View**: Info button on each card opens a full-screen overlay showing all XML field values

## Search & Filters

- **Name Search**: Filter cards by element name, translation names, or UUID
- **Multi-Select Type Filter**: Filter by element type (AD_Table, AD_Column, etc.) with select/deselect all
- **Result Counter**: Shows visible/total element count
- **Collapse/Expand All**: Single toggle button to collapse or expand all visible cards

## Grouping Page

- **Parent-Child Hierarchy**: Groups elements under their parent based on known iDempiere relationships
- **Multi-Level Support**: Handles relationships like AD_Table > AD_Column, AD_Window > AD_Tab > AD_Field
- **Reference Resolution**: Resolves parents via UUID references first, then falls back to ID references
- **AD_Menu Special Case**: AD_Menu shows its referenced AD_Window or AD_Process as children (reverse FK)
- **External Dependencies**: External parents (not in PackOut) are marked with a red dot and show `ID ...` or `UU ...`
- **Orphan Elements**: Elements without a known parent are shown in standalone cards
- **Sorted Output**: Cards sorted by parent type, then parent name; children sorted by type, then name

## General

- **Dark Theme**: Modern dark UI built on Bootstrap 5.3.2 with custom CSS
- **Fully Client-Side**: No backend, no data leaves the browser
- **Responsive**: Adapts to mobile and desktop layouts
- **Keyboard Navigation**: Press `Escape` to close overlays
