# Architettura

## Struttura del Progetto

```
iDempiere-PackOut-Analyzer/
  index.html              # Entry point dell'applicazione single-page
  css/
    style.css             # Tema scuro, card, overlay, stili gerarchia
  js/
    script.js             # Tutta la logica applicativa
  source/
    logo-idempiere-packout-analyzer.png   # Logo dell'app
  .github/
    workflows/
      deploy.yml          # Deploy FTP via GitHub Actions
```

## Nessun Build Step

Questo progetto non usa **build tools, bundler, npm o node_modules**. Tutte le librerie esterne sono caricate via CDN:

- Bootstrap 5.3.2 CSS da `cdn.jsdelivr.net`
- JSZip 3.10.1 da `cdnjs.cloudflare.com`
- Font Inter da Google Fonts

I file vengono deployati cosi come sono sul server.

## Flusso dell'Applicazione

```
L'utente carica il .zip
       |
       v
  parseFile()
       |  Legge lo ZIP via JSZip
       |  Trova l'XML in <nomeZip>/dict/
       |  Parsing con DOMParser
       v
  buildCards(xml)
       |  Primo passaggio: raccoglie tutti gli UUID in cardUuArray
       |  Secondo passaggio: costruisce le card DOM, salva i dati dei campi in elementFieldsMap
       |  Popola il filtro tipi, mostra la toolbar
       v
  L'utente interagisce:
       |
       +---> Ricerca/Filtro ---> applyFilters()
       |
       +---> "Raggruppa" ------> showHierarchy()
       |                            |  Costruisce mappe di lookup UU e ID
       |                            |  Risolve padre-figlio via riferimenti UUID/ID
       |                            |  Gestisce la FK inversa di AD_Menu
       |                            |  Raggruppa i figli sotto le card padre
       |                            v
       |                        Overlay gerarchia renderizzato
       |
       +---> Pulsante Dettaglio -> openDetail(uu)
                                    |  Legge i campi da elementFieldsMap
                                    v
                                Overlay dettaglio con tabella campi
```

## Strutture Dati Principali

### `cardUuArray`
Array di tutti gli UUID trovati nel PackOut. Usato per determinare se un riferimento UUID e interno (verde) o esterno (rosso).

### `allCardData`
Array di oggetti per ogni elemento analizzato:
```js
{ el, tagName, name, trlNames, uu, hasTranslation }
```

### `elementFieldsMap`
Mappa da UUID ai dati dell'elemento, usata per la vista dettaglio e la risoluzione della gerarchia:
```js
{
  "valore-uuid": {
    tagName: "AD_Column",
    name: "MiaColonna",
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
Mappa normalizzata che definisce le relazioni padre-figlio note di iDempiere. Usata dalla vista gerarchica per raggruppare gli elementi:
```js
{
  'adcolumn': 'adtable',
  'adfield':  'adtab',
  'adtab':    'adwindow',
  ...
}
```

## Architettura CSS

Il foglio di stile usa una struttura piatta basata su componenti senza preprocessore:

- **Base**: Reset, body, sfondo scuro
- **Header**: Header sticky con logo, area upload, pulsanti azione
- **Toolbar**: Barra secondaria sticky con ricerca, filtri, azioni
- **Card**: Card elementi con comprimi/espandi, riferimenti, badge
- **Overlay**: Overlay a schermo intero per viste gerarchia e dettaglio
- **Gerarchia**: Card padre con pallini di stato, righe figli
- **Dettaglio**: Tabella campi con header sticky
- **Utility**: Colori UUID, animazioni, breakpoint responsivi
