import { Injectable } from '@angular/core';
import { ADDRESS_TRIGGER_CHAR } from '../search/address-trigger';
import { ADDRESS_TOKEN_REGEX } from '../search/search.service';
import Quill from 'quill';
import { Blot } from 'parchment';
const Delta = Quill.import('delta');

import { AddressTokenBlot } from './address-token.blot';
import { PlaceholderBlot } from './placeholder.blot';
import { PlainTextWithAddressTokenClipboard } from './plain-text-address-token-clipboard';
Quill.register(AddressTokenBlot, true);
Quill.register(PlaceholderBlot, true);
Quill.register('modules/clipboard', PlainTextWithAddressTokenClipboard, true);

@Injectable({ providedIn: 'root' })
export class QuillBlotService {
  private quill: Quill | null = null;
  private placeholderIndex: number | null = null;

  setQuillInstance(quill: Quill) {
    this.quill = quill;
  }

  getQuillInstance(): Quill | null {
    return this.quill;
  }

  insertAddressToken(address: string, option?: string) {
    if (!this.quill) return;
    const range = this.quill.getSelection(true);
    if (range) {
      if (range.length > 0) {
        this.quill.deleteText(range.index, range.length, Quill.sources.USER);
      }
      this.quill.insertEmbed(range.index, 'addressToken', { address, option }, Quill.sources.USER);
      // after insert a blockBlot quill still have cursor problems...
      this.quill.insertText(range.index + 1, '\u200B', Quill.sources.USER);
      this.quill.setSelection(range.index + 2, 0, Quill.sources.USER);
      this.quill.deleteText(range.index + 1, 1, Quill.sources.USER);
    }
  }

  updateAddressToken(node: HTMLElement, newAddress: string, newOption?: string) {
    if (!this.quill) return;
    const blot = Quill.find(node) as any;
    if (typeof blot?.offset !== 'function') return;
    const index = blot.offset(this.quill.scroll);
    this.quill.deleteText(index, 1, Quill.sources.USER);
    this.quill.insertEmbed(index, 'addressToken', { address: newAddress, option: newOption }, Quill.sources.USER);
    // after insert a blockBlot quill still have cursor problems...
    this.quill.insertText(index + 1, '\u200B', Quill.sources.USER);
    this.quill.setSelection(index + 2, 0, Quill.sources.USER);
    this.quill.deleteText(index + 1, 1, Quill.sources.USER);
  }

  insertPlaceholderBlot(width = 300, height = 19) {
    if (!this.quill) return;
    this.removePlaceholderBlot();
    const range = this.quill.getSelection(true);
    if (range) {
      let selectedText = '';
      if (range.length > 0) {
        selectedText = this.quill.getText(range.index, range.length);
        this.quill.deleteText(range.index, range.length, Quill.sources.USER);
      }
      this.quill.insertEmbed(range.index, 'placeholderBlot', { width, height, text: selectedText }, Quill.sources.USER);
      this.placeholderIndex = range.index;
      this.quill.setSelection(this.placeholderIndex, 1, Quill.sources.USER);
    }
  }

  removePlaceholderBlot() {
    if (!this.quill || this.placeholderIndex == null) return;
    //getLeaf get always the one left from cursor
    const [blot] = this.quill.getLeaf(this.placeholderIndex + 1);
    if (
      blot &&
      (blot.statics?.blotName === 'placeholderBlot' || (blot as any).constructor?.blotName === 'placeholderBlot')
    ) {
      let value = (blot as any).value ? (blot as any).value() : {};
      if (value.placeholderBlot) {
        value = value.placeholderBlot;
      }
      const text = value.text || '';
      this.quill.deleteText(this.placeholderIndex, 1, Quill.sources.USER);
      if (text) {
        this.quill.insertText(this.placeholderIndex, text, Quill.sources.USER);
        this.quill.setSelection(this.placeholderIndex, text.length, Quill.sources.USER);
      }
    }
    this.placeholderIndex = null;
  }

