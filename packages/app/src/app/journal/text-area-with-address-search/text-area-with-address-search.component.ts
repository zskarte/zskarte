import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SearchAutocompleteComponent } from 'src/app/search/search-autocomplete/search-autocomplete.component';
import {
  ADDRESS_TOKEN_REGEX,
  ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER,
  ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER_MISSING,
  SearchService,
  getGlobalAddressTokenRegex,
} from 'src/app/search/search.service';
import { I18NService } from 'src/app/state/i18n.service';
import { ZsMapStateService } from 'src/app/state/state.service';
import {
  IResultSet,
  IZsGlobalSearchConfig,
  IZsJournalMessageEditConfig,
  IZsMapSearchResult,
} from '../../../../../types/state/interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { ContenteditableComponent } from 'src/app/contenteditable/contenteditable.component';
import { debounceLeading } from 'src/app/helper/debounce';

@Component({
  selector: 'app-text-area-with-address-search',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    SearchAutocompleteComponent,
    MatAutocompleteModule,
    OverlayModule,
    ContenteditableComponent,
  ],
  templateUrl: './text-area-with-address-search.component.html',
  styleUrl: './text-area-with-address-search.component.scss',
})
export class TextAreaWithAddressSearchComponent {
  private _state = inject(ZsMapStateService);
  private _search = inject(SearchService);
  i18n = inject(I18NService);
  label = input<string>('');
  messageContentControl = input<FormControl>(new FormControl());

  readonly addressSearchTerm = signal('');
  readonly addressSelection = signal(false);
  readonly foundLocations = signal<IResultSet[]>([]);
  readonly autocompleteTrigger = viewChild.required(MatAutocompleteTrigger);
  readonly addresSearchField = viewChild.required<ElementRef<HTMLInputElement>>('addresSearchField');

  readonly formVisible = signal(false);
  readonly showAllAddresses = signal(false);
  readonly showLinkedText = signal(true);
  readonly textContentInput = viewChild.required<ElementRef<HTMLTextAreaElement>>('textContent');
  readonly linkedTextContent = viewChild.required<ContenteditableComponent>('linkedTextContent');
  textContentSelectedArea: [number, number] = [0, 0];
  settingsVisible = false;

  private addrEditElem: HTMLElement | null = null;
  addressSelectionPosition = { x: 0, y: 0 };
  formattingRules: {
    regex: RegExp;
    replacement?: string;
    replacementFunc?: (match, ...args) => string;
    editBlocked: boolean;
  }[] = [
    {
      regex: getGlobalAddressTokenRegex(),
      replacementFunc: (match, p1, p2) =>
        p2 ? ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER(p1, p2) : ADDRESS_TOKEN_REPLACEMENT_EDIT_MARKER_MISSING(p1),
      editBlocked: true,
    },
  ];

