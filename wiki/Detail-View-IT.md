# Vista Dettaglio

La Vista Dettaglio e un overlay a schermo intero che mostra tutti i valori dei campi XML per un elemento specifico del PackOut.

## Come Aprire

- Dalla **pagina Analisi**: Clicca l'**icona info** (cerchio con "i") su qualsiasi card elemento
- Dalla **pagina Raggruppamento**: Clicca l'**icona info** accanto a qualsiasi elemento figlio o orfano

## Layout

### Toolbar
- **Titolo**: Mostra il tag name e il nome dell'elemento (es. `AD_Column - MiaColonna`)
- **Pulsante chiudi** (icona X)

### Tabella Campi

Una tabella a tre colonne con header sticky:

| Colonna | Descrizione |
|---|---|
| **Campo** | Il nome del campo XML, in monospace (es. `AD_Table_UU`, `Name`, `SeqNo`) |
| **Valore** | Il contenuto testuale del campo. I valori UUID sono colorati (verde/rosso) |
| **Riferimento** | Mostra il badge tipo riferimento (`uuid` o `id`) e la reference key, se presente |

### Valori UUID nella Tabella

- **UUID verde**: Presente nel PackOut - cliccabile per chiudere il dettaglio (e la gerarchia se aperta) e navigare alla card di quell'elemento
- **UUID rosso**: Non nel PackOut - mostrato in rosso, non cliccabile

## Note

- I sotto-elementi di traduzione (tag `*_Trl`) sono esclusi dalla lista campi per mantenerla pulita
- I campi con valori vuoti mostrano un trattino (`-`)
- La riga di header della tabella resta sticky in alto durante lo scroll
- Premi **Escape** per chiudere l'overlay dettaglio
- Se aperto dalla pagina Raggruppamento, chiudere il dettaglio torna alla vista raggruppamento (lo scroll del body viene ripristinato solo quando entrambi gli overlay sono chiusi)