  getRelativeSelectionPosition(parentElement: HTMLElement, width = 300, height = 19): { x: number; y: number } | null {
    if (!this.quill) return null;
    this.insertPlaceholderBlot(width, height);

    const selection = this.quill.getSelection();
    if (!selection) return null;

    const bounds = this.quill.getBounds(selection.index, selection.length);
    if (!bounds) return null;

    const editorRect = this.quill.root?.getBoundingClientRect();
    if (!editorRect) return null;

    const parentRect = parentElement?.getBoundingClientRect();
    if (!parentRect) return null;

    return {
      x: editorRect.left + bounds.left - parentRect.left,
      y: editorRect.top + bounds.top - parentRect.top - 2,
    };
  }

  isAddressBlot(blot: Blot | null): blot is Blot {
    return (
      !!blot && (blot.statics?.blotName === 'addressToken' || (blot as any).constructor?.blotName === 'addressToken')
    );
  }

  getAddressEdit(onlyAddrKeyword = true): { text: string; blotElem?: HTMLElement } | null {
    if (!this.quill) return null;
    const range = this.quill.getSelection();
    if (!range) return null;

    // use text only selection if any
    if (!onlyAddrKeyword && range.length > 0) {
      let onlyText = true;
      this.quill.getContents(range.index, range.length).ops.forEach((op) => {
        if (typeof op.insert !== 'string') {
          onlyText = false;
        }
      });
      if (onlyText) {
        return { text: this.quill.getText(range.index, range.length) };
      }
    }

    const cursor = range.index + range.length;
    if (cursor >= 1) {
      const prevChar = this.quill.getText(cursor - 1, 1);
      const prevPrevChar = cursor >= 2 ? this.quill.getText(cursor - 2, 1) : '';
      if (prevChar === ADDRESS_TRIGGER_CHAR && (cursor === 1 || /\s/.test(prevPrevChar))) {
        this.quill.deleteText(cursor - 1, 1, Quill.sources.USER);
        return { text: '' };
      }
      const currentChar = this.quill.getText(cursor, 1);
      if (currentChar === ADDRESS_TRIGGER_CHAR && /\s/.test(prevChar)) {
        this.quill.deleteText(cursor, 1, Quill.sources.USER);
        return { text: '' };
      }
    }
    if (cursor === 0 && this.quill.getText(0, 1) === ADDRESS_TRIGGER_CHAR) {
      this.quill.deleteText(0, 1, Quill.sources.USER);
      return { text: '' };
    }
    const [blot, offset] = this.quill.getLeaf(cursor);
    if (blot) {
      //check if left of cursor is a AddressToken
      if (!onlyAddrKeyword && this.isAddressBlot(blot)) {
        return { text: (blot.domNode as HTMLElement).innerText, blotElem: blot.domNode as HTMLElement };
      }
      //check if inside text and there stand " @" left of cursor
      if (blot.statics?.blotName === 'text' || (blot as any).constructor?.blotName === 'text') {
        const text = (blot as any).text as string;
        if (offset >= 1) {
          const prevChar = text.charAt(offset - 1);
          const prevPrevChar = offset >= 2 ? text.charAt(offset - 2) : '';
          if (prevChar === ADDRESS_TRIGGER_CHAR && (offset === 1 || /\s/.test(prevPrevChar))) {
            const blotStart = blot.offset(this.quill.scroll);
            this.quill.deleteText(blotStart + offset - 1, 1, Quill.sources.USER);
            return { text: '' };
          }
        }
        if (onlyAddrKeyword) {
          return null;
        }
        //check if stand at end of text and there is a space and next one is AddressToken
        if (text.charAt(offset - 1) === ' ' && text.length === offset) {
          const [blot, offset] = this.quill.getLeaf(cursor + 1);
          if (this.isAddressBlot(blot)) {
            return { text: (blot.domNode as HTMLElement).innerText, blotElem: blot.domNode as HTMLElement };
          }
        }
        //find word under cursor
        const left = text.slice(0, offset);
        const leftMatch = left.match(/[\s]?([^\s]*)$/);
        const wordStart = leftMatch ? offset - (leftMatch[1]?.length ?? 0) : offset;

        const right = text.slice(offset);
        const rightMatch = right.match(/^([^\s]*)/);
        const wordEnd = offset + (rightMatch ? (rightMatch[1]?.length ?? 0) : 0);

        const selectedText = text.substring(wordStart, wordEnd);
        const blotStart = blot.offset(this.quill.scroll);
        this.quill.setSelection(blotStart + wordStart, wordEnd - wordStart, Quill.sources.USER);
        return { text: selectedText };
      }
    }
    if (!onlyAddrKeyword) {
      return { text: '' };
    }
    return null;
  }

