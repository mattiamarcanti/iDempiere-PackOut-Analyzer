# iDempiere PackOut Analyzer

> Uno strumento web client-side per analizzare file ZIP di PackOut iDempiere, visualizzare i riferimenti tra elementi ed esplorare le gerarchie padre-figlio.

---

## Pagine

- [[Guida Introduttiva|Getting-Started-IT]]
- [[Funzionalita|Features-IT]]
- [[Architettura|Architecture-IT]]
- [[Pagina Analisi|Analysis-Page-IT]]
- [[Pagina Raggruppamento|Grouping-Page-IT]]
- [[Vista Dettaglio|Detail-View-IT]]
- [[Deploy|Deployment-IT]]
- [[FAQ|FAQ-IT]]

---

## Panoramica Rapida

Carica un file PackOut `.zip` e lo strumento:

1. Estrae il dizionario XML da `<nomeZip>/dict/*.xml`
2. Analizza tutti gli elementi `type="table"`
3. Mostra ogni elemento come una card con query SQL generate per riferimenti ID e UUID
4. Colora gli UUID: **verde** = incluso nel PackOut, **rosso** = dipendenza esterna
5. Raggruppa gli elementi per gerarchia padre-figlio (tramite il pulsante **Raggruppa**)
6. Mostra il dettaglio campo per campo di ogni elemento

**Nessun backend necessario** - tutto gira interamente nel browser.

---

## Stack Tecnologico

| Tecnologia | Versione | Fonte |
|---|---|---|
| HTML / CSS / JavaScript | Vanilla (nessun framework) | - |
| Bootstrap | 5.3.2 | CDN |
| JSZip | 3.10.1 | CDN (cdnjs) |
| Font Inter | Ultima | Google Fonts |
