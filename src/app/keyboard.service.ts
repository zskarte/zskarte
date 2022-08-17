import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class KeyboardHandler {
  private allHandlers: KeyboardHandlerContainer[] = [];

  public get handlers() {
    return this.allHandlers;
  }

  public subscribe(...handlers: KeyboardHandlerContainer[]) {
    for (const handler of handlers) {
      if (this.allHandlers.findIndex((h) => h.isEqual(handler)) !== -1) {
        return;
      }

      this.allHandlers.push(handler);
    }
  }

  public unsubscribe(handler: KeyboardHandlerContainer) {
    const index = this.allHandlers.findIndex((h) => h.isEqual(handler));

    if (index === -1) {
      return;
    }

    this.allHandlers.splice(index, 1);
  }

  onKeyDown(e: KeyboardEvent) {
    const globalEvent = e.target instanceof HTMLBodyElement;

    console.log(e);
    console.log(this.allHandlers);

    const event = this.allHandlers.find(
      (h) =>
        (h.code === e.code || h.code === e.key) &&
        h.altKey === e.altKey &&
        h.shiftKey === e.shiftKey &&
        h.ctrlKey === e.ctrlKey
    );

    event?.callback(globalEvent);
  }
}

export class KeyboardHandlerContainer {
  public code: string;
  public callback: (global: boolean) => void;
  public altKey: boolean;
  public shiftKey: boolean;
  public ctrlKey: boolean;
  public description: string;
  public group?: string;

  constructor(
    code: string,
    callback: (global: boolean) => void,
    description: string,
    group?: string,
    altKey = false,
    shiftKey = false,
    ctrlKey = false
  ) {
    this.code = code;
    this.callback = callback;
    this.group = group;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    this.ctrlKey = ctrlKey;
    this.description = description;
  }

  public isEqual(other: KeyboardHandlerContainer) {
    return (
      this.code === other.code &&
      this.altKey === other.altKey &&
      this.shiftKey === other.shiftKey &&
      this.ctrlKey === other.ctrlKey &&
      this.group === other.group
    );
  }

  public keysToString(): string {
    const ctrl = this.ctrlKey ? 'CTRL+' : '';
    const shift = this.shiftKey ? 'SHIFT+' : '';
    const alt = this.altKey ? 'ALT+' : '';

    return ctrl + shift + alt + this.code.toUpperCase().replace('KEY', '');
  }
}
