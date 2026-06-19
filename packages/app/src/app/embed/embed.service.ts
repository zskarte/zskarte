import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { getCenter } from 'ol/extent';
import { ZsMapStateService } from '../state/state.service';
import { SessionService } from '../session/session.service';
import {
  EMBED_SOURCE,
  EmbedInboundMessage,
  EmbedOutboundMessage,
  ExternalLink,
} from './embed.protocol';

/**
 * Bridges zskarte to a host application when it runs embedded (an iframe whose URL carries the
 * `embedded` query parameter). It is a no-op when zskarte runs standalone, so the regular app is
 * never affected.
 *
 * Responsibilities:
 * - tell the host when the selected signature changes,
 * - let the host select a signature and pan the map to it,
 * - hold the host-provided {@link ExternalLink external links} and relay "open" requests back.
 *
 * See {@link './embed.protocol'} for the message contract.
 */
@Injectable({ providedIn: 'root' })
export class EmbedService {
  private _state = inject(ZsMapStateService);
  private _session = inject(SessionService);
  private _destroyRef = inject(DestroyRef);

  /** Whether zskarte runs embedded in a host application. */
  readonly isEmbedded = signal(false);

  /** Host-provided external links, keyed by signature (drawElement) id. */
  readonly externalLinks = signal<Record<string, ExternalLink[]>>({});

  /** Sets up the host bridge, but only when running in embedded mode. */
  initialize(): void {
    if (!EmbedService.detectEmbedded()) {
      return;
    }
    this.isEmbedded.set(true);
    // Marker class so global / host-context styles can adapt the layout for embedding.
    document.body.classList.add('zskarte-embedded');

    // Outbound: tell the host whenever the selected signature changes.
    this._state
      .observeSelectedFeature$()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((id) => this.post(EmbedOutboundMessage.SelectionChanged, { signatureId: id ?? null }));

    // Inbound: react to host commands.
    fromEvent<MessageEvent>(window, 'message')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event) => {
        if (event.data?.source !== EMBED_SOURCE) {
          return;
        }
        switch (event.data.type) {
          case EmbedInboundMessage.SelectSignature:
            this.selectSignature(event.data.payload?.signatureId);
            break;
          case EmbedInboundMessage.SetExternalLinks:
            this.externalLinks.set(event.data.payload?.links ?? {});
            break;
          case EmbedInboundMessage.RequestCurrentOperation:
            this.post(EmbedOutboundMessage.OperationOpened, {
              operationId: this._session.getOperationId() ?? null,
            });
            break;
        }
      });

    // Announce readiness so the host (re-)sends its current state.
    this.post(EmbedOutboundMessage.Ready, {});
  }

  /** The external links attached to the given signature, or null if none. */
  getExternalLinks(signatureId: string | undefined): ExternalLink[] | null {
    return signatureId ? (this.externalLinks()[signatureId] ?? null) : null;
  }

  /** Asks the host to open a specific external link of the given signature (by index). */
  requestOpenExternalLink(signatureId: string, linkIndex: number): void {
    this.post(EmbedOutboundMessage.OpenExternalLink, { signatureId, linkIndex });
  }

  private selectSignature(signatureId: string | undefined): void {
    if (!signatureId) {
      return;
    }
    this._state.setSelectedFeature(signatureId);
    const extent = this._state.getDrawElement(signatureId)?.getOlFeature()?.getGeometry()?.getExtent();
    if (extent) {
      this._state.setMapCenter(getCenter(extent));
    }
  }

  private post(type: EmbedOutboundMessage, payload: unknown): void {
    window.parent.postMessage({ source: EMBED_SOURCE, type, payload }, '*');
  }

  private static detectEmbedded(): boolean {
    try {
      return window.parent !== window.self && new URLSearchParams(window.location.search).has('embedded');
    } catch {
      // Cross-origin access to window.parent can throw; treat that as "not embedded".
      return false;
    }
  }
}