  constructor(private elementRef: ElementRef) {
    const config = this._state.getJournalMessageEditConfig();
    if (config) {
      this.showAllAddresses.set(config.showAllAddresses);
      this.showLinkedText.set(config.showLinkedText);
    }

    effect(() => {
      const showMap =
        this.formVisible() && (this.addressSelection() || this._search.addressPreview() || this.showAllAddresses());
      this._state.setJournalAddressPreview(showMap);
    });
    effect(() => {
      if (!this.addressSelection()) {
        if (this.addrEditElem) {
          this.addrEditElem.classList.remove('edit-active');
          this.addrEditElem = null;
        }
      }
    });
    effect(() => {
      //do not call `this.updateShownFeature();` here as this would not get triggered by angular's effect logic
      if (this.formVisible() && this.showAllAddresses()) {
        this._search.showAllFeature(this.messageContentControl().value, true);
      } else {
        this._state.updateSearchResultFeatures([]);
      }
      //close settings view on change
      this.settingsVisible = false;
    });
    effect(() => {
      //if showLinkedText is updated
      this.showLinkedText();
      const formControl = this.messageContentControl();
      if (formControl) {
        //make sure displayed value is updated if changed in other view
        const value = formControl.value;
        formControl.setValue(value);
      }
      //close settings view on change
      this.settingsVisible = false;
    });
    effect(() => {
      const config: IZsJournalMessageEditConfig = {
        showAllAddresses: this.showAllAddresses(),
        showLinkedText: this.showLinkedText(),
      };
      this._state.setJournalMessageEditConfig(config);
    });
    this._state.observeJournalMessageEditConfig().subscribe((config: IZsJournalMessageEditConfig) => {
      if (config) {
        this.showAllAddresses.set(config.showAllAddresses);
        this.showLinkedText.set(config.showLinkedText);
      }
    });

    //handle address search
    const searchConfig = this._state.getSearchConfig();
    const { searchResults$, updateSearchTerm, updateSearchConfig } = this._search.createSearchInstance(searchConfig);

    this._state.observeSearchConfig().subscribe((config: IZsGlobalSearchConfig) => {
      if (!config.filterMapSection && !config.filterByDistance && !config.filterByArea && !config.sortedByDistance) {
        //fallback config: sort by distance if nothing set
        updateSearchConfig({ ...config, sortedByDistance: true });
      } else {
        updateSearchConfig(config);
      }
    });
    effect(() => {
      updateSearchTerm(this.addressSearchTerm());
    });

    searchResults$.subscribe((newResultSets) => {
      if (newResultSets === null) {
        //request aborted by new search
        return;
      }

      this.foundLocations().forEach((s) => s.results.forEach((x) => x.feature?.unset('ZsMapSearchResult')));
      newResultSets.forEach((s) => s.results.forEach((x) => x.feature?.set('ZsMapSearchResult', true)));
      if (newResultSets.length > 3) {
        newResultSets.forEach((s) => (s.collapsed = true));
      }
      this.foundLocations.set(newResultSets);
      this.autocompleteTrigger().openPanel();
    });
  }

