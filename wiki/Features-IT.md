# Funzionalita

## Pagina Analisi

- **Upload ZIP e Parsing XML**: Carica un file `.zip` di PackOut e lo strumento estrae e analizza il dizionario XML automaticamente
- **Card Elementi**: Ogni elemento `type="table"` viene mostrato come una card collassabile con tag name, nome, UUID e tutti i riferimenti
- **Generazione Query SQL**: Per ogni campo con riferimento, lo strumento genera una query `SELECT` pronta all'uso (per riferimenti `id` e `uuid`)
- **Copia negli Appunti**: Pulsante di copia con un clic per ogni query generata
- **Colorazione UUID**:
  - **Verde**: l'UUID esiste nel PackOut (riferimento interno) - cliccabile per navigare alla card corrispondente
  - **Rosso**: l'UUID non e nel PackOut (dipendenza esterna)
- **Badge Traduzione**: Gli elementi con sotto-tag `*_Trl` mostrano un badge "Tradotto"
- **Vista Dettaglio**: Il pulsante info su ogni card apre un overlay a schermo intero con tutti i valori dei campi XML

## Ricerca e Filtri

- **Ricerca per Nome**: Filtra le card per nome elemento, nomi delle traduzioni o UUID
- **Filtro Tipo Multi-Selezione**: Filtra per tipo elemento (AD_Table, AD_Column, ecc.) con seleziona/deseleziona tutto
- **Contatore Risultati**: Mostra il conteggio elementi visibili/totali
- **Comprimi/Espandi Tutto**: Pulsante singolo per comprimere o espandere tutte le card visibili

## Pagina Raggruppamento

- **Gerarchia Padre-Figlio**: Raggruppa gli elementi sotto il loro padre basandosi sulle relazioni note di iDempiere
- **Supporto Multi-Livello**: Gestisce relazioni come AD_Table > AD_Column, AD_Window > AD_Tab > AD_Field
- **Risoluzione Riferimenti**: Risolve i padri prima tramite riferimenti UUID, poi tramite riferimenti ID come fallback
- **Caso Speciale AD_Menu**: AD_Menu mostra AD_Window o AD_Process referenziati come figli (FK inversa)
- **Dipendenze Esterne**: I padri esterni (non nel PackOut) sono marcati con pallino rosso e mostrano `ID ...` o `UU ...`
- **Elementi Orfani**: Gli elementi senza un padre noto vengono mostrati in card autonome
- **Output Ordinato**: Card ordinate per tipo padre, poi nome padre; figli ordinati per tipo, poi nome

## Generale

- **Tema Scuro**: Interfaccia dark moderna costruita su Bootstrap 5.3.2 con CSS personalizzato
- **Interamente Client-Side**: Nessun backend, nessun dato esce dal browser
- **Responsivo**: Si adatta a layout mobile e desktop
- **Navigazione da Tastiera**: Premi `Escape` per chiudere gli overlay
