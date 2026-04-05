# FAQ

## Generale

### Cos'e un PackOut iDempiere?
Un PackOut e il meccanismo di iDempiere per esportare le modifiche al dizionario applicativo (tabelle, colonne, finestre, tab, campi, processi, ecc.) come file ZIP contenente definizioni XML. Viene usato per trasferire personalizzazioni tra istanze iDempiere.

### Questo strumento carica i miei dati da qualche parte?
**No.** Tutto gira interamente nel browser. Il file ZIP viene letto localmente tramite JavaScript (JSZip), e nessun dato viene inviato a nessun server.

### Quali browser sono supportati?
Qualsiasi browser moderno: Chrome, Firefox, Edge, Safari. Lo strumento usa API Web standard (`FileReader`, `DOMParser`, `Clipboard API`).

### Posso usarlo offline?
Non completamente - lo strumento carica Bootstrap CSS, JSZip e il font Inter da CDN. Per usarlo offline, sarebbe necessario scaricare e includere quei file localmente.

---

## Analisi

### Perche il mio ZIP non funziona?
Lo strumento si aspetta la struttura standard di PackOut iDempiere:
```
NomePackOut.zip
  └── NomePackOut/
        └── dict/
              └── *.xml
```
Assicurati che lo ZIP contenga una cartella con lo stesso nome del file ZIP, con una sottocartella `dict/` contenente almeno un file XML.

### Cosa significa UUID verde vs rosso?
- **Verde**: L'elemento referenziato e incluso in questo PackOut (riferimento interno)
- **Rosso**: L'elemento referenziato NON e in questo PackOut - deve gia esistere sul sistema di destinazione (dipendenza esterna)

### A cosa servono le query SQL generate?
Permettono di cercare velocemente gli elementi referenziati nel database iDempiere. Copia una query e eseguila nel tuo client di database per trovare il record.

### Cosa significa il badge "Tradotto"?
Indica che l'elemento contiene sotto-elementi di traduzione (tag XML `*_Trl`), cioe e stato localizzato in una o piu lingue.

---

## Raggruppamento

### Come vengono determinate le relazioni padre-figlio?
Lo strumento usa una mappa fissa di relazioni note di iDempiere (es. `AD_Column` -> `AD_Table`). Per ogni elemento figlio, scansiona i suoi campi con riferimento per trovare a quale padre punta, prima tramite UUID, poi tramite ID.

### Perche AD_Menu e gestito diversamente?
In iDempiere, `AD_Menu` contiene un riferimento ad `AD_Window` o `AD_Process` (il padre riferisce il figlio). Questo e l'opposto delle altre relazioni dove il figlio riferisce il padre. Lo strumento rileva quale campo e valorizzato e tratta il menu come padre.

### Cosa sono gli elementi orfani?
Elementi che non hanno una relazione padre nota nella gerarchia definita (es. `AD_Element`, `AD_Table` standalone). Vengono mostrati in card proprie in fondo alla vista raggruppamento.

### Posso aggiungere relazioni padre-figlio personalizzate?
Attualmente le relazioni sono fisse in `js/script.js` nella costante `CHILD_TO_PARENT`. Puoi fare un fork del progetto e aggiungere le tue mappature li.

---

## Deploy

### Come configuro il deploy automatico?
Vedi la pagina [[Deploy|Deployment-IT]]. Devi configurare tre secret GitHub (`FTP_SERVER`, `FTP_USER`, `FTP_PASSWORD`) e fare push sul branch `main`.

### Posso hostare questo su GitHub Pages?
Si! Essendo un sito completamente statico senza build step, puoi abilitare GitHub Pages sul repository e funzionera direttamente.
