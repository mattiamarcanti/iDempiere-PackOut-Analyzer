# Pagina Analisi

La pagina Analisi e la vista principale mostrata dopo aver cliccato **"Analizza"**. Mostra tutti gli elementi del PackOut come card individuali.

## Come Funziona

1. Il file ZIP viene letto con JSZip
2. Il dizionario XML viene trovato in `<nomeZip>/dict/*.xml`
3. L'XML viene analizzato con `DOMParser`
4. Due passaggi su tutti gli elementi `[type="table"]`:
   - **Primo passaggio**: Raccoglie tutti gli UUID in `cardUuArray` per i riferimenti incrociati
   - **Secondo passaggio**: Costruisce una card per ogni elemento

## Anatomia della Card

Ogni card contiene:

### Riga Header
- **Tag Name** (es. `AD_Table`, `AD_Column`) - grassetto, bianco
- **Nome Elemento** (es. `MiaTabella`) - colore secondario
- **Badge "Tradotto"** - mostrato se l'elemento ha sotto-tag `*_Trl` (traduzioni)
- **UUID** (mostrato in modalita compressa) - monospace, attenuato
- **Pulsante Dettaglio** (icona info) - apre la [[Vista Dettaglio|Detail-View-IT]]
- **Pulsante Comprimi** (freccia) - alterna la visibilita del contenuto della card

### Area Contenuto
- **Sottotitolo UUID** - UUID completo in monospace
- **Blocchi Riferimento** - uno per campo con riferimento, ognuno contiene:
  - Nome campo e badge tipo riferimento (`uuid` in viola, `id` in blu)
  - Query SQL generata in un box monospace
  - Pulsante copia negli appunti

## Colorazione UUID

Quando un riferimento e di tipo `uuid`:
- **Verde** (`uuid-in-list`): L'UUID referenziato esiste nel PackOut. Cliccandolo si scrolla alla card di quell'elemento con un'animazione di evidenziazione.
- **Rosso** (`uuid-not-in-list`): L'UUID referenziato non e nel PackOut - e una dipendenza esterna che deve gia esistere sul sistema di destinazione.

## Formato Query SQL

Per riferimenti `id`:
```sql
SELECT * FROM AD_Table WHERE AD_Table_ID = 123;
```

Per riferimenti `uuid`:
```sql
SELECT * FROM AD_Table WHERE AD_Table_UU = 'abc-def-ghi';
```

## Ricerca

La barra di ricerca filtra le card per:
- Nome elemento
- Nomi traduzioni (dai sotto-tag `*_Trl`)
- UUID

La corrispondenza e case-insensitive e verifica se il termine di ricerca e contenuto in qualsiasi punto del testo combinato.

## Filtro Tipo

Il dropdown multi-selezione elenca tutti i tipi di elementi trovati nel PackOut (es. `AD_Table`, `AD_Column`, `AD_Window`). Puoi:
- Selezionare/deselezionare tipi individuali
- Usare "Tutti" per selezionare o deselezionare tutti i tipi contemporaneamente

## Comprimi/Espandi Tutto

Il pulsante nella toolbar comprime o espande tutte le card attualmente visibili. L'icona cambia per riflettere lo stato corrente.
