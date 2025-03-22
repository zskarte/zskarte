import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  input,
  effect,
  signal,
  output,
  AfterViewInit,
} from '@angular/core';
import { I18NService } from 'src/app/state/i18n.service';
import { Designer } from '@pdfme/ui';
import { debounce } from '../../helper/debounce';
import { SplitComponent, SplitAreaComponent } from 'angular-split';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';
import { PdfServiceFactory } from '../pdf-service.factory';

const alignedKeys = ['name', 'position', 'width', 'height', 'type'];

@Component({
  selector: 'app-pdf-designer',
  imports: [SplitComponent, SplitAreaComponent, CommonModule, MatIcon, MatDialogModule, MatIconButton],
  templateUrl: './pdf-designer.component.html',
  styleUrl: './pdf-designer.component.scss',
  standalone: true,
})
export class PdfDesignerComponent implements OnDestroy, AfterViewInit {
  @ViewChild('designer') designerRef!: ElementRef;
  @ViewChild('template', { static: false })
  templateRef!: ElementRef<HTMLTextAreaElement>;
  template = input<object | null>();
  defaultTemplate = input<object>();
  templateName = input<string>();
  save = output<object | null>();

  i18n = inject(I18NService);
  private _dialog = inject(MatDialog);
  private _designer: Designer | undefined;
  private _pdfServiceFactory = inject(PdfServiceFactory);

  currentRow = signal<number>(0);
  currentCol = signal<number>(0);
  error = signal<string | null>(null);
  templateJson = signal<string>('');

  constructor() {
    effect(() => {
      const currentTemplate = this.template() ?? this.defaultTemplate();

      this.templateJson.set(this.formatTemplateJson(currentTemplate));

      if (this._designer) {
        this._designer.updateTemplate(currentTemplate as any);
      }
    });

    effect(() => {
      const template = this.templateJson();
      if (this.templateRef) {
        const textarea = this.templateRef.nativeElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        textarea.value = template;

        textarea.setSelectionRange(start, end);
      }
    });
  }

  async ngAfterViewInit() {
    const pdfService = await this._pdfServiceFactory.getPdfService();
    this._designer = new Designer({
      domContainer: this.designerRef.nativeElement,
      template: this.template() ?? (this.defaultTemplate() as any),
      plugins: pdfService.getPlugins(),
      options: { font: await pdfService.getFonts() },
    });
    this._designer.onChangeTemplate(this._debouncedHandleChangeTemplate);

    const templateContainer = this.templateRef.nativeElement;
    templateContainer.value = this.templateJson();
    templateContainer.addEventListener('input', this._debouncedHandleTextareaChange);
    templateContainer.addEventListener('input', this.updatePosition.bind(this));
    templateContainer.addEventListener('click', this.updatePosition.bind(this));
    templateContainer.addEventListener('keyup', this.updatePosition.bind(this));
  }

  ngOnDestroy(): void {
    if (this._designer) {
      this._designer.destroy();
      this._designer = undefined;
    }
  }

  private _debouncedHandleChangeTemplate = debounce((template) => {
    this.templateJson.set(this.formatTemplateJson(template));
  }, 500);

  private _debouncedHandleTextareaChange = debounce(() => {
    if (this.templateRef.nativeElement && this._designer) {
      const text = this.templateRef.nativeElement.value;
      if (this.isValidJSON(text)) {
        this._designer.updateTemplate(JSON.parse(text));
      }
    }
  }, 2000);

  private updatePosition(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value;
    const cursorPosition = (event.target as HTMLTextAreaElement).selectionStart;

    let line = 1;
    let column = 1;

    for (let i = 0; i < cursorPosition; i++) {
      if (text[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    this.currentCol.set(column);
    this.currentRow.set(line);
  }

  help() {
    InfoDialogComponent.showHtmlDialog(this._dialog, this.i18n.get('pdfDesignerHelp'));
  }

  reset() {
    const template = this.template() ?? this.defaultTemplate();
    this.templateJson.set(this.formatTemplateJson(template));
    if (this._designer) {
      this._designer.updateTemplate(template as any);
    }
  }

  resetToDefault() {
    const template = this.defaultTemplate();
    this.templateJson.set(this.formatTemplateJson(template));
    if (this._designer) {
      this._designer.updateTemplate(template as any);
    }
  }

  saveTemplate() {
    this.save.emit(this._designer!.getTemplate());
  }

  closeDesigner() {
    this.save.emit(null);
  }

  download() {
    const content = this.formatTemplateJson(this._designer!.getTemplate());
    const blob = new Blob([content], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'journal_entry_template.json';
    link.click();

    URL.revokeObjectURL(link.href);
  }

  public formatTemplateJson(template: any) {
    function formatObject(obj: any, maxLengths: Record<string, number>): string {
      const formattedKeys = alignedKeys.map((key) => {
        const value = JSON.stringify(obj[key]);
        const padding = ' '.repeat(Math.max(0, maxLengths[key] - key.length - value.length - 4));
        return `"${key}":${value},${padding}`;
      });

      const otherKeys = Object.keys(obj).filter((key) => !alignedKeys.includes(key));
      if (otherKeys.includes('content') && obj.content === '') {
        otherKeys.splice(otherKeys.indexOf('content'), 1);
      }
      const otherProps = otherKeys.map((key) => `"${key}":${JSON.stringify(obj[key])}`);

      return `      {${formattedKeys.join('')}${otherProps.join(',')}}`;
    }

    function calculateMaxLengths(schemas: any[][]): Record<string, number> {
      return alignedKeys.reduce(
        (acc, key) => {
          acc[key] = Math.max(...schemas.flat().map((item) => JSON.stringify(item[key]).length + key.length + 4));
          if (key === alignedKeys[0]) {
            acc[key] = acc[key] + 3;
          }
          if (acc[key] % 4 !== 0) {
            acc[key] = Math.ceil(acc[key] / 4) * 4;
          }
          if (key === alignedKeys[0]) {
            acc[key] = acc[key] - 3;
          }
          return acc;
        },
        {} as Record<string, number>,
      );
    }

    function formatSchemas(schemas: any[][]): string {
      const maxLengths = calculateMaxLengths(schemas);

      return schemas
        .map((array) => {
          return '    [\n' + array.map((item) => formatObject(item, maxLengths)).join(',\n') + '\n    ]';
        })
        .join(',\n');
    }

    // biome-ignore format: next-line
    return (
      '{' +
      '\n  "schemas":[\n' +
      formatSchemas(template.schemas) +
      '\n  ],\n' +
      '  "basePdf":' + JSON.stringify(template.basePdf, null, 2).replace(/\n/g, '\n  ') + ',\n' +
      '  "pdfmeVersion": "' + template.pdfmeVersion + '"\n' +
      '}'
    );
  }

  private isValidJSON(text: string) {
    try {
      JSON.parse(text);
      this.error.set(null);
      return true;
    } catch (e: any) {
      let errorMsg = e.toString();
      if (errorMsg.startsWith('SyntaxError: JSON.parse: ')) {
        errorMsg = errorMsg.substring(25);
      }
      this.error.set(errorMsg);
      return false;
    }
  }
}
