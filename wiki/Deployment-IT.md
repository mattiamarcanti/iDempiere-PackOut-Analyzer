# Deploy

## Deploy Automatico

Il progetto viene deployato automaticamente tramite **GitHub Actions** ad ogni push sul branch `main`.

### Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy FTP to mattiamarcanti.it

on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          port: 21
          server-dir: /iDempierePackoutAnalyzer/
          local-dir: ./
```

### Secret Necessari

Configura questi in GitHub > Settings > Secrets and variables > Actions:

| Secret | Descrizione |
|---|---|
| `FTP_SERVER` | Hostname del server FTPS |
| `FTP_USER` | Username FTP |
| `FTP_PASSWORD` | Password FTP |

### URL di Destinazione

L'app viene deployata su: **[mattiamarcanti.it/iDempierePackoutAnalyzer/](https://mattiamarcanti.it/iDempierePackoutAnalyzer/)**

## Hosting

Il progetto e hostato su **hosting condiviso Aruba** con FTPS sulla porta 21. Non essendoci un build step, tutti i file vengono caricati cosi come sono.

## Self-Hosting

Poiche il progetto e interamente client-side senza backend, puoi hostarlo su qualsiasi server di file statici:

1. Clona o scarica il repository
2. Carica tutti i file su qualsiasi web server (Apache, Nginx, S3, Netlify, Vercel, GitHub Pages, ecc.)
3. Nessuna variabile d'ambiente o configurazione server-side necessaria

Le uniche dipendenze esterne sono librerie caricate via CDN (Bootstrap, JSZip, Google Fonts), che richiedono accesso a internet dal browser del client.
