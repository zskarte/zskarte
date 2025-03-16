import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  IZSMapOperationMapLayers,
  IZsMapOperation,
  ZsMapState,
  ZsMapLayerStateType,
  ZsOperationPhase,
} from '@zskarte/types';
import { DateTime } from 'luxon';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ApiService, IApiRequestOptions } from '../../api/api.service';
import { OperationExportFileVersion } from '../../core/entity/operationExportFile';
import { db } from '../../db/db';
import { ImportDialogComponent } from '../../import-dialog/import-dialog.component';
import { IpcService } from '../../ipc/ipc.service';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root',
})
export class OperationService {
  private _api = inject(ApiService);
  _ipc = inject(IpcService);
  private _dialog = inject(MatDialog);

  private _session!: SessionService;
  public operations = new BehaviorSubject<IZsMapOperation[]>([]);
  public operationToEdit = new BehaviorSubject<IZsMapOperation | undefined>(undefined);

  public setSessionService(sessionService: SessionService): void {
    this._session = sessionService;
  }

  public async archiveOperation(operation: IZsMapOperation): Promise<void> {
    if (!operation || !operation?.id) {
      return;
    }

    operation.phase = 'archived';
    if (operation?.id < 0) {
      await OperationService.persistLocalOperation(operation);
    } else {
      await this._api.put(`/api/operations/${operation.documentId}/archive`, null);
    }
    await this.reload('active');
  }

  public async unarchiveOperation(operation: IZsMapOperation): Promise<void> {
    if (!operation || !operation?.id) {
      return;
    }

    operation.phase = 'active';
    if (operation?.id < 0) {
      await OperationService.persistLocalOperation(operation);
    } else {
      await this._api.put(`/api/operations/${operation.documentId}/unarchive`, null);
    }
    await this.reload('archived');
  }

  public async deleteOperation(operation: IZsMapOperation): Promise<void> {
    if (!operation || !operation?.id) {
      return;
    }

    if (operation?.id < 0) {
      await OperationService.deleteLocalOperation(operation);
    } else {
      await this._api.put(`/api/operations/${operation.documentId}/shadowdelete`, null);
    }
    await this.reload('archived');
  }

  public async saveOperation(operation: IZsMapOperation): Promise<void> {
    if (operation.documentId) {
      await this.updateMeta(operation);
    } else {
      await this.insertOperation(operation);
    }
    await this.reload('active');
    this.operationToEdit.next(undefined);
  }

  public async insertOperation(operation: IZsMapOperation): Promise<void> {
    if (!operation.mapState) {
      operation.mapState = this.createMapstate();
    }
    if (!operation.phase) {
      operation.phase = 'active';
    }

    if (this._session.isWorkLocal()) {
      const minId = Math.min(0, ...(await db.localOperation.toArray()).map((o) => o.id ?? 0));
      operation.id = minId - 1;
      operation.documentId = 'local-' + operation.id;
      await db.localOperation.add(operation);
    } else {
      await this._api.post('/api/operations', {
        data: { ...operation, organization: this._session.getOrganization()?.documentId },
      });
    }
  }

  public async updateMeta(operation: IZsMapOperation): Promise<void> {
    if (!operation.documentId || operation.documentId?.startsWith('local-')) {
      if (!operation.documentId) {
        operation.documentId = 'local-' + operation.id;
      }
      await OperationService.persistLocalOperation(operation);
    } else {
      await this._api.put(`/api/operations/${operation.documentId}/meta`, {
        data: { name: operation.name, description: operation.description, eventStates: operation.eventStates },
      });
    }
  }

  public async getOperation(operationId: string, options?: IApiRequestOptions) {
    if (operationId.startsWith('local-')) {
      return db.localOperation.get(parseInt(operationId.substring(6)));
    } else {
      const { error, result } = await this._api.get<IZsMapOperation>(`/api/operations/${operationId}`, options);
      if (error || !result) return null;
      return result;
    }
  }

