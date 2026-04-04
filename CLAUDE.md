# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A client-side web tool that analyzes iDempiere PackOut ZIP files. Users upload a `.zip`, the app extracts the XML from `<zipName>/dict/*.xml`, parses it, and displays cards for each `type="table"` element with generated SQL queries for ID and UUID references. No backend — everything runs in the browser.

## Tech Stack

- Vanilla HTML/CSS/JavaScript — no frameworks, no build tools, no bundlers, no npm
- Bootstrap 5.3.2 via CDN
- JSZip 3.10.1 via CDN (`cdnjs.cloudflare.com`)
- Dark theme UI with custom CSS

## Architecture

- `index.html` — single page: file input, analyze button, card container. Loads Bootstrap CSS, `css/style.css`, JSZip, and `js/script.js`.
- `js/script.js` — all application logic:
  - `parseFile()` — reads ZIP via JSZip, finds XML in `<zipName>/dict/`, parses with DOMParser
  - `buildCards(xml)` — iterates `[type="table"]` elements, creates Bootstrap cards with SQL queries for each `reference` attribute child. Tracks UUIDs in `cardUuArray` for cross-card navigation (green = in packout, red = external dependency)
  - `buildQuery(refType, refKey, value)` — generates `SELECT` statements for `id` or `uuid` reference types
- `css/style.css` — dark theme overrides for Bootstrap, UUID color coding (`.uuid-in-list` green, `.uuid-not-in-list` red), card collapse transitions

## Running Locally

```bash
# Any static HTTP server works
npx serve .
# or
python -m http.server 8000
```

## Deployment

Push to `main` triggers GitHub Actions FTP deploy to `mattiamarcanti.it/iDempierePackoutAnalyzer/` via `SamKirkland/FTP-Deploy-Action@v4.3.4`. Secrets: `FTP_SERVER`, `FTP_USER`, `FTP_PASSWORD`.

## Language

UI text is in Italian (labels, alerts, aria attributes).
