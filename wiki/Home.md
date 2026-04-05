# iDempiere PackOut Analyzer

> A client-side web tool to analyze iDempiere PackOut ZIP files, visualize element references, and explore parent-child hierarchies.

---

## Pages

- [[Getting Started]]
- [[Features]]
- [[Architecture]]
- [[Analysis Page]]
- [[Grouping Page]]
- [[Detail View]]
- [[Deployment]]
- [[FAQ]]

---

## Quick Overview

Upload a PackOut `.zip` file and the tool will:

1. Extract the XML dictionary from `<zipName>/dict/*.xml`
2. Parse all `type="table"` elements
3. Display each element as a card with generated SQL queries for ID and UUID references
4. Color-code UUIDs: **green** = included in PackOut, **red** = external dependency
5. Group elements by parent-child hierarchy (via the **Group** button)
6. Show field-level detail for any element

**No backend required** - everything runs entirely in the browser.

---

## Tech Stack

| Technology | Version | Source |
|---|---|---|
| HTML / CSS / JavaScript | Vanilla (no frameworks) | - |
| Bootstrap | 5.3.2 | CDN |
| JSZip | 3.10.1 | CDN (cdnjs) |
| Inter Font | Latest | Google Fonts |

---

_For the Italian version of this wiki, see [[Home-IT]]._
