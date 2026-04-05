# Analysis Page

The Analysis page is the main view displayed after clicking **"Analizza"**. It shows all PackOut elements as individual cards.

## How It Works

1. The ZIP file is read with JSZip
2. The XML dictionary is found at `<zipName>/dict/*.xml`
3. The XML is parsed with `DOMParser`
4. Two passes over all `[type="table"]` elements:
   - **First pass**: Collects all UUIDs into `cardUuArray` for cross-referencing
   - **Second pass**: Builds a card for each element

## Card Anatomy

Each card contains:

### Header Row
- **Tag Name** (e.g., `AD_Table`, `AD_Column`) - bold, white
- **Element Name** (e.g., `MyTable`) - secondary color
- **"Tradotto" Badge** - shown if the element has `*_Trl` sub-tags (translations)
- **UUID** (shown in collapsed mode) - monospace, dimmed
- **Detail Button** (info icon) - opens the [[Detail View]]
- **Collapse Button** (chevron) - toggles card content visibility

### Content Area
- **UUID Subtitle** - full UUID displayed in monospace
- **Reference Blocks** - one per reference field, each containing:
  - Field name and reference type badge (`uuid` in purple, `id` in blue)
  - Generated SQL query in a monospace box
  - Copy-to-clipboard button

## UUID Color Coding

When a reference is of type `uuid`:
- **Green** (`uuid-in-list`): The referenced UUID exists in the PackOut. Clicking it scrolls to that element's card with a highlight animation.
- **Red** (`uuid-not-in-list`): The referenced UUID is not in the PackOut - this is an external dependency that must already exist on the target system.

## SQL Query Format

For `id` references:
```sql
SELECT * FROM AD_Table WHERE AD_Table_ID = 123;
```

For `uuid` references:
```sql
SELECT * FROM AD_Table WHERE AD_Table_UU = 'abc-def-ghi';
```

## Search

The search bar filters cards by:
- Element name
- Translation names (from `*_Trl` sub-tags)
- UUID

Matching is case-insensitive and checks if the search term is contained anywhere in the combined text.

## Type Filter

The multi-select dropdown lists all element types found in the PackOut (e.g., `AD_Table`, `AD_Column`, `AD_Window`). You can:
- Check/uncheck individual types
- Use "Tutti" (All) to select or deselect all types at once

## Collapse/Expand All

The toggle button in the toolbar collapses or expands all currently visible cards. The icon changes to reflect the current state.
