import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, viewChild } from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { debounce } from '../helper/debounce';
import { SearchService } from '../search/search.service';

@Component({
  selector: 'app-contenteditable',
  templateUrl: './contenteditable.component.html',
  styleUrls: ['./contenteditable.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: ContenteditableComponent,
    },
  ],
})
export class ContenteditableComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {
  readonly inputField = viewChild.required<ElementRef<HTMLElement>>('inputField');
  static nextId = 0;
  @HostBinding() id = `contenteditable-${ContenteditableComponent.nextId++}`;

  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() formattingRules: {
    regex: RegExp;
    replacement?: string;
    replacementFunc?: (match, ...args) => string;
    editBlocked: boolean;
  }[] = [];

  private _value: string | null = null;
  get value() {
    return this._value;
  }
  set value(val: string | null) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
      this.stateChanges.next();
    }
  }
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'contenteditable-div';

  constructor(
    private focusMonitor: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>,
    public ngControl: NgControl,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    focusMonitor.monitor(elementRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  // MatFormFieldControl Methods
  get empty(): boolean {
    return !this.value || this.value.trim().length === 0;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  setDescribedByIds(ids: string[]): void {
    const controlElement = this.inputField().nativeElement;
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    this.inputField().nativeElement.focus();
  }

  // ControlValueAccessor Methods
  writeValue(value: string | null): void {
    if (this.value !== value) {
      const htmlValue = value ? this.formatText(value) : '';
      const controlElement = this.inputField().nativeElement;
      if (controlElement) {
        controlElement.innerHTML = htmlValue;
      }
      this._value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    const controlElement = this.inputField().nativeElement;
    if (controlElement) {
      controlElement.setAttribute('contenteditable', (!isDisabled).toString());
    }
    this.stateChanges.next();
  }

  private onChange = (value: any) => {};

  onTouched = () => {};

  // Formatting Methods

  private convertLinebreaksAndSpaces(plainText: string) {
    //replacing newlines with <div> and make sure spaces are preserved
    const converted = plainText
      .split('\n')
      .map(
        (line) =>
          line.length === 0
            ? '<br>'
            : line
                .replace(/^ +/g, (match) => match.replace(/ /g, '&nbsp;')) // replace space at start of line with &nbsp;
                .replace(/ ( +?)( ?)$/g, (_, group1, group2) => ` ${group1.replace(/ /g, '&nbsp;')}${group2}`), // and at end (not first and last)
      )
      .join('</div><div>');
    if (plainText.indexOf('\n') !== -1) {
      return `<div>${converted}</div>`;
    } else {
      return converted;
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const plainText = clipboardData?.getData('text/plain') || '';
    this.insertText(plainText);
  }

  public insertText(plainText: string) {
    const formatedText = this.formatText(plainText);

    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const positionMarker = document.createElement('span');
      range.insertNode(positionMarker);
      positionMarker.insertAdjacentHTML('beforebegin', formatedText);
      const insertedEl = positionMarker.previousElementSibling?.previousElementSibling;
      if (insertedEl) {
        setTimeout(() => {
          this.handleBlockNavigation(selection, insertedEl, false);
        });
      }
      positionMarker.remove();
      //force update control
      const value = this.extractRawTextFromNodes(this.elementRef.nativeElement);
      this.value = value;
    }
  }

  public replaceToken(addrEditElem: Element | null, addressToken: string) {
    if (addrEditElem) {
      this.handleBlockSelection(addrEditElem);
      this.insertText(addressToken);
      setTimeout(() => {
        this.inputField().nativeElement.focus();
      });
    } else {
      setTimeout(() => {
        this.inputField().nativeElement.focus();
        this.insertText(addressToken);
      });
    }
  }

  private formatText(rawText: string): string {
    //make sure there is no html
    let processedHtml = SearchService.escapeHtml(rawText);

    //apply all defined formating rules, and pack them additionally in a container to always have raw/unformated data also
    for (const rule of this.formattingRules) {
      processedHtml = processedHtml.replace(rule.regex, (match, ...group) => {
        let formattedPart: string;
        if (rule.replacementFunc) {
          formattedPart = rule.replacementFunc(match, ...group);
        } else if (rule.replacement) {
          formattedPart = match.replace(rule.regex, rule.replacement);
        } else {
          console.error('No replacement for rule:', rule);
          formattedPart = match;
        }
        let response = `<span ${rule.editBlocked ? 'contenteditable="false" ' : ''}class="formatted-block"><span class="formatted">${formattedPart}</span><span class="raw">${match}</span></span>`;
        if (rule.editBlocked) {
          //add marker span to allow edit at start/end of container element
          response = `<span class="start-marker">&#x200B;</span>${response}<span class="end-marker">&#x200B;</span>`;
        }
        return response;
      });
    }
    return this.convertLinebreaksAndSpaces(processedHtml);
  }

  private extractRawTextFromNodes(node: Node) {
    let rawText = '';
    if (node.nodeType === Node.TEXT_NODE) {
      rawText += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.classList.contains('raw')) {
        rawText += el.textContent || '';
      } else if (
        !el.classList.contains('formatted') &&
        !el.classList.contains('start-marker') &&
        !el.classList.contains('end-marker')
      ) {
        if (el.tagName === 'BR') {
          rawText += '\n';
        } else {
          let innerText = '';
          el.childNodes.forEach((node) => {
            innerText += this.extractRawTextFromNodes(node);
          });
          if (el.tagName === 'DIV' && !innerText.endsWith('\n')) {
            innerText += '\n';
          }
          rawText += innerText;
        }
      }
    }
    return rawText;
  }

  onInput = debounce(
    (event: Event) => {
      const target = event.target as Element;
      const value = this.extractRawTextFromNodes(target);
      this.value = value;
    },
    500,
    this,
  );

  // highlight full formatted block Methods

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.handleDeleteOrBackspace(event);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      this.handleArrowRightOrLeft(event);
    }
  }

  private verifyMarker(sibling: Node | null): sibling is HTMLElement {
    return (
      sibling != null &&
      sibling.nodeType === Node.ELEMENT_NODE &&
      ((sibling as HTMLElement).classList.contains('start-marker') ||
        (sibling as HTMLElement).classList.contains('end-marker'))
    );
  }

  private getInsideNotEditableBlock(block: Node | null) {
    if (block === null) {
      return null;
    }
    if (block.nodeType !== Node.ELEMENT_NODE) {
      block = block.parentElement;
    }
    const formattedBlock = (block as Element).closest('.formatted-block') as Element | null;
    if (formattedBlock?.getAttribute('contenteditable') === 'false') {
      return formattedBlock;
    }
    return null;
  }

  private handleDeleteOrBackspace(event: KeyboardEvent) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const startBlock = this.getInsideNotEditableBlock(range.startContainer);
    const endBlock = this.getInsideNotEditableBlock(range.endContainer);
    const startMarker =
      this.getMarkerInside(range.startContainer, 'start-marker') ||
      this.getMarkerRight(range.startContainer, range.startOffset, 'start-marker');
    const endMarker =
      this.getMarkerInside(range.endContainer, 'end-marker') ||
      this.getMarkerLeft(range.endContainer, range.endOffset, 'end-marker');
    if (!range.collapsed) {
      if (!startBlock && !endBlock && !startMarker && !endMarker) {
        //there is a selection just do default logic and delete it
        const prev = range.startContainer as ChildNode;
        const next = range.endContainer as ChildNode;
        setTimeout(() => {
          //after delete selecte node(s)/area, merge text nodes
          this.mergeTextNodes(prev, '', next);
        });
        return;
      } else if (startMarker && endMarker) {
        //already selected block with marker, delete it
        const prev = startMarker.previousSibling;
        const next = endMarker.nextSibling;
        setTimeout(() => {
          //after delete selecte node, merge text nodes
          this.mergeTextNodes(prev, '', next);
        });
        return;
      }
    }

    //check if try to remove a not editable formatted block, and if so instead select it
    if (startBlock) {
      event.preventDefault();
      this.handleBlockAreaSelection(startBlock);
    } else if (endBlock) {
      event.preventDefault();
      this.handleBlockAreaSelection(endBlock);
    } else if (startMarker?.nextElementSibling && event.key !== 'Backspace') {
      event.preventDefault();
      this.handleBlockAreaSelection(startMarker.nextElementSibling);
    } else if (endMarker?.previousElementSibling && event.key !== 'Delete') {
      event.preventDefault();
      this.handleBlockAreaSelection(endMarker.previousElementSibling);
    }
  }

  private handleArrowRightOrLeft(event: KeyboardEvent) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      //check marker
      if (event.key === 'ArrowLeft') {
        const marker = this.getEndMarkerLeft(selection);
        if (marker?.previousElementSibling?.previousElementSibling) {
          this.handleBlockNavigation(selection, marker.previousElementSibling.previousElementSibling, true);
          event.preventDefault();
        }
      } else {
        const marker = this.getStartMarkerRight(selection);
        if (marker?.nextElementSibling?.nextElementSibling) {
          this.handleBlockNavigation(selection, marker.nextElementSibling.nextElementSibling, false);
          event.preventDefault();
        }
      }
      //nothing selected do default logik
      return;
    }

    const startBlock = this.getInsideNotEditableBlock(range.startContainer);
    const endBlock = this.getInsideNotEditableBlock(range.endContainer);
    const startMarker =
      this.getMarkerInside(range.startContainer, 'start-marker') ||
      this.getMarkerRight(range.startContainer, range.startOffset, 'start-marker');
    const endMarker =
      this.getMarkerInside(range.endContainer, 'end-marker') ||
      this.getMarkerLeft(range.endContainer, range.endOffset, 'end-marker');
    if (!startBlock && !endBlock && !startMarker && !endMarker) {
      //there is a normal selection
      return;
    } else if (startMarker && endMarker) {
      //selected block with markers
      if (event.key === 'ArrowLeft') {
        selection.collapse(selection.anchorNode, selection.anchorOffset);
      } else {
        selection.collapse(selection.focusNode, selection.focusOffset);
      }
      return;
    }
  }

  public getCurrentBlock() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);

    //check if is inside / next to a not editable formatted block
    const startBlock = this.getInsideNotEditableBlock(range.startContainer);
    if (startBlock) {
      return startBlock;
    }
    const endBlock = this.getInsideNotEditableBlock(range.endContainer);
    if (endBlock) {
      return endBlock;
    }
    const startMarker =
      this.getMarkerInside(range.startContainer, 'start-marker') ||
      this.getMarkerRight(range.startContainer, range.startOffset, 'start-marker');
    if (startMarker?.nextElementSibling) {
      return startMarker.nextElementSibling;
    }
    const endMarker =
      this.getMarkerInside(range.endContainer, 'end-marker') ||
      this.getMarkerLeft(range.endContainer, range.endOffset, 'end-marker');

    if (endMarker?.previousElementSibling) {
      return endMarker.previousElementSibling;
    }
    return null;
  }

  // make sure never inside marker Methods

  @HostListener('document:selectionchange', ['$event'])
  onSelectionchange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return;

    // Check if selection is inside Component
    const editorElement = this.elementRef.nativeElement;
    const anchorNode = selection.anchorNode;
    if (anchorNode && editorElement.contains(anchorNode)) {
      // Only handle selection if it's inside the Component
      this.handleSelectionChangeInsideComponent(selection);
    }
  }

  private getMarkerInside(node: Node, markerClass: string) {
    // If caret is inside a text node
    const marker =
      node instanceof Element
        ? node.closest(`.${markerClass}`)
        : node.nodeType === Node.TEXT_NODE
          ? node.parentElement?.closest(`.${markerClass}`)
          : null;

    if (marker instanceof Element) {
      return marker;
    }
    return null;
  }

  private getMarkerRight(node: Node, offset: number, markerClass: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Check if caret is at the end of the text node and nextSibling is the marker
      if (
        offset === node.textContent?.length &&
        node.nextSibling instanceof Element &&
        node.nextSibling.classList.contains(markerClass)
      ) {
        return node.nextSibling;
      }
    } else if (node instanceof Element) {
      // If caret is in an element node, check if the next child is the marker
      const next = node.childNodes[offset];
      if (next instanceof Element && next.classList.contains(markerClass)) {
        return next;
      }
    }
    return null;
  }

  private getMarkerLeft(node: Node, offset: number, markerClass: string) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Check if caret is at the start of the text node and previousSibling is the marker
      if (
        offset === 0 &&
        node.previousSibling instanceof Element &&
        node.previousSibling.classList.contains(markerClass)
      ) {
        return node.previousSibling;
      }
    } else if (node instanceof Element) {
      // If caret is in an element node, check if the previous child is the marker
      if (
        offset > 0 // Must not be the first child
      ) {
        const prev = node.childNodes[offset - 1];
        if (prev instanceof Element && prev.classList.contains(markerClass)) {
          return prev;
        }
      }
    }
    return null;
  }

  private getEndMarkerInsideOrRight(selection: Selection) {
    const node = selection.anchorNode;
    if (!node) return null;

    return this.getMarkerInside(node, 'end-marker') || this.getMarkerRight(node, selection.anchorOffset, 'end-marker');
  }

  private getEndMarkerLeft(selection: Selection) {
    const node = selection.anchorNode;
    if (!node) return null;

    return this.getMarkerLeft(node, selection.anchorOffset, 'end-marker');
  }

  private getStartMarkerInsideOrLeft(selection: Selection) {
    const node = selection.anchorNode;
    if (!node) return null;

    return (
      this.getMarkerInside(node, 'start-marker') || this.getMarkerLeft(node, selection.anchorOffset, 'start-marker')
    );
  }

  private getStartMarkerRight(selection: Selection) {
    const node = selection.anchorNode;
    if (!node) return null;

    return this.getMarkerRight(node, selection.anchorOffset, 'start-marker');
  }

  private handleSelectionChangeInsideComponent(selection: Selection) {
    let marker = this.getEndMarkerInsideOrRight(selection);
    if (marker) {
      this.handleBlockNavigation(selection, marker, false);
    } else {
      marker = this.getStartMarkerInsideOrLeft(selection);
      if (marker) {
        this.handleBlockNavigation(selection, marker, true);
      }
    }
  }

  private handleBlockAreaSelection(block: Element) {
    const selection = window.getSelection();

    // create range that select block and markers
    const range = document.createRange();
    const prevSibling = block.previousSibling;
    const nextSibling = block.nextSibling;

    if (this.verifyMarker(prevSibling)) {
      range.setStartBefore(prevSibling);
    } else {
      range.setStartBefore(block);
    }

    if (this.verifyMarker(nextSibling)) {
      range.setEndAfter(nextSibling);
    } else {
      range.setEndAfter(block);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
    return range;
  }

  public handleBlockSelection(block: Element) {
    const selection = window.getSelection();

    const editableBlock = this.getInsideNotEditableBlock(block);
    if (editableBlock) {
      return this.handleBlockAreaSelection(editableBlock);
    }

    const range = document.createRange();
    range.setStartBefore(block);
    range.setEndAfter(block);

    selection?.removeAllRanges();
    selection?.addRange(range);
    return range;
  }

  private handleBlockNavigation(selection: Selection, block: Element, left: boolean) {
    const range = document.createRange();
    if (left) {
      range.setStartBefore(block);
      range.collapse(true);
    } else {
      range.setStartAfter(block);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  public mergeTextNodes(prev: ChildNode | null, innerText: string, next: ChildNode | null) {
    let rangeEl: Node | null = null;
    let rangeOffest = -1;
    if (innerText) {
      if (prev?.nodeType === Node.TEXT_NODE && prev.textContent !== null) {
        rangeEl = prev;
        rangeOffest = prev.textContent.length;
        prev.textContent += innerText;
      } else if (next?.nodeType === Node.TEXT_NODE && next.textContent !== null) {
        next.textContent = innerText + next.textContent;
        rangeEl = next;
        rangeOffest = 0;
      }
    }
    if (
      prev !== next &&
      prev?.nodeType === Node.TEXT_NODE &&
      prev.textContent &&
      next?.nodeType === Node.TEXT_NODE &&
      next.textContent
    ) {
      if (!rangeEl) {
        rangeEl = prev;
        rangeOffest = prev.textContent.length;
      }
      //merge text nodes
      prev.textContent += next.textContent;
      next.remove();
    }
    if (rangeEl) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStart(rangeEl, rangeOffest);
        if (innerText) {
          range.setEnd(rangeEl, rangeOffest + innerText.length);
        } else {
          range.collapse();
        }
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
}
