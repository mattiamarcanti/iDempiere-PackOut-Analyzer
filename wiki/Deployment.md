# Deployment

## Automatic Deployment

The project deploys automatically via **GitHub Actions** on every push to the `main` branch.

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

### Required Secrets

Configure these in GitHub > Settings > Secrets and variables > Actions:

| Secret | Description |
|---|---|
| `FTP_SERVER` | FTPS server hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |

### Target URL

The app is deployed to: **[mattiamarcanti.it/iDempierePackoutAnalyzer/](https://mattiamarcanti.it/iDempierePackoutAnalyzer/)**

## Hosting

The project is hosted on **Aruba shared hosting** with FTPS on port 21. Since there is no build step, all files are uploaded as-is.

## Self-Hosting

Since the project is fully client-side with no backend, you can host it on any static file server:

1. Clone or download the repository
2. Upload all files to any web server (Apache, Nginx, S3, Netlify, Vercel, GitHub Pages, etc.)
3. No environment variables or server-side configuration needed

The only external dependencies are CDN-loaded libraries (Bootstrap, JSZip, Google Fonts), which require internet access from the client browser.
