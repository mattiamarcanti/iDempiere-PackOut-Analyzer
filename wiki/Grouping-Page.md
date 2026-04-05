# Grouping Page

The Grouping page is displayed when clicking **"Raggruppa"** (Group). It shows all PackOut elements organized under their parent element, based on known iDempiere relationships.

## Parent-Child Relationships

### Standard Relationships (child references parent via FK)

| Child | Parent |
|---|---|
| `AD_Column` | `AD_Table` |
| `AD_Field` | `AD_Tab` |
| `AD_Tab` | `AD_Window` |
| `AD_IndexColumn` | `AD_Column` |
| `AD_TableIndex` | `AD_Table` |
| `AD_InfoColumn` | `AD_InfoWindow` |
| `AD_InfoProcess` | `AD_InfoWindow` |
| `AD_Ref_List` / `AD_Reference_List` | `AD_Reference` |
| `AD_Ref_Table` | `AD_Reference` |
| `AD_Process_Para` / `AD_Process_Param` | `AD_Process` |

### Reverse Relationship (parent references child)

| Parent | Child (whichever field is populated) |
|---|---|
| `AD_Menu` | `AD_Window` or `AD_Process` |

For `AD_Menu`, the parent holds the foreign key to the child (e.g., `AD_Window_UU` or `AD_Process_ID`), not the other way around. If an `AD_Menu` in the PackOut has the `AD_Window` field populated, then that `AD_Window` is shown as a child of the menu. If `AD_Process` is populated instead, `AD_Process` is shown as the child.

## How Parent Resolution Works

For each child element in the PackOut:

1. **UUID resolution (priority)**: Scan the element's fields for `reference="uuid"` attributes. If the UUID value points to an element in the PackOut of the expected parent type, it is resolved directly. If the field name matches the parent type but the element is not in the PackOut, it's marked as an **external parent with UU**.

2. **ID resolution (fallback)**: If no UUID match is found, scan for `reference="id"` attributes whose field name matches the expected parent type. If the ID value maps to a PackOut element, it is resolved. Otherwise, it's marked as an **external parent with ID**.

## Card Structure

### Parent Card
- **Status dot**: Green = parent is in the PackOut; Red = external dependency
- **Parent type tag** (e.g., `AD_Table`)
- **Parent name** - clickable for internal parents (navigates to its analysis card)

### Child Rows (under the parent card)
- **Child type tag** (e.g., `AD_Column`)
- **Child name** - clickable (navigates to its analysis card)
- **Detail button** - opens the [[Detail View]]

### Orphan Cards
Elements that don't reference any known parent (e.g., `AD_Element`) are shown as standalone cards with a gray left border.

## External Parents

When a parent is not present in the PackOut:
- Marked with a **red dot**
- Display shows the reference type used:
  - `ID 12345 (esterno)` - if linked via ID reference
  - `UU abc-def-123 (esterno)` - if linked via UUID reference

## Sorting

1. Parent cards are sorted **alphabetically by parent type**, so cards with the same parent type are grouped together
2. Within the same type, sorted by **parent name**
3. Children within a card are sorted by **child type**, then **child name**
4. Orphan cards appear **after** parent cards, sorted by type and name

## Navigation

- Click any **internal parent name** to close the grouping view and scroll to its card in the analysis page
- Click any **child name** to close the grouping view and scroll to its card
- Press **Escape** to close the grouping overlay
- The **X button** in the toolbar also closes the view
