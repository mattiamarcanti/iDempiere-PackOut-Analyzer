# FAQ

## General

### What is an iDempiere PackOut?
A PackOut is iDempiere's mechanism for exporting application dictionary changes (tables, columns, windows, tabs, fields, processes, etc.) as a ZIP file containing XML definitions. It's used to transfer customizations between iDempiere instances.

### Does this tool upload my data anywhere?
**No.** Everything runs entirely in the browser. The ZIP file is read locally using JavaScript (JSZip), and no data is sent to any server.

### What browsers are supported?
Any modern browser: Chrome, Firefox, Edge, Safari. The tool uses standard Web APIs (`FileReader`, `DOMParser`, `Clipboard API`).

### Can I use this offline?
Not fully - the tool loads Bootstrap CSS, JSZip, and Inter font from CDNs. To use offline, you would need to download and vendor those files locally.

---

## Analysis

### Why does my ZIP not work?
The tool expects the standard iDempiere PackOut structure:
```
PackOutName.zip
  └── PackOutName/
        └── dict/
              └── *.xml
```
Make sure the ZIP contains a folder matching the ZIP filename, with a `dict/` subfolder containing at least one XML file.

### What does green vs red UUID mean?
- **Green**: The referenced element is included in this PackOut (internal reference)
- **Red**: The referenced element is NOT in this PackOut - it must already exist on the target system (external dependency)

### What are the generated SQL queries for?
They let you quickly look up referenced elements in your iDempiere database. Copy a query and run it in your database client to find the record.

### What does the "Tradotto" badge mean?
It indicates that the element contains translation sub-elements (`*_Trl` XML tags), meaning it has been localized in one or more languages.

---

## Grouping

### How are parent-child relationships determined?
The tool uses a hardcoded map of known iDempiere relationships (e.g., `AD_Column` -> `AD_Table`). For each child element, it scans its reference fields to find which parent it points to, first via UUID, then via ID.

### Why is AD_Menu handled differently?
In iDempiere, `AD_Menu` holds a reference to `AD_Window` or `AD_Process` (the parent references the child). This is the reverse of other relationships where the child references the parent. The tool detects which field is populated and treats the menu as the parent.

### What are orphan elements?
Elements that don't have a known parent relationship in the defined hierarchy (e.g., `AD_Element`, standalone `AD_Table`). They are shown in their own cards at the bottom of the grouping view.

### Can I add custom parent-child relationships?
Currently, the relationships are hardcoded in `js/script.js` in the `CHILD_TO_PARENT` constant. You can fork the project and add your own mappings there.

---

## Deployment

### How do I set up automatic deployment?
See the [[Deployment]] page. You need to configure three GitHub secrets (`FTP_SERVER`, `FTP_USER`, `FTP_PASSWORD`) and push to the `main` branch.

### Can I host this on GitHub Pages?
Yes! Since it's a fully static site with no build step, you can enable GitHub Pages on the repository and it will work directly.
