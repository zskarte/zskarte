/**
 * Message protocol for zskarte's embedded mode.
 *
 * When zskarte runs inside a host application (an iframe with `?embedded` in its URL), it
 * exchanges `window.postMessage` messages with that host. All messages are tagged with
 * {@link EMBED_SOURCE} so that unrelated `message` events are ignored on both sides.
 *
 * The protocol is deliberately host-agnostic: zskarte never learns what an "external link"
 * actually points to. The host attaches an opaque label to a signature and is notified when
 * the user asks to open it — resolving and navigating is entirely the host's concern.
 */

/** Discriminator present on every embed message, in both directions. */
export const EMBED_SOURCE = 'zskarte-embed';

/** Messages sent from zskarte to the host. */
export enum EmbedOutboundMessage {
  /** zskarte has booted and is ready to receive host state. */
  Ready = 'ready',
  /** The selected signature changed (or was cleared). Payload: `{ signatureId: string | null }`. */
  SelectionChanged = 'selectionChanged',
  /**
   * The user asked to open one of a signature's external links.
   * Payload: `{ signatureId: string, linkIndex: number }` — `linkIndex` is the position in the
   * signature's link array (a signature can carry several links).
   */
  OpenExternalLink = 'openExternalLink',
  /**
   * Reports the currently open operation (map), in reply to
   * {@link EmbedInboundMessage.RequestCurrentOperation}. Payload: `{ operationId: string | null }`.
   */
  OperationOpened = 'operationOpened',
}

/** Messages sent from the host to zskarte. */
export enum EmbedInboundMessage {
  /** Select a signature and pan the map to it. Payload: `{ signatureId: string }`. */
  SelectSignature = 'selectSignature',
  /** Replace the set of external links. Payload: `{ links: Record<string, ExternalLink[]> }`. */
  SetExternalLinks = 'setExternalLinks',
  /**
   * Ask which operation (map) is currently open. zskarte replies with an
   * {@link EmbedOutboundMessage.OperationOpened} message ({@code operationId} is `null` if none
   * is open). Payload: none.
   */
  RequestCurrentOperation = 'requestCurrentOperation',
}

/** A host-provided link attached to a signature (drawElement). */
export interface ExternalLink {
  /** Human-readable label shown on the signature's "open" button. */
  label: string;
}

/** The envelope every embed message is wrapped in. */
export interface EmbedMessage {
  source: typeof EMBED_SOURCE;
  type: EmbedOutboundMessage | EmbedInboundMessage;
  payload?: unknown;
}
