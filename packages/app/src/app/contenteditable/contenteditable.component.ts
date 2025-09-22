import Quill from 'quill';
import { Component, ElementRef, HostBinding, Input, OnDestroy, output } from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { debounce } from '../helper/debounce';
import { ContentChange, QuillModule } from 'ngx-quill';
import { QuillBlotService } from './quill-blot.service';

@Component({
  selector: 'app-contenteditable',
  templateUrl: './contenteditable.component.html',
  styleUrls: ['./contenteditable.component.scss'],
  imports: [FormsModule, QuillModule],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: ContenteditableComponent,
    },
  ],
})
export class ContenteditableComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {
  // default MatFormFieldControl/ControlValueAccessor meta logic
  static nextId = 0;
  @HostBinding() id = `contenteditable-${ContenteditableComponent.nextId++}`;

  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;

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

  content: any = { ops: [] };
  readonly quillClick = output<{ event: MouseEvent; quill: Quill }>();
  readonly quillDblclick = output<{ event: MouseEvent; quill: Quill }>();
  readonly quillKeydown = output<{ event: KeyboardEvent; quill: Quill }>();
  readonly quillContentChanged = output<ContentChange>();

  quillBindings = {
    backspace: {
      key: 'Backspace',
      handler: (range, context) => this.quillBlotService.handleDeleteOrBackspace(range, 'backward'),
    },
    delete: {
      key: 'Delete',
      handler: (range, context) => this.quillBlotService.handleDeleteOrBackspace(range, 'forward'),
    },
    tab: {
      key: 9,
      handler: () => true, //reactivate default form handling
    }
  };

  constructor(
    private focusMonitor: FocusMonitor,
    private elementRef: ElementRef<HTMLElement>,
    public ngControl: NgControl,
    private quillBlotService: QuillBlotService,
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
    this.quillBlotService.getQuillInstance()?.container?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    this.getFocus();
  }

  // ControlValueAccessor Methods
  writeValue(value: string | null): void {
    if (this.value !== value) {
      this.content = QuillBlotService.plaintextToDelta(value || '');
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
    this.stateChanges.next();
  }

  private onChange = (value: any) => {};
  onTouched = () => {};

  // Specific Methods
  getFocus() {
    this.quillBlotService.getQuillInstance()?.focus();
  }

  onEditorCreated(quillInstance: Quill) {
    this.quillBlotService.setQuillInstance(quillInstance);

    //based on documentation only this way it's secure to get all corresponding click/keydown events.
    quillInstance.root.addEventListener('click', (event: MouseEvent) => {
      this.quillClick.emit({ event, quill: quillInstance });
    });
    quillInstance.root.addEventListener('dblclick', (event: MouseEvent) => {
      this.quillDblclick.emit({ event, quill: quillInstance });
    });
    quillInstance.root.addEventListener('keydown', (event: KeyboardEvent) => {
      this.quillKeydown.emit({ event, quill: quillInstance });
    });
    quillInstance.root.addEventListener('copy', (event: ClipboardEvent) => {
      this.quillBlotService.handleCopy(event);
    });
  }

  onContentChanged(event: ContentChange) {
    this.onInput(event);
    this.quillContentChanged.emit(event);
  }

  onInput = debounce(
    (event: Event) => {
      const value = this.quillBlotService.extractPlaintextFromDelta(this.content);
      this.value = value;
    },
    500,
    this,
  );
}
