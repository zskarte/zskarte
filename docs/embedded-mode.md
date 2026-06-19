# zskarte embedded mode

zskarte can run **embedded** inside a host application (an `<iframe>` whose URL carries the
`embedded` query parameter, e.g. `…/share/{token}?embedded=1` or `…/operations?embedded=1`).
This was added so the [Incident Manager](https://github.com/RFO-Baden/incident-manager) can
host a situation map next to its incidents, but the mechanism is host-agnostic — zskarte never
learns anything about the host's domain objects.

When **not** embedded, none of this code path is active and standalone zskarte behaves exactly
as before.

---

## 1. Detecting embedded mode

`EmbedService.initialize()` (registered as an `APP_INITIALIZER` in `main.ts`) checks:

```
window.parent !== window.self && new URLSearchParams(location.search).has('embedded')
```

If true it sets `isEmbedded()` and adds the `zskarte-embedded` class to `<body>`, which the
host-aware CSS in `styles.scss` uses to hide UI that the host owns (the *Karte | Journal* tab
switcher; the journal button is hidden in the floating UI template).

---

## 2. The message protocol

Defined in `packages/app/src/app/embed/embed.protocol.ts`. Every message is an envelope
`{ source: 'zskarte-embed', type, payload }`; anything without that `source` is ignored.
`EmbedService` (`embed.service.ts`) is the only place that sends/receives these.

### Outbound (zskarte → host) — `EmbedOutboundMessage`

| `type`             | Payload                                       | When                                              |
| ------------------ | --------------------------------------------- | ------------------------------------------------- |
| `ready`            | `{}`                                          | On init, so the host (re)sends its state.         |
| `selectionChanged` | `{ signatureId: string \| null }`             | The selected draw element changed/cleared.        |
| `openExternalLink` | `{ signatureId: string, linkIndex: number }`  | User clicked a host-provided button on a signature.|
| `operationOpened`  | `{ operationId: string \| null }`             | Reply to `requestCurrentOperation`.               |

### Inbound (host → zskarte) — `EmbedInboundMessage`

| `type`                    | Payload                                    | Effect                                        |
| ------------------------- | ------------------------------------------ | --------------------------------------------- |
| `selectSignature`         | `{ signatureId: string }`                  | Select that draw element and pan to it.       |
| `setExternalLinks`        | `{ links: Record<sigId, ExternalLink[]> }` | Replace the host link buttons (kept in a signal).|
| `requestCurrentOperation` | `{}`                                       | Reply with `operationOpened`.                 |

`ExternalLink = { label: string }`. The host owns what a link *means*; zskarte only renders its
`label` and reports clicks. A signature can carry several links, hence the array + `linkIndex`.

The buttons are rendered by `SelectedFeatureComponent` (`externalLinks()` / `openExternalLink()`)
and shown only in embedded mode.

---

## 3. Ephemeral share sessions (important)

**Problem.** zskarte stores "the current session" as a single record in IndexedDB. A
`/share/{token}` login produces a session **scoped to one operation**. If that were persisted,
it would overwrite the user's real **full-access** session — so after the host unlinked the map
and returned the iframe to `/operations`, the overview would list only the one shared operation
until the user logged out and in again.

**Fix.** Embedded share-token logins are marked `ephemeral` and never written to IndexedDB:

- `IZsMapSession.ephemeral?: boolean` (in `packages/types`).
- `ShareComponent` passes `{ ephemeral: queryParams['embedded'] != null }` to `shareLogin`,
  which forwards it to `updateJWT`; the new session is flagged accordingly.
- **Both** persistence paths in `SessionService` skip ephemeral sessions:
  1. the `_session` subscriber's `db.sessions.put(session)`, and
  2. `persistMapState()` (which also runs on window `blur`/`pagehide` — note `pagehide` fires
     exactly when the iframe navigates away on unlink, so this path matters).

Standalone share links (no `?embedded`) are unaffected and still persist as before.

---

## 4. Other embed-related robustness fixes

These were needed because the host creates operations through the Strapi REST API, which
yields map states in a slightly different shape than the zskarte frontend normally produces:

- **`migration.ts`** tolerates object-form `layers`/`drawElements` (not only the legacy array
  form) so backend-created map states migrate cleanly.
- **`state.service.ts`** restores/derives an `activeLayer` from the available layers when the
  saved display state doesn't name one, and `addDrawLayer` initialises `version`/`layers`
  defensively. Without an active layer the draw dialog can't add a signature.
- **Draw dialog** (`draw-dialog.component.ts` and its callers in `floating-ui`,
  `shortcut.service`, `sidebar-journal-entry`) now resolves the active layer itself via
  `ZsMapStateService.getActiveLayer()` at draw time, instead of receiving it through
  `setLayer()`. This is simpler and avoids a race where the dialog opened before the active
  layer was known.
- **`sidebar-menu.component.ts`** null-guards `operation.eventStates` (undefined on
  backend-created operations).
- **`operation.service.ts`** retries `insertOperation` once after a token refresh instead of
  silently failing on an expired JWT.

> Several of the items in §4 are general robustness improvements rather than strictly "embed
> protocol". They are bundled here because they were discovered while wiring up the embed; they
> could be split into a separate PR if preferred.

---

## 5. Server-side: periodic map-state flush

`packages/server/src/index.ts` now flushes changed map states to the database every 30s.
Map-state edits are applied to an in-memory cache and were previously only written on a graceful
shutdown, so an ungraceful stop lost everything drawn since the last clean exit. The flush is a
no-op when nothing changed and the interval is `unref()`-ed so it never holds the process open.
This is independent of the embed protocol but was added because the loss was hit during
integration testing.