  public static async deleteLocalOperation(operation: IZsMapOperation) {
    if (!operation || !operation.id) return;
    return await db.localOperation.where('id').equals(operation.id).delete();
  }

  public static async deleteNoneLocalOperations() {
    return await db.localOperation.where('id').aboveOrEqual(0).delete();
  }

  public static async persistLocalOperation(operation: IZsMapOperation) {
    await db.localOperation.put(operation);
  }

  private static getLocalOperations(phase: ZsOperationPhase) {
    return db.localOperation.where('phase').equals(phase).toArray();
  }

  public async loadLocal(phase: ZsOperationPhase): Promise<void> {
    const localOperations = await OperationService.getLocalOperations(phase);
    if (!localOperations) return;
    this.operations.next(localOperations);
  }

  public async reload(phase: ZsOperationPhase): Promise<void> {
    let operations: IZsMapOperation[] = [];
    const localOperations = await OperationService.getLocalOperations(phase);
    if (localOperations) {
      operations = localOperations;
    }
    if (!this._session.isWorkLocal()) {
      const { error, result: savedOperations } = await this._api.get<IZsMapOperation[]>(
        `/api/operations/overview?phase=${phase}`,
      );
      if (!error && savedOperations !== undefined) {
        operations = [...operations.filter((x) => x.id && x.id < 0), ...savedOperations];
      }
      this.operations.next(operations);
    } else {
      this.operations.next(operations);
    }
  }

  public async updateMapLayers(operationId: string, data: IZSMapOperationMapLayers) {
    if (parseInt(operationId) < 0) {
      const operation = this._session.getOperation();
      if (operation) {
        operation.mapLayers = data;
        await OperationService.persistLocalOperation(operation);
      }
    } else {
      await this._api.put(`/api/operations/${operationId}/mapLayers`, { data });
    }
  }

  public async updateLocalMapState(mapState: ZsMapState) {
    const operation = this._session.getOperation();
    if (operation) {
      operation.mapState = mapState;
      await OperationService.persistLocalOperation(operation);
    }
  }

  public importOperation(): void {
    const importDialog = this._dialog.open(ImportDialogComponent);
    importDialog.afterClosed().subscribe(async (result) => {
      if (result) {
        // Prior to V2 the "map" key was used to store the map state.
        // To keep consistent with our internal naming, use "mapState" from V2 on
        const mapState = result.version === OperationExportFileVersion.V2 ? result.mapState : result.map;
        const operation: IZsMapOperation = {
          name: result.name,
          description: result.description,
          phase: 'active',
          eventStates: result.eventStates,
          mapState,
          mapLayers: result.mapLayers,
        };
        await this.insertOperation(operation);
        await this.reload('active');
      }
    });
  }

  public async exportOperation(operationId: string | undefined): Promise<void> {
    if (!operationId) {
      return;
    }
    const fileName = `Ereignis_${DateTime.now().toFormat('yyyy_LL_dd_hh_mm')}.zsjson`;
    const operation = await this.getOperation(operationId);
    const saveFile = {
      name: operation?.name,
      description: operation?.description,
      version: OperationExportFileVersion.V2,
      mapState: operation?.mapState,
      eventStates: operation?.eventStates,
      mapLayers: operation?.mapLayers,
    };
    await this._ipc.saveFile({
      data: JSON.stringify(saveFile),
      fileName,
      mimeType: 'application/json',
      filters: [
        {
          name: 'ZS-Karte',
          extensions: ['zsjson'],
        },
      ],
    });
  }

  public createOperation(): void {
    this.operationToEdit.next({
      name: '',
      description: '',
      phase: 'active',
      eventStates: [],
      mapState: this.createMapstate(),
    });
  }

  private createMapstate(): ZsMapState {
    const initLayerId = uuidv4();
    return {
      version: 2,
      id: uuidv4(),
      center: this._session.getOrganizationLongLat(),
      name: '',
      layers: { [initLayerId]: { id: uuidv4(), type: ZsMapLayerStateType.DRAW, name: 'Layer 1' } },
    };
  }
}
