# Regole Pagina Raggruppamento

## Scopo

La pagina **Raggruppa** mostra tutti gli elementi del PackOut raggruppati sotto il rispettivo elemento padre, secondo le relazioni note di iDempiere.

---

## Relazioni Padre-Figlio

### Relazioni standard (il figlio riferisce il padre tramite FK)

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

### Relazione inversa (il padre riferisce il figlio)

| Padre | Figlio (campo valorizzato) |
|---|---|
| `AD_Menu` | `AD_Window` oppure `AD_Process` (a seconda di quale dei due campi e valorizzato nel menu) |

Nel caso di `AD_Menu`, e il padre che contiene il riferimento al figlio (es. `AD_Window_UU` o `AD_Process_ID`), non il contrario. Se un `AD_Menu` nel PackOut ha valorizzato il campo `AD_Window`, allora `AD_Window` viene mostrato come figlio di quel menu. Se ha valorizzato `AD_Process`, viene mostrato `AD_Process` come figlio.

---

## Regole di costruzione

### 1. Risoluzione del padre

Per ogni elemento figlio nel PackOut, il padre viene individuato cercando nei suoi campi un riferimento al tipo padre atteso:

- **Prima si cerca per UUID** (`reference="uuid"`): se il valore UUID punta a un elemento nel PackOut del tipo padre atteso, viene risolto direttamente. Se il campo corrisponde al tipo padre ma l'elemento non e nel PackOut, viene segnato come padre **esterno con UU**.
- **Poi si cerca per ID** (`reference="id"`): se non si trova un match UUID, si cerca un campo con `reference="id"` il cui nome corrisponda al tipo padre. Se l'ID corrisponde a un elemento nel PackOut, viene risolto direttamente; altrimenti il padre viene segnato come **esterno con ID**.

### 2. Raggruppamento

- Se **piu elementi figli** nel PackOut riferiscono lo **stesso padre**, vengono **raggruppati tutti nella stessa card** del padre.
- Un singolo padre puo contenere figli di tipo diverso (es. una `AD_Table` con sotto `AD_Column` e `AD_TableIndex`).

### 3. Elementi orfani

- Se un elemento del PackOut **non riferisce nessun padre** secondo le relazioni note (es. `AD_Element`, `AD_Table` senza padre, ecc.), viene mostrato in una **card autonoma** (orfano).
- Gli elementi che **sono padri** di altri elementi non vengono mostrati come orfani: compaiono gia come intestazione della card dei loro figli.

### 4. Ordinamento

- Le card dei padri sono **ordinate per tipo padre** (alfabeticamente), in modo che padri dello stesso tipo siano vicini.
- A parita di tipo, si ordina per **nome del padre**.
- I figli all'interno di ogni card sono ordinati per **tipo figlio** e poi per **nome**.
- Le card orfane vengono mostrate **dopo** le card con padre, ordinate per tipo e nome.

### 5. Indicatori visivi

- **Pallino verde**: il padre e presente nel PackOut (interno).
- **Pallino rosso**: il padre e una dipendenza esterna (non presente nel PackOut).
- **Padri esterni**: mostrano il tipo di riferimento usato:
  - `ID <valore> (esterno)` — se il collegamento e avvenuto tramite riferimento ID.
  - `UU <valore> (esterno)` — se il collegamento e avvenuto tramite riferimento UUID.
- Cliccando sul **nome di un padre interno** si chiude il raggruppamento e si scrolla alla card corrispondente nella pagina Analizza.
- Cliccando sul **nome di un figlio** si chiude il raggruppamento e si scrolla alla card corrispondente nella pagina Analizza.

### 6. Dettaglio

- Ogni elemento (figlio o orfano) ha un **pulsante dettaglio** (icona info) che apre un overlay con tutti i valori dei campi XML dell'elemento.
- Nella tabella dettaglio, i valori UUID sono colorati: **verde** se presenti nel PackOut (cliccabili per navigare), **rosso** se esterni.

---

## Visibilita del pulsante Raggruppa

- Il pulsante **Raggruppa** e visibile solo dopo aver analizzato un PackOut.
- Se si cambia il file ZIP, il pulsante scompare finche non si ri-analizza.
