# Guida Introduttiva

## Requisiti

- Un browser moderno (Chrome, Firefox, Edge, Safari)
- Un file ZIP di PackOut iDempiere

Nessuna installazione, nessuna dipendenza, nessun backend necessario.

## Utilizzo

### Online

Visita la versione online: **[mattiamarcanti.it/iDempierePackoutAnalyzer/](https://mattiamarcanti.it/iDempierePackoutAnalyzer/)**

### Esecuzione Locale

Clona il repository e avvia un qualsiasi server HTTP statico:

```bash
git clone https://github.com/<tuo-username>/iDempiere-PackOut-Analyzer.git
cd iDempiere-PackOut-Analyzer

# Opzione 1: Node.js
npx serve .

# Opzione 2: Python
python -m http.server 8000

# Opzione 3: PHP
php -S localhost:8000
```

Poi apri `http://localhost:8000` nel browser.

## Prima Analisi

1. Clicca **"Carica file ZIP"** per selezionare il file `.zip` del PackOut
2. Clicca **"Analizza"** per analizzare il file
3. Naviga tra le card degli elementi, usa la ricerca e i filtri per tipo
4. Clicca **"Raggruppa"** per vedere la vista gerarchica padre-figlio
5. Clicca l'**icona info** su qualsiasi card per vedere tutti i dettagli dei campi

## Struttura ZIP Attesa

Lo strumento si aspetta il formato ZIP standard di PackOut iDempiere:

```
MioPackOut.zip
  └── MioPackOut/
        └── dict/
              └── PackOut.xml    (o qualsiasi file .xml)
```

Il file XML deve contenere elementi con attributo `type="table"`. Ogni figlio dell'elemento rappresenta un campo, con attributi opzionali `reference="uuid"` o `reference="id"` per i riferimenti a chiavi esterne.
