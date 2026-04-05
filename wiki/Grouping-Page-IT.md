# Pagina Raggruppamento

La pagina Raggruppamento viene mostrata cliccando **"Raggruppa"**. Mostra tutti gli elementi del PackOut organizzati sotto il loro elemento padre, basandosi sulle relazioni note di iDempiere.

## Relazioni Padre-Figlio

### Relazioni Standard (il figlio riferisce il padre tramite FK)

| Figlio | Padre |
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

### Relazione Inversa (il padre riferisce il figlio)

| Padre | Figlio (campo valorizzato) |
|---|---|
| `AD_Menu` | `AD_Window` oppure `AD_Process` |

Nel caso di `AD_Menu`, e il padre che contiene il riferimento al figlio (es. `AD_Window_UU` o `AD_Process_ID`), non il contrario. Se un `AD_Menu` nel PackOut ha valorizzato il campo `AD_Window`, allora `AD_Window` viene mostrato come figlio di quel menu. Se ha valorizzato `AD_Process`, viene mostrato `AD_Process` come figlio.

## Come Funziona la Risoluzione del Padre

Per ogni elemento figlio nel PackOut:

1. **Risoluzione UUID (prioritaria)**: Scansiona i campi dell'elemento cercando attributi `reference="uuid"`. Se il valore UUID punta a un elemento nel PackOut del tipo padre atteso, viene risolto direttamente. Se il nome del campo corrisponde al tipo padre ma l'elemento non e nel PackOut, viene marcato come **padre esterno con UU**.

2. **Risoluzione ID (fallback)**: Se non si trova un match UUID, scansiona gli attributi `reference="id"` il cui nome campo corrisponde al tipo padre atteso. Se il valore ID mappa a un elemento nel PackOut, viene risolto. Altrimenti, viene marcato come **padre esterno con ID**.

## Struttura delle Card

### Card Padre
- **Pallino di stato**: Verde = padre presente nel PackOut; Rosso = dipendenza esterna
- **Tag tipo padre** (es. `AD_Table`)
- **Nome padre** - cliccabile per padri interni (naviga alla card nella pagina analisi)

### Righe Figlio (sotto la card padre)
- **Tag tipo figlio** (es. `AD_Column`)
- **Nome figlio** - cliccabile (naviga alla card nella pagina analisi)
- **Pulsante dettaglio** - apre la [[Vista Dettaglio|Detail-View-IT]]

### Card Orfane
Gli elementi che non riferiscono nessun padre noto (es. `AD_Element`) vengono mostrati come card autonome con un bordo sinistro grigio.

## Padri Esterni

Quando un padre non e presente nel PackOut:
- Marcato con un **pallino rosso**
- La visualizzazione mostra il tipo di riferimento usato:
  - `ID 12345 (esterno)` - se collegato tramite riferimento ID
  - `UU abc-def-123 (esterno)` - se collegato tramite riferimento UUID

## Ordinamento

1. Le card padre sono ordinate **alfabeticamente per tipo padre**, cosi le card con lo stesso tipo padre sono raggruppate insieme
2. A parita di tipo, ordinate per **nome padre**
3. I figli all'interno di una card sono ordinati per **tipo figlio**, poi **nome figlio**
4. Le card orfane appaiono **dopo** le card padre, ordinate per tipo e nome

## Navigazione

- Clicca il **nome di un padre interno** per chiudere il raggruppamento e scorrere alla sua card nella pagina analisi
- Clicca il **nome di un figlio** per chiudere il raggruppamento e scorrere alla sua card
- Premi **Escape** per chiudere l'overlay di raggruppamento
- Il **pulsante X** nella toolbar chiude la vista
