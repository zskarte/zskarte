import { Injectable, effect, inject, resource, signal } from '@angular/core';
import { JournalDateFields, JournalEntry } from './journal.types';
import { ApiResponse, ApiService } from '../api/api.service';
import { SessionService } from '../session/session.service';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IPdfService, PdfServiceFactory } from '../pdf/pdf-service.factory';
import { v4 as uuidv4 } from 'uuid';
import { PatchJournalEntry, db } from '../db/db';
import { toSignal } from '@angular/core/rxjs-interop';
import { groupBy } from 'lodash';
import { ZsMapStateService } from '../state/state.service';
import { I18NService } from '../state/i18n.service';
import saveAs from 'file-saver';
import { SearchService } from '../search/search.service';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private _api = inject(ApiService);
  private _session = inject(SessionService);
  private _pdfServiceFactory = inject(PdfServiceFactory);
  private _i18n = inject(I18NService);
  private _search!: SearchService;
  private _state!: ZsMapStateService;
  private isOnline = toSignal(this._session.observeIsOnline());
  private _connectionId!: string;

  private operationId = signal<string | null>(null);
  private organizationId = signal<string | null>(null);
  private journalResource = resource({
    request: () => ({
      operationId: this.operationId(),
      organizationId: this.organizationId(),
    }),
    loader: async (params) => {
      if (!params.request.operationId || !params.request.organizationId) {
        return [];
      }
      if (this._session.isWorkLocal()) {
        return await db.localJournalEntries
          .where({ operationId: params.request.operationId, organizationId: params.request.organizationId })
          .toArray();
      }
      //organization is implicit by session
      const { error, result } = await this._api.get<JournalEntry[]>(
        `/api/journal-entries?operationId=${params.request.operationId}&pagination[pageSize]=1000`,
      );
      if (error || !result) {
        throw 'error on fetch journal entries';
      }
      return (result as JournalEntry[]) || [];
    },
  });
  readonly backendData = this.journalResource.value;
  readonly data = signal<JournalEntry[]>([]);
  readonly loading = this.journalResource.isLoading;
  readonly backendError = this.journalResource.error;
  readonly error = signal(false);
  readonly cachedOnly = signal(false);
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
  public lastUpdated = signal<{ entry: JournalEntry; change: Partial<JournalEntry> } | null>(null);

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
    effect(() => {
      this._session
        .observeOrganizationId()
        .pipe(
          tap((organizationId) => this.organizationId.set(organizationId as string)),
          tap(() => this.journalResource.reload()),
        )
        .subscribe();
    });

    effect(async () => {
      if (this._session.isWorkLocal()) {
        this.data.set(this.backendData() || []);
        return;
      }
      const operationId = this.operationId();
      const organizationId = this.organizationId();
      if (!operationId || !organizationId) {
        this.data.set([]);
        return;
      }

      if (this.backendError()) {
        try {
          const cached = await db.localJournalEntries.where({ operationId, organizationId }).toArray();
          if (cached.length > 0) {
            this.data.set(cached);
            this.error.set(false);
            this.cachedOnly.set(true);
            return;
          }
        } catch (e) {
          console.error(`Error retrieving cached journal entries for ${operationId}:`, e);
        }
        this.error.set(true);
        this.data.set([]);
      } else {
        this.error.set(false);
        this.cachedOnly.set(false);
        const current = this.backendData();
        if (current && current.length > 0) {
          this.data.set(current);
          try {
            await db.transaction('rw', db.localJournalEntries, async () => {
              await db.localJournalEntries.where({ operationId, organizationId }).delete();
              await db.localJournalEntries.bulkPut(
                current.map((entry) => ({
                  ...entry,
                  operationId,
                  organizationId,
                  uuid: entry.uuid || entry.documentId,
                  fromCache: true,
                })),
              );
            });
          } catch (e) {
            console.error(`Error updating cache for ${operationId}:`, e);
          }
        } else {
          this.data.set([]);
          //delete from cache if backend explicit send an empty list
          if (Array.isArray(current)) {
            try {
              await db.localJournalEntries.where({ operationId, organizationId }).delete();
            } catch (e) {
              console.error(`Error clearing cache for ${operationId}:`, e);
            }
          }
        }
      }
    });
  }

  public setStateService(state: ZsMapStateService): void {
    this._state = state;
  }

  public setSearchService(search: SearchService): void {
    this._search = search;
  }

  public setConnectionId(_connectionId: string) {
    this._connectionId = _connectionId;
  }

  public patchEntry(updatedEntry: Partial<JournalEntry>, internal = false) {
    let entry = updatedEntry as JournalEntry;
    this.data.update((currentEntries) => {
      let resultList: JournalEntry[];
      if (!currentEntries) {
        resultList = [entry];
      } else {
        const index = currentEntries.findIndex(
          (entry) =>
            (entry.documentId && entry.documentId === updatedEntry.documentId) ||
            (entry.uuid && entry.uuid === updatedEntry.uuid),
        );
        if (index !== -1) {
          entry = { ...currentEntries[index], ...updatedEntry };
          resultList = [...currentEntries.slice(0, index), entry, ...currentEntries.slice(index + 1)];
        } else {
          resultList = [entry, ...currentEntries];
        }
      }
      const operationId = this.operationId();
      const organizationId = this.organizationId();
      if (operationId && organizationId) {
        db.localJournalEntries.put({
          ...entry,
          operationId,
          organizationId,
          uuid: entry.uuid || entry.documentId,
          fromCache: true,
        });
      }
      if (!internal) {
        this.lastUpdated.set({ entry, change: updatedEntry });
      }

      return resultList;
    });
    return entry;
  }

  public async getDefaultTemplate() {
    return await (await fetch('/assets/pdf/journal_entry_template.json')).json();
  }

  public async getTemplate() {
    const template = await this._session.getJournalEntryTemplate();
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
    const operationId = this.operationId();
    if (!operationId) {
      return null;
    }
    //organization is implicit by session
    const { error, result } = await this._api.get<JournalEntry>(
      `/api/journal-entries/by-number/${messageNumber}?operationId=${operationId}`,
    );
    if (error || !result) {
      console.error(`could not get journalEntry with number ${messageNumber}`, error);
      const organizationId = this.organizationId();
      return await db.localJournalEntries.where({ operationId, organizationId, messageNumber }).first();
    }
    return result;
  }

  private async getNextLocalNumber() {
    const operationId = this.operationId();
    const organizationId = this.organizationId();
    if (!operationId) {
      return -10000;
    }
    const cached = await db.localJournalEntries.where({ operationId, organizationId }).toArray();
    if (cached.length === 0) {
      return -1;
    }
    const numbers = cached.map((e) => e.messageNumber);
    const min = Math.min(0, ...numbers);
    const max = Math.max(0, ...numbers);
    if (max < 0) {
      return min - 1;
    }
    if (-max < min) {
      return -max - 1;
    }
    return min - 1;
  }

  private async messageNumberAlreadyExist(messageNumber: number, uuid?: string) {
    const operationId = this.operationId();
    const organizationId = this.organizationId();
    if (!operationId) {
      return -10000;
    }
    const cached = await db.localJournalEntries.where({ operationId, organizationId, messageNumber }).first();
    return uuid ? cached && cached?.uuid !== uuid : cached != null;
  }

  public async insert(entry: JournalEntry) {
    if (entry.messageNumber) {
      if (entry.messageNumber < 0) {
        return {
          error: { message: `messageNumber ${entry.messageNumber} is invalid` },
          result: undefined,
        };
      } else if (await this.messageNumberAlreadyExist(entry.messageNumber)) {
        return {
          error: { message: `messageNumber ${entry.messageNumber} already exist` },
          result: undefined,
        };
      }
    }
    if (this._session.isWorkLocal()) {
      if (!entry.messageNumber) {
        //on work local use positive numbers as always work local
        entry.messageNumber = -(await this.getNextLocalNumber());
      }
      if (!entry.uuid) {
        entry.uuid = uuidv4();
      }
      const result = this.patchEntry(entry, true);
      return { error: undefined, result };
    }
    const operationId = this.operationId();
    const organizationId = this.organizationId();
    if (!operationId || !organizationId) {
      return { error: true, result: undefined };
    }
    if (!entry.uuid) {
      entry.uuid = uuidv4();
    }
    const response = await this._api.post<JournalEntry>(
      '/api/journal-entries',
      { data: { ...entry, operation: operationId, organization: organizationId } },
      { headers: { identifier: this._connectionId } },
    );

    const { error, result } = response;
    if (!error && result) {
      this.patchEntry(result, true);
    } else {
      //if network error, create patch for apply later
      try {
        if ((error?.status ?? 0) >= 500 || error?.message?.startsWith('NetworkError') || !this.isOnline()) {
          if (!entry.messageNumber) {
            entry.messageNumber = await this.getNextLocalNumber();
          } else {
            if (entry.messageNumber > 0) {
              entry.messageNumber = -entry.messageNumber;
            }
            if (await this.messageNumberAlreadyExist(entry.messageNumber)) {
              return {
                error: { message: `messageNumber ${entry.messageNumber} already exist` },
                result: undefined,
              };
            }
          }
          db.patchJournalEntries.add({
            entry,
            create: true,
            uuid: entry.uuid,
            operationId,
            organizationId,
            date: new Date(),
          });
          //on network error and save patch to submit later, still update the view
          this.patchEntry({ ...entry, localOnly: true }, true);
          return { error: { localOnly: true }, result: undefined };
        }
      } catch (e) {
        console.error('error on try to handle update locally, entry:', entry, 'error:', e);
      }
    }
    return response;
  }

  public async update(entry: Partial<JournalEntry>, documentId?: string, uuid?: string) {
    if (entry.messageNumber) {
      if (await this.messageNumberAlreadyExist(entry.messageNumber, uuid || entry.uuid || documentId || entry.documentId)) {
        return {
          error: { message: `messageNumber ${entry.messageNumber} already exist` },
          result: undefined,
        };
      }
    }
    if (this._session.isWorkLocal()) {
      const cacheUuid = uuid || entry.uuid || documentId || entry.documentId;
      const result = this.patchEntry({ ...entry, documentId: documentId || entry.documentId, uuid: cacheUuid }, true);
      return { error: undefined, result };
    }
    const { documentId: documentIdEntry, ...data } = entry;
    const response = await this._api.put<JournalEntry>(
      `/api/journal-entries/${documentId || entry.documentId || uuid || entry.uuid}`,
      { data },
      { headers: { identifier: this._connectionId } },
    );

    const { error, result } = response;
    if (!error && result) {
      this.patchEntry({ ...entry, documentId: result.documentId, uuid: result.uuid }, true);
    } else {
      //if network error, create patch for apply later
      try {
        if ((error?.status ?? 0) >= 500 || error?.message?.startsWith('NetworkError') || !this.isOnline()) {
          const cacheUuid = uuid || entry.uuid || documentId || entry.documentId;
          if (cacheUuid) {
            const operationId = this.operationId();
            const organizationId = this.organizationId();
            if (operationId && organizationId) {
              db.patchJournalEntries.add({
                entry,
                create: false,
                uuid: cacheUuid,
                documentId,
                operationId,
                organizationId,
                date: new Date(),
              });
              //on network error and save patch to submit later, still update the view
              this.patchEntry(
                { ...entry, localPatch: true, documentId: documentId || entry.documentId, uuid: cacheUuid },
                true,
              );
              return { error: { localOnly: true }, result: undefined };
            }
          }
        }
      } catch (e) {
        console.error('error on try to handle update locally, entry:', entry, 'error:', e);
      }
    }
    return response;
  }

  public async save(entry: JournalEntry) {
    if (entry.documentId || entry.uuid) {
      return this.update(entry);
    } else {
      return this.insert(entry);
    }
  }

  public async publishPatches() {
    const operationId = this.operationId();
    const organizationId = this.organizationId();
    if (!operationId || !organizationId || !this._session.getToken() || !this._session.isOnline()) {
      return;
    }
    const entries = await db.patchJournalEntries.where({ operationId, organizationId }).toArray();
    if (!entries.length) {
      this.journalResource.reload();
      return;
    }

    //group patches by uuid and sort the patches and the packages groups by date
    const groupedEntries = groupBy(entries, 'uuid');
    const sortedGroups = Object.entries(groupedEntries)
      .map(([uuid, group]) => ({
        uuid,
        changes: group.sort((a, b) => a.date.getTime() - b.date.getTime()),
      }))
      .sort((a, b) => {
        const aFirstDate = a.changes[0].date.getTime();
        const bFirstDate = b.changes[0].date.getTime();
        return aFirstDate - bFirstDate;
      });

    const errors: { uuid: string; changes: PatchJournalEntry[] }[] = [];
    const messageNumberMapping: Record<number, number> = {};
    for (const { uuid, changes } of sortedGroups) {
      try {
        //merge the changes of same uuid so only one backend request is required per JournalEntry
        const entry = changes
          .slice(1)
          .reduce<PatchJournalEntry>((acc: PatchJournalEntry, change: PatchJournalEntry) => {
            acc.create;
            return { ...acc, entry: { ...acc.entry, ...change.entry } };
          }, changes[0]);

        //do the backend request to create/update it
        let response: ApiResponse<JournalEntry>;
        if (entry.create) {
          response = await this._api.post<JournalEntry>(
            '/api/journal-entries',
            { data: { ...entry.entry, operation: entry.operationId, organization: entry.organizationId } },
            { headers: { identifier: this._connectionId } },
          );
        } else {
          const { documentId: documentIdEntry, ...data } = entry.entry;
          response = await this._api.put<JournalEntry>(
            `/api/journal-entries/${entry.documentId || entry.entry.documentId || entry.uuid || entry.entry.uuid}`,
            { data },
            { headers: { identifier: this._connectionId } },
          );
        }

        //handle response
        const { error, result } = response;
        if (error || !result) {
          console.error('Error updating journal entry:', entry, error);
          errors.push({ uuid, changes });
        } else {
          messageNumberMapping[entry.entry.messageNumber!] = result.messageNumber;
          if (entry.create) {
            this.patchEntry({ ...result, localOnly: false, localPatch: false }, true);
          } else {
            this.patchEntry(
              { ...entry.entry, localOnly: false, localPatch: false, documentId: result.documentId, uuid: result.uuid },
              true,
            );
          }
          await db.patchJournalEntries.bulkDelete(changes.map((p) => p.id!));
        }
      } catch (e) {
        console.error('error while save patches', uuid, changes);
        errors.push({ uuid, changes });
      }
    }
    console.log('publishJournalPatches: error', errors, 'messageNumberMapping', messageNumberMapping);

    this.journalResource.reload();

    //update messageNumber on map if it's changed
    this._state.updateMapState((draft) => {
      if (draft?.drawElements) {
        for (const element of Object.values(draft.drawElements)) {
          if (element.reportNumber) {
            let changed = false;
            const reportNumber = (
              Array.isArray(element.reportNumber) ? element.reportNumber : [element.reportNumber]
            ).map((n) => {
              if (n in messageNumberMapping && n !== messageNumberMapping[n]) {
                changed = true;
                return messageNumberMapping[n];
              }
              return n;
            });
            if (changed) {
              element.reportNumber = reportNumber;
            }
          }
        }
      }
    });
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
      entry.uuid,
    );
    if (error || !result) {
      console.error('Error updating journal entry:', error);
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
      entry.uuid,
    );

    if (error || !result) {
      console.error('Error updating journal entry:', error);
      if (typeof error === 'object' && 'localOnly' in error && error.localOnly) {
        this.drawingEntrySignal.set(null);
      }
    } else {
      this.drawingEntrySignal.set(null);
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
    let templateDefinition = await this.getTemplate();
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
      name: organizationFull?.name ?? (this._session.isWorkLocal() ? 'local' : undefined),
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
    const fileName = `${operation.name}_message${entry.messageNumber}_${(new Date()).toISOString().slice(0, 16)}.pdf`;
    await pdfService.downloadPdf(template, data, fileName);
  }

  private _calculateRowHeight(cellValue: string, columnWidth: number): number {
    const charsPerLine = columnWidth;
    const lines = cellValue.split('\n').reduce((acc, line) => {
      return acc + Math.ceil((line.length || 1) / charsPerLine);
    }, 0);

    const lineHeight = 15;
    return lines * lineHeight;
  }

  async exportAsExcel(entries: JournalEntry[]) {
    const operation = this._session.getOperation();
    if (!operation) {
      return;
    }
    const fileName = `${operation.name}_${new Date().toISOString().slice(0, 16)}.xlsx`.replaceAll(/[^a-zA-Z0-9._-]/g, '_');

    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Journal Entries');
    const defaultStyleTextTop = { alignment: { vertical: 'top' } } as any;
    const defaultStyleDate = { alignment: { vertical: 'top' }, numFmt: 'dd.mm.yyyy hh:mm' } as any;

    sheet.columns = [
      { header: this._i18n.get('messageNumberShort2'), key: 'messageNumber', width: 5, style: defaultStyleTextTop },
      {
        header: this._i18n.get('messageSubject'),
        key: 'messageSubject',
        width: 40,
        style: { alignment: { wrapText: true, vertical: 'top' } },
      },
      {
        header: this._i18n.get('messageContent'),
        key: 'messageContent',
        width: 50,
        style: { alignment: { wrapText: true, vertical: 'top' } },
      },
      { header: this._i18n.get('dateMessage'), key: 'dateMessage', width: 20, style: defaultStyleDate },
      {
        header: this._i18n.get('communicationDevice'),
        key: 'communicationType',
        width: 20,
        style: defaultStyleTextTop,
      },
      { header: this._i18n.get('detailsChanel'), key: 'communicationDetails', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('receiver'), key: 'creator', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('deliverer'), key: 'sender', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('visa'), key: 'visumMessage', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('keyMessageShort'), key: 'isKeyMessage', width: 10, style: defaultStyleTextTop },
      { header: this._i18n.get('department'), key: 'department', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('visumTriage'), key: 'visumTriage', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('dateTriage'), key: 'dateTriage', width: 20, style: defaultStyleDate },
      {
        header: this._i18n.get('decision'),
        key: 'decision',
        width: 50,
        style: { alignment: { wrapText: true, vertical: 'top' } },
      },
      { header: this._i18n.get('messageReceiver'), key: 'decisionReceiver', width: 25, style: defaultStyleTextTop },
      { header: this._i18n.get('visumDecider'), key: 'visumDecider', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('dateDecision'), key: 'dateDecision', width: 25, style: defaultStyleDate },
      { header: this._i18n.get('deliveredFrom'), key: 'decisionSender', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('deliveryTime'), key: 'dateDecisionDelivered', width: 20, style: defaultStyleDate },
      { header: this._i18n.get('isDrawnOnMap'), key: 'isDrawnOnMap', width: 15, style: defaultStyleTextTop },
      { header: this._i18n.get('entryStatus'), key: 'entryStatus', width: 20, style: defaultStyleTextTop },
      { header: this._i18n.get('createdAt'), key: 'createdAt', width: 20, style: defaultStyleDate },
      { header: this._i18n.get('updatedAt'), key: 'updatedAt', width: 20, style: defaultStyleDate },
    ];

    entries.sort((a,b) => a.messageNumber - b.messageNumber);

    const columnsToCheck = ['messageContent', 'decision'];
    entries.forEach((entry) => {
      const translatedEntry = {
        ...entry,
        messageContent: this._search.removeAllAddressTokens(entry.messageContent?.trim(), false),
        decision: entry.decision?.trim(),
        department: entry.department ? this._i18n.get(entry.department) : '',
        isKeyMessage: entry.isKeyMessage ? this._i18n.get('yes') : this._i18n.get('no'),
        isDrawnOnMap: entry.isDrawnOnMap ? this._i18n.get('yes') : this._i18n.get('no'),
      };
      const row = sheet.addRow(translatedEntry);

      //mark messageNumber if it's a local only/local patches entry
      if (entry.localOnly || entry.localPatch) {
        const messageNumberCell = row.getCell('messageNumber');
        messageNumberCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' }, //orange
        };
        messageNumberCell.note = {
          texts: [{ text: entry.localOnly ? this._i18n.get('localOnlyJournal') : this._i18n.get('localPatchJournal') }],
        };
      }

      //verify row height by content
      let requiredHeight = 15; //min height
      columnsToCheck.forEach((columnKey) => {
        const cell = row.getCell(columnKey);
        if (cell?.value) {
          const column = sheet.getColumn(columnKey);
          let columnWidth = column.width;
          if (!columnWidth) {
            columnWidth = 50;
            column.width = columnWidth;
          }
          const cellValue = cell.value.toString();
          const estimatedHeight = this._calculateRowHeight(cellValue, columnWidth);
          requiredHeight = Math.max(requiredHeight, estimatedHeight);
        }
      });
      row.height = requiredHeight;
    });

    //add autofilter
    const lastColumnLetter = String.fromCharCode(64 + sheet.columns.length);
    sheet.autoFilter = {
      from: 'A1',
      to: `${lastColumnLetter}1`,
    };

    return workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        fileName,
      );
    });
  }
}
