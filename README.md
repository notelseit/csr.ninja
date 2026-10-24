# CSR NOTELSEIT 2.0

Modern PKCS#10 certificate signing request generator. Keys and certificate requests are created **entirely in the browser**, using Web Crypto API and [@peculiar/x509](https://github.com/PeculiarVentures/x509).

## Security model

- No PHP backend or email sending.
- No private key is submitted to any API; requests are signed locally.
- Output: a PKCS#10 CSR containing CN and DNS SANs, and a PKCS#8 unencrypted private key.
- HTTPS or localhost is required by Web Crypto.
- **Keep your downloaded private key secure. Do not email it.**
- Deploy only the compiled `dist/` folder, served as static content under HTTPS.
- Self-host the built JS bundle; do not use CDN dependencies at runtime.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
```

## Production

Build with `npm run build` and publish **only** the `dist/` folder to your static web server. Do not deploy any legacy PHP endpoint. Static hosting works on Nginx, Apache or GitHub Pages.

Use a strict CSP, avoid third-party tracking/scripts, and ensure HTTPS. The private key is unencrypted PKCS#8: place it in an appropriately protected keystore after download.

## History

Replaces the historical PHP 5.6 / PEAR Mail implementation. Original author credit remains in Git history.
