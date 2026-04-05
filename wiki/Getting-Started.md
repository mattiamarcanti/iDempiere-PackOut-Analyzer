# Getting Started

## Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- An iDempiere PackOut ZIP file

No installation, no dependencies, no backend needed.

## Usage

### Online

Visit the hosted version at: **[mattiamarcanti.it/iDempierePackoutAnalyzer/](https://mattiamarcanti.it/iDempierePackoutAnalyzer/)**

### Run Locally

Clone the repository and start any static HTTP server:

```bash
git clone https://github.com/<your-username>/iDempiere-PackOut-Analyzer.git
cd iDempiere-PackOut-Analyzer

# Option 1: Node.js
npx serve .

# Option 2: Python
python -m http.server 8000

# Option 3: PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## First Analysis

1. Click **"Carica file ZIP"** (Upload ZIP file) to select your PackOut `.zip`
2. Click **"Analizza"** (Analyze) to parse the file
3. Browse the element cards, use search and type filters
4. Click **"Raggruppa"** (Group) to see the parent-child hierarchy view
5. Click the **info icon** on any card to see full field details

## Expected ZIP Structure

The tool expects the standard iDempiere PackOut ZIP format:

```
MyPackOut.zip
  └── MyPackOut/
        └── dict/
              └── PackOut.xml    (or any .xml file)
```

The XML must contain elements with `type="table"` attributes. Each element's children represent fields, with optional `reference="uuid"` or `reference="id"` attributes for foreign key references.
