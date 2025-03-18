import { Injectable, effect, inject, resource, signal } from '@angular/core';
import { JournalDateFields, JournalEntry } from './journal.types';
import { ApiService } from '../api/api.service';
import { SessionService } from '../session/session.service';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPdfService, PdfServiceFactory } from '../pdf/pdf-service.factory';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private _api = inject(ApiService);
  private _session = inject(SessionService);
  private _pdfServiceFactory = inject(PdfServiceFactory);

  private operationId = signal<string | null>(null);
  private journalResource = resource({
    request: () => ({
      operationId: this.operationId(),
    }),
    loader: async (params) => {
      if (!params.request.operationId) {
        return [];
      }
      const { error, result } = await this._api.get<JournalEntry[]>(
        `/api/journal-entries?operationId=${params.request.operationId}&pagination[pageSize]=1000`,
      );
      if (error || !result) {
        throw 'error on fetch journal entries';
      }
      return (result as JournalEntry[]) || [];
    },
  });
  readonly data = this.journalResource.value;
  readonly loading = this.journalResource.isLoading;
  readonly error = this.journalResource.error;
  readonly reload = () => this.journalResource.reload();

  private drawingEntrySignal = signal<JournalEntry | null>(null);
  get drawingEntry() {
    return this.drawingEntrySignal();
  }
  set drawingEntry(newValue: JournalEntry | null) {
    const oldValue = this.drawingEntrySignal();
    if (oldValue !== newValue) {
      if (oldValue?.isDrawingOnMap) {
        this.updateDrawingState(oldValue, false);
      }
      this.drawingEntrySignal.set(newValue);
      if (newValue) {
        this.updateDrawingState(newValue, true);
      }
    }
  }

  constructor() {
    effect(() => {
      this._session
        .observeOperationId()
        .pipe(
          tap((operationId) => this.operationId.set(operationId as string)),
          tap(() => this.journalResource.reload()),
        )
        .subscribe();
    });
  }

  public async getDefaultTemplate() {
    return await (await fetch('/assets/pdf/journal_entry_template.json')).json();
  }

  public getTemplate() {
    const template = this._session.getOrganization()?.journalEntryTemplate;
    if (!template) {
      return null;
    }
    return template;
  }

  public async get(documentId: string) {
    const { error, result } = await this._api.get<JournalEntry>(`/api/journal-entries/${documentId}`);
    if (error || !result) {
      console.error(`could not get journalEntry ${documentId}`, error);
      return null;
    }
    return result;
  }

  public async getByNumber(messageNumber: number) {
    const operation = this._session.getOperation();
    if (!operation) {
      return null;
    }
    const { error, result } = await this._api.get<JournalEntry>(
      `/api/journal-entries/by-number/${messageNumber}?operationId=${operation.documentId}`,
    );
    if (error || !result) {
      console.error(`could not get journalEntry with number ${messageNumber}`, error);
      return null;
    }
    return result;
  }

  public async insert(entry: JournalEntry) {
    const operation = this._session.getOperation();
    const organization = this._session.getOrganization();
    return this._api.post<JournalEntry>('/api/journal-entries', {
      data: {
        ...entry,
        operation: operation?.documentId,
        organization: organization?.documentId,
      },
    });
  }

  public async update(entry: Partial<JournalEntry>, documentId?: string) {
    const { documentId: documentIdEntry, ...data } = entry;
    return this._api.put<JournalEntry>(`/api/journal-entries/${documentId ?? documentIdEntry}`, { data });
  }

  public async save(entry: JournalEntry) {
    if (entry.documentId) {
      return this.update(entry);
    } else {
      return this.insert(entry);
    }
  }

  public startDrawing(entry: JournalEntry, value: boolean) {
    this.drawingEntry = value ? entry : null;
  }

  private async updateDrawingState(entry: JournalEntry, value: boolean) {
    const { error, result } = await this.update(
      {
        isDrawingOnMap: value,
      },
      entry.documentId,
    );
    if (error || !result) {
      console.error('Error updating journal entry:', error);
    } else {
      this.journalResource.reload();
    }
  }

  public async markAsDrawn(entry: JournalEntry, value: boolean) {
    const { error, result } = await this.update(
      value
        ? {
            isDrawnOnMap: value,
            isDrawingOnMap: false,
          }
        : {
            isDrawnOnMap: value,
          },
      entry.documentId,
    );

    if (error || !result) {
      console.error('Error updating journal entry:', error);
    } else {
      this.drawingEntrySignal.set(null);
      this.journalResource.reload();
    }
  }

  private checkTextBlockSizeAndAdjust(
    pdfService: IPdfService,
    template: any,
    fieldName: string,
    text: string,
    linePrefix: string,
  ) {
    //if text is to long / does not fit remove optical lines and write the text more condenced.
    if (text && !pdfService.checkTextFitInField(template, fieldName, text)) {
      const filteredSchemas: any[][] = [];
      for (const schema of template.schemas) {
        const filteredSchema: any[] = [];
        for (const element of schema) {
          if (element.name === fieldName) {
            if (element.lineHeight > 1.2) {
              element.lineHeight = 1.2;
            }
            element.dynamicFontSize = { min: 4, max: element.fontSize, fit: 'vertical' };
            filteredSchema.push(element);
          } else if (!element.name.startsWith(linePrefix)) {
            filteredSchema.push(element);
          }
        }
        filteredSchemas.push(filteredSchema);
      }
      template.schemas = filteredSchemas;
    }
  }

  private forceEmptyTextValueToDummyText(template: any, entry: JournalEntry) {
    //if date are not filled convert to normal text field
    //force none empty value for all not filled fields
    for (const schema of template.schemas) {
      for (const element of schema) {
        let elementName: string = element.name;
        if (elementName.indexOf(':') > 0) {
          elementName = elementName.split(':', 2)[1];
        }
        if (elementName.startsWith('entry.')) {
          const fieldName = elementName.substring(6);
          element.required = false;
          if (!entry[fieldName]) {
            if (JournalDateFields.includes(fieldName as keyof JournalEntry)) {
              element.type = 'text';
            }
            //force empty fields to have content so background is shown
            if (element.type === 'text') {
              element.content = ' ';
              element.readOnly = true;
            }
          }
        }
      }
    }
  }

  private deactivateQRCode(template: any) {
    for (const schema of template.schemas) {
      for (const element of schema) {
        if (element.name === 'url_entry') {
          element.type = 'text';
          element.content = ' ';
          element.readOnly = true;
          return;
        }
      }
    }
  }

  public async print(entry: JournalEntry) {
    const pdfService = await this._pdfServiceFactory.getPdfService();
    let templateDefinition = this.getTemplate();
    if (!templateDefinition) {
      templateDefinition = await this.getDefaultTemplate();
    }
    //clone the template so don't change the original
    const template = JSON.parse(JSON.stringify(templateDefinition));

    //adjust template if needed based on data to print
    this.checkTextBlockSizeAndAdjust(
      pdfService,
      template,
      'entry.messageContent',
      entry.messageContent,
      'line_messageContent_',
    );
    this.checkTextBlockSizeAndAdjust(pdfService, template, 'entry.decision', entry.decision, 'line_decision_');
    this.forceEmptyTextValueToDummyText(template, entry);

    //prepare operation/organisation data accessible in pdf
    const operationFull = this._session.getOperation();
    const organizationFull = this._session.getOrganization();
    const operation = {
      documentId: operationFull?.documentId,
      name: operationFull?.name,
    };
    const organization = {
      documentId: organizationFull?.documentId,
      name: organizationFull?.name,
      url: organizationFull?.url,
      logo_url: organizationFull?.logo?.url,
    };
    if (organizationFull?.logo?.provider === 'local') {
      organization.logo_url = `${environment.apiUrl}${organization.logo_url}`;
    }
    let entryUrl;
    if (entry.messageNumber && entry.createdAt) {
      entryUrl = `${window.location.origin}/main/journal?operationId=${operation.documentId}&messageNumber=${entry.messageNumber}`;
    } else {
      this.deactivateQRCode(template);
    }

    const data = [
      {
        entry,
        operation,
        organization,
        url_entry: entryUrl,
      },
    ];
    const fileName = `${operation.name}_message${entry.messageNumber}_${(new Date()).toISOString()}.pdf`;
    await pdfService.downloadPdf(template, data, fileName);
  }
}
