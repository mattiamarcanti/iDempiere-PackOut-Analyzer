# Detail View

The Detail View is a full-screen overlay that shows all XML field values for a specific PackOut element.

## How to Open

- From the **Analysis page**: Click the **info icon** (circle with "i") on any element card
- From the **Grouping page**: Click the **info icon** next to any child or orphan element

## Layout

### Toolbar
- **Title**: Shows the element's tag name and name (e.g., `AD_Column - MyColumn`)
- **Close button** (X icon)

### Field Table

A three-column table with sticky headers:

| Column | Description |
|---|---|
| **Campo** (Field) | The XML field name, displayed in monospace (e.g., `AD_Table_UU`, `Name`, `SeqNo`) |
| **Valore** (Value) | The field's text content. UUID values are color-coded (green/red) |
| **Riferimento** (Reference) | Shows the reference type badge (`uuid` or `id`) and reference key, if present |

### UUID Values in the Table

- **Green UUID**: Present in the PackOut - clickable to close the detail (and hierarchy if open) and navigate to that element's card
- **Red UUID**: Not in the PackOut - displayed as red text, not clickable

## Notes

- Translation sub-elements (`*_Trl` tags) are excluded from the field list to keep it clean
- Fields with empty values show a dash (`-`)
- The table header row stays sticky at the top when scrolling through many fields
- Press **Escape** to close the detail overlay
- If opened from the Grouping page, closing the detail returns to the grouping view (body scroll is only restored when both overlays are closed)