  handleDeleteOrBackspace(range: any, direction: 'backward' | 'forward'): boolean {
    if (!this.quill) return true;
    if (range.length >= 1) {
      return true;
    }
    //getLeaf get always the one left from cursor
    const blotIndex = direction === 'backward' ? range.index : range.index + 1;
    if (blotIndex < 0) {
      return true;
    }
    const [blot] = this.quill.getLeaf(blotIndex);
    if (!blot) {
      return true;
    }
    if (blot.statics?.blotName === 'addressToken' || (blot as any).constructor?.blotName === 'addressToken') {
      const blotStart = blot.offset(this.quill.scroll);
      const blotEnd = blotStart + blot.length();
      if (
        (direction === 'backward' && range.index === blotEnd) ||
        (direction === 'forward' && range.index === blotStart)
      ) {
        this.quill.setSelection(blotStart, 1, Quill.sources.USER);
        return false;
      }
    }
    return true;
  }

  extractPlaintextFromDelta(delta: any): string {
    let result = '';
    for (const op of delta.ops) {
      if (typeof op.insert === 'string') {
        result += op.insert;
      } else if (op.insert.addressToken) {
        const { address, option } = op.insert.addressToken;
        result += `addr:(${address})${option ? `[${option}]` : ''}`;
      } else if (op.insert.placeholderBlot) {
        result += op.insert.placeholderBlot.text || '';
      }
    }
    return result;
  }

  static plaintextToDelta(text: string): any {
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const ops: any[] = [];
    const regex = new RegExp(ADDRESS_TOKEN_REGEX.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        ops.push({ insert: text.slice(lastIndex, match.index) });
      }
      ops.push({
        insert: {
          addressToken: {
            address: match[1],
            option: match[2] || null,
          },
        },
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      ops.push({ insert: text.slice(lastIndex) });
    }
    return { ops };
  }

  static handlePaste(selection: { index: number; length: number }, data: { html: string; text: string }, quill: Quill) {
    if (!quill) return;
    const text = data.text || '';
    const index = selection ? selection.index : 0;
    const insertDelta = this.plaintextToDelta(text);
    const delta = new Delta().retain(index).concat(insertDelta);
    quill.updateContents(delta, 'user');
    quill.setSelection(index + this.getDeltaLength(insertDelta), 0);

    // inform done the past for my own
    return false;
  }

  static getDeltaLength(delta: any): number {
    if (!delta || !delta.ops) return 0;
    return delta.ops.reduce((sum, op) => {
      if (typeof op.insert === 'string') return sum + op.insert.length;
      return sum + 1;
    }, 0);
  }

  handleCopy(event: ClipboardEvent) {
    if (!this.quill || !event.clipboardData) return;
    event.preventDefault();
    const selection = this.quill.getSelection();
    if (selection) {
      const delta = this.quill.getContents(selection.index, selection.length);
      const customText = this.extractPlaintextFromDelta(delta);
      event.clipboardData.setData('text/plain', customText);
    }
  }
}
