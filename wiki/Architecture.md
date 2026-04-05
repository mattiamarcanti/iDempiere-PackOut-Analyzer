# Architecture

## Project Structure

```
iDempiere-PackOut-Analyzer/
  index.html              # Single-page application entry point
  css/
    style.css             # Dark theme, cards, overlays, hierarchy styles
  js/
    script.js             # All application logic
  source/
    logo-idempiere-packout-analyzer.png   # App logo
  .github/
    workflows/
      deploy.yml          # GitHub Actions FTP deployment
```

## No Build Step

This project uses **no build tools, no bundlers, no npm, no node_modules**. All external libraries are loaded via CDN:

- Bootstrap 5.3.2 CSS from `cdn.jsdelivr.net`
- JSZip 3.10.1 from `cdnjs.cloudflare.com`
- Inter font from Google Fonts

Files are deployed as-is to the server.

## Application Flow

```
User uploads .zip
       |
       v
  parseFile()
       |  Reads ZIP via JSZip
       |  Finds XML in <zipName>/dict/
       |  Parses with DOMParser
       v
  buildCards(xml)
       |  First pass: collects all UUIDs into cardUuArray
       |  Second pass: builds DOM cards, stores field data in elementFieldsMap
       |  Populates type filter, shows toolbar
       v
  User interacts:
       |
       +---> Search/Filter ---> applyFilters()
       |
       +---> "Raggruppa" -----> showHierarchy()
       |                            |  Builds UU and ID lookup maps
       |                            |  Resolves parent-child via UUID/ID refs
       |                            |  Handles AD_Menu reverse FK
       |                            |  Groups children under parent cards
       |                            v
       |                        Hierarchy overlay rendered
       |
       +---> Detail button ---> openDetail(uu)
                                    |  Reads fields from elementFieldsMap
                                    v
                                Detail overlay with field table
```

## Key Data Structures

### `cardUuArray`
Array of all UUIDs found in the PackOut. Used to determine if a UUID reference is internal (green) or external (red).

### `allCardData`
Array of objects for each parsed element:
```js
{ el, tagName, name, trlNames, uu, hasTranslation }
```

### `elementFieldsMap`
Map from UUID to element data, used for detail view and hierarchy resolution:
```js
{
  "uuid-value": {
    tagName: "AD_Column",
    name: "MyColumn",
    fields: [
      { key: "AD_Table_ID", value: "123", reference: "id", referenceKey: "" },
      { key: "AD_Table_UU", value: "abc-def", reference: "uuid", referenceKey: "" },
      ...
    ],
    hasTranslation: false
  }
}
```

### `CHILD_TO_PARENT`
Normalized map defining known iDempiere parent-child relationships. Used by the hierarchy view to group elements:
```js
{
  'adcolumn': 'adtable',
  'adfield':  'adtab',
  'adtab':    'adwindow',
  ...
}
```

## CSS Architecture

The stylesheet uses a flat, component-based structure with no preprocessor:

- **Base**: Reset, body, dark background
- **Header**: Sticky header with logo, upload area, action buttons
- **Toolbar**: Sticky secondary bar with search, filters, actions
- **Cards**: Element cards with collapse/expand, references, badges
- **Overlays**: Full-screen overlays for hierarchy and detail views
- **Hierarchy**: Parent cards with status dots, child rows
- **Detail**: Field table with sticky headers
- **Utilities**: UUID colors, animations, responsive breakpoints
