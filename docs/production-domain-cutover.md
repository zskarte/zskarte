# Production domain cutover

| Address | Hosting |
| --- | --- |
| `https://zskarte.ch` | GitHub Pages, `zskarte/website`, `main`, `/` |
| `https://www.zskarte.ch` | GitHub Pages redirects to `https://zskarte.ch` |
| `https://app.zskarte.ch` | Existing production Azure Static Web App |
| `https://api.zskarte.ch` | Existing API; no changes |

## Prepare

1. In Azure, find the Static Web App with default hostname
   `red-field-0d54a0203.1.azurestaticapps.net`. Add `app.zskarte.ch` under
   **Custom domains**, validate it and wait for a valid HTTPS certificate.
   The existing CNAME alone does not complete this step. If Azure requests
   TXT verification, publish the exact name and token it supplies in Infomaniak.
2. Verify the deployed app at `https://app.zskarte.ch`: login, guest access,
   share links, journal links and live synchronization. The production API
   URL remains `https://api.zskarte.ch`. HTTP and WebSocket configuration
   currently has no allowlist limited to the old website origin.
3. Publish the website compatibility redirects through its protected `main`
   branch. Pages already publishes `main` at `/`, with custom domain
   `zskarte.ch`; login and guest links already point to the app.
4. Before moving users, synchronize or export any unsynchronized offline data.
   Browser storage and installed PWAs belong to their original origin and do
   not automatically move to `app.zskarte.ch`. Users must sign in there again.

## DNS in Infomaniak

The authoritative nameservers are `nsany1.infomaniak.com` and
`nsany2.infomaniak.com`. Edit **Domains → zskarte.ch → DNS zone** in the
Infomaniak Manager; the public DNS zone is not hosted in Azure DNS.

| Name | Type | Action |
| --- | --- | --- |
| `@` | A | Replace `84.16.66.164` with four records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@` | AAAA | Replace the old `2001:1600:0:aaaa::2:14` record with `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www` | CNAME | Replace the Azure hostname with `zskarte.github.io` |
| `app` | CNAME | Keep `red-field-0d54a0203.1.azurestaticapps.net` |
| `api` | CNAME | Keep `k8s.digital4you.ch` |

Do not change mail records or nameservers. Save the current DNS values before
the switch so website DNS can be restored if validation fails.

## Finish

- Once GitHub has issued its certificate, a repository administrator enables
  **Settings → Pages → Enforce HTTPS**. Website write access alone is insufficient.
- Check the apex website, the `www` redirect, app login and API synchronization.
- The website's `404.html` forwards old `/login`, `/operations`, `/main`, `/map`,
  `/share` and `/help` links to the app, preserving path, query and fragment.
  This is a browser redirect from a GitHub 404 response, not an HTTP 301.
- `/map` is used by older printed map QR codes and redirects directly to
  `/main/map`; new QR codes use `/main/map`.
- Check an existing browser/PWA installation as well as a fresh browser session;
  an old service worker can initially serve cached app content on the old origin.
- No TEST/DEV configuration changes are required. The domain switch uses the
  already deployed app. The existing production release workflow deploys both
  app and API; do not publish a full release just to bind the new hostname.

References: [GitHub Pages domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[Azure custom domains](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external),
[Infomaniak DNS zone](https://www.infomaniak.com/de/support/faq/2000/eine-dns-zone-im-einfachen-modus-eines-bei-infomaniak-verwalteten-domains-bearbeiten).