  @HostListener('window:keydown.Escape', ['$event'])
  abortOnEsc(event: KeyboardEvent) {
    if (this.addressSelection()) {
      this.autocompleteTrigger().closePanel();
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        if (!this.showLinkedText()) {
          this.textContentInput().nativeElement.focus();
        } else {
          if (this.addrEditElem) {
            this.linkedTextContent().handleBlockSelection(this.addrEditElem);
            this.removeCaret();
          }
          this.linkedTextContent().inputField().nativeElement.focus();
        }
        this.addressSelection.set(false);
      });
      this.updateShownFeature();
    } else if (this._search.addressPreview()) {
      this._search.addressPreview.set(false);
      this.updateShownFeature();
      event.preventDefault();
      event.stopPropagation();
    }
  }

  updateShownFeature = debounceLeading(
    async () => {
      if (!this.addressSelection()) {
        if (this.formVisible() && this.showAllAddresses()) {
          this._search.showAllFeature(this.messageContentControl().value, true);
        } else {
          this._state.updateSearchResultFeatures([]);
        }
        return true;
      }
      return false;
    },
    2000,
    this,
  );

  public formClosed() {
    this.addressSelection.set(false);
    this._search.addressPreview.set(false);
    this.formVisible.set(false);
  }

  async onKeyDownText(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      //abort address search, not close form
      this.abortOnEsc(event);
      return;
    }
    //use intelisense keystroke to start address search
    if (event.ctrlKey && event.key === ' ') {
      this.handleTextSelection(event, false);
    }
  }

  onDoubleClickText(event: MouseEvent) {
    this.handleTextSelection(event, true);
  }

  private handleTextSelection(event: Event, onlyAddressBlock: boolean) {
    const textarea = this.textContentInput().nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let selectedText = text.substring(start, end);

    //check if text cursor is on/inside textToken
    let foundTextToken = false;
    if (!ADDRESS_TOKEN_REGEX.test(selectedText)) {
      let match: RegExpExecArray | null;
      const regex = getGlobalAddressTokenRegex();
      while ((match = regex.exec(text)) !== null) {
        if (match.index <= start && match.index + match[0].length >= start) {
          foundTextToken = true;
          selectedText = match[0];
          textarea.selectionStart = match.index;
          textarea.selectionEnd = match.index + match[0].length;
          break;
        }
      }
    }

    if (!foundTextToken && onlyAddressBlock) {
      return;
    }

    //if not, select current word
    if (!foundTextToken && start === end) {
      const beforeCursor = text.substring(0, start);
      const afterCursor = text.substring(end);

      const startOfWord = Math.max(beforeCursor.lastIndexOf(' ') + 1, beforeCursor.lastIndexOf('\n') + 1);
      const afterPos = Math.min(afterCursor.indexOf(' '), afterCursor.indexOf('\n'));
      const endOfWord = afterPos === -1 ? text.length : end + afterPos;

      selectedText = text.substring(startOfWord, endOfWord);
      textarea.selectionStart = startOfWord;
      textarea.selectionEnd = endOfWord;
    }

    this.textContentSelectedArea = [textarea.selectionStart, textarea.selectionEnd];
    const { address, locationInfo } = this._search.parseAddressToken(selectedText);
    this._search.showFeature(locationInfo);
    this.startEdit(address);
    event.preventDefault();
    event.stopPropagation();
  }

  onInputText() {
    const textarea = this.textContentInput().nativeElement;
    const cursorPosition = textarea.selectionStart || 0;
    if (cursorPosition >= 5 && textarea.value.slice(cursorPosition - 5, cursorPosition) === 'addr:') {
      textarea.selectionStart = cursorPosition - 5;
      textarea.selectionEnd = cursorPosition;
      this.textContentSelectedArea = [textarea.selectionStart, textarea.selectionEnd];
      this.startEdit('');
    } else {
      this.updateShownFeature();
    }
  }

  previewCoordinate(element: IZsMapSearchResult | null) {
    this._search.highlightResult(element, false);
  }

  useResult(value: IZsMapSearchResult) {
    const addressToken = value.internal?.addressToken;
    if (this.showLinkedText()) {
      if (addressToken) {
        this.linkedTextContent().replaceToken(this.addrEditElem, addressToken);
      }
    } else {
      const textarea = this.textContentInput().nativeElement;
      if (addressToken) {
        [textarea.selectionStart, textarea.selectionEnd] = this.textContentSelectedArea;
        textarea.setRangeText(addressToken);
        textarea.selectionStart = textarea.selectionEnd = textarea.selectionStart + addressToken.length;
        this.messageContentControl().setValue(textarea.value);
      }
      setTimeout(() => {
        textarea.focus();
      });
    }
    this.addressSelection.set(false);
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });

    this.updateShownFeature();
  }

  onKeydownAddressSearch(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      //prevent form submit
      event.preventDefault();
    } else if (event.key === 'Escape') {
      //abort address search, not close form
      this.abortOnEsc(event);
    }
  }

  private startEdit(address: string) {
    if (this.showLinkedText()) {
      this.setInputFieldPositionEditElem();
    }
    this.addressSelection.set(true);
    this._search.addressPreview.set(false);
    this.addressSearchTerm.set(address);
    this.autocompleteTrigger().openPanel();
    setTimeout(() => {
      this.addresSearchField().nativeElement.focus();
    });
  }

  //adjusted logic Methods for formatedText

  onInputFormatedText(onlyAddrKeyword = true) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const cursorPosition = range.endOffset || range.startOffset || 0;
      if (
        cursorPosition >= 5 &&
        range.startContainer.textContent?.slice(cursorPosition - 5, cursorPosition) === 'addr:'
      ) {
        range.setStart(range.startContainer, cursorPosition - 5);
        range.setEnd(range.startContainer, cursorPosition);
        range.deleteContents();
        this.insertCaret(range, '');
        this.startEdit('');
        return;
      }
    }
    if (onlyAddrKeyword) {
      this.updateShownFeature();
      return;
    }

    //check inside block to edit
    const block = this.linkedTextContent().getCurrentBlock();
    if (block) {
      const addrElem = block.querySelector('.addr-geo');
      if (addrElem) {
        this.editAddr(addrElem as HTMLElement);
        return;
      }
    }

    let selectedText = '';
    if (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer === range.endContainer) {
      const text = range.startContainer.textContent ?? '';
      const start = range.startOffset;
      const end = range.endOffset;

      let insertStart: number;
      let insertEnd: number;
      if (!range.collapsed) {
        // There is a selection: use the selected text
        selectedText = text.substring(start, end);
        insertStart = start;
        insertEnd = end;
      } else {
        // No selection: find word under cursor
        const beforeCursor = text.substring(0, start);
        const afterCursor = text.substring(end);

        // Find last space or line break before the cursor
        const lastSpace = Math.max(beforeCursor.lastIndexOf(' '), beforeCursor.lastIndexOf('\n'));
        insertStart = lastSpace + 1;

        // Find first space or line break after the cursor
        let afterSpace = afterCursor.search(/[ \n]/);
        if (afterSpace === -1) afterSpace = afterCursor.length;
        insertEnd = end + afterSpace;

        selectedText = text.substring(insertStart, insertEnd);
      }

      // Create a new range collapsed at the insertStart position
      const insertRange = document.createRange();
      insertRange.setStart(range.startContainer, insertStart);
      insertRange.setEnd(range.startContainer, insertEnd);
      insertRange.deleteContents();

      insertRange.collapse(true);
      this.insertCaret(range, selectedText);
      this.startEdit(selectedText);
      return;
    }

    //fallback empty text at current possition
    range.collapse(true);
    this.insertCaret(range, '');
    this.startEdit('');
  }

  private insertCaret(range: Range, text: string) {
    this.addrEditElem = document.createElement('span');
    this.addrEditElem.className = 'addr-caret';
    this.addrEditElem.textContent = text || '';
    range.insertNode(this.addrEditElem);
  }

  private removeCaret() {
    if (this.addrEditElem?.classList.contains('addr-caret')) {
      const prev = this.addrEditElem.previousSibling;
      const next = this.addrEditElem.nextSibling;
      const text = this.addrEditElem.textContent || '';
      this.addrEditElem.remove();
      this.linkedTextContent().mergeTextNodes(prev, text, next);
    }
  }

  async onKeyDownFormatedText(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      //abort address search, not close form
      this.abortOnEsc(event);
      return;
    }
    //use intelisense keystroke to start address search
    if (event.ctrlKey && event.key === ' ') {
      this.onInputFormatedText(false);
    }
    this.updateShownFeature();
  }

  setInputFieldPositionEditElem() {
    if (this.addrEditElem) {
      const rect = this.addrEditElem.getBoundingClientRect();

      // calc relative pos
      const parentRect = this.elementRef.nativeElement.getBoundingClientRect();
      if (parentRect) {
        this.addressSelectionPosition.x = rect.left - parentRect.left;
        this.addressSelectionPosition.y = rect.top - parentRect.top;
      }
    } else {
      this.setInputFieldPositionSelection();
    }
  }

  setInputFieldPositionSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // calc relative pos
    const parentRect = this.elementRef.nativeElement.getBoundingClientRect();
    if (parentRect) {
      this.addressSelectionPosition.x = rect.left - parentRect.left;
      this.addressSelectionPosition.y = rect.top - parentRect.top;
    }
  }

  async handleTextContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const addrElem = target.closest('.addr-geo') as HTMLElement;
    if (addrElem) {
      event.preventDefault();
      if (target.closest('.addr-edit')) {
        this.editAddr(addrElem);
        return;
      } else if (target.closest('.addr-show')) {
        const geo = addrElem.dataset['geo'];
        const feature = await this._search.showFeature(geo);
        if (feature) {
          this._search.addressPreview.set(true);
          this.addressSelection.set(false);
          return;
        }
      }
      if (event.detail === 2) {
        //double click
        return;
      }
    }
    if (!target.closest('.addresSearch')) {
      this._search.addressPreview.set(false);
      this.removeCaret();
      this.addressSelection.set(false);
      this.updateShownFeature();
    }
  }

  async handleTextContentDblClick(event: Event) {
    const target = event.target as HTMLElement;
    const addrElem = target.closest('.addr-geo') as HTMLElement;
    if (addrElem) {
      event.preventDefault();
      this.editAddr(addrElem);
      return;
    }
    this._search.addressPreview.set(false);
    this.addressSelection.set(false);
    this.updateShownFeature();
  }

  private async editAddr(addrElem: HTMLElement) {
    const geo = addrElem.dataset['geo'];
    await this._search.showFeature(geo);
    const textEl = addrElem.querySelector('.text') as HTMLElement;
    if (textEl) {
      this.addrEditElem = addrElem;
      this.addrEditElem.classList.add('edit-active');
      this.startEdit(textEl.innerText);
    }
  }
}
