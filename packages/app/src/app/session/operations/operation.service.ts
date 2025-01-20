import { Injectable, inject } from '@angular/core';
import { ApiService, IApiRequestOptions } from '../../api/api.service';
import { SessionService } from '../session.service';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { OperationExportFileVersion } from '../../core/entity/operationExportFile';
import { ImportDialogComponent } from '../../import-dialog/import-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { IpcService } from '../../ipc/ipc.service';
import { MatDialog } from '@angular/material/dialog';
import { db } from '../../db/db';
import { IZsMapOperation, ZsOperationStatus, IZSMapOperationMapLayers, IZsMapState, ZsMapLayerStateType } from '@zskarte/types';

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

    operation.status = 'archived';
    if (operation?.id < 0) {
      await OperationService.persistLocalOpertaion(operation);
    } else {
      await this._api.put(`/api/operations/${operation.id}/archive`, null);
    }
    await this.reload('active');
  }

  public async unarchiveOperation(operation: IZsMapOperation): Promise<void> {
    if (!operation || !operation?.id) {
      return;
    }

    operation.status = 'active';
    if (operation?.id < 0) {
      await OperationService.persistLocalOpertaion(operation);
    } else {
      await this._api.put(`/api/operations/${operation.id}/unarchive`, null);
    }
    await this.reload('archived');
  }

  public async saveOperation(operation: IZsMapOperation): Promise<void> {
    if (operation.id) {
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
    if (!operation.status) {
      operation.status = 'active';
    }

    if (this._session.isWorkLocal()) {
      const minId = Math.min(0, ...(await db.localOperation.toArray()).map((o) => o.id ?? 0));
      operation.id = minId - 1;
      await db.localOperation.add(operation);
    } else {
      await this._api.post('/api/operations', { data: { ...operation, organization: this._session.getOrganizationId() } });
    }
  }

  public async updateMeta(operation: IZsMapOperation): Promise<void> {
    if ((operation.id ?? 0) < 0) {
      await OperationService.persistLocalOpertaion(operation);
    } else {
      await this._api.put(`/api/operations/${operation.id}/meta`, {
        data: { name: operation.name, description: operation.description, eventStates: operation.eventStates },
      });
    }
  }

  public async getOperation(operationId: number, options?: IApiRequestOptions) {
    if (operationId < 0) {
      return db.localOperation.get(operationId);
    } else {
      const { error, result } = await this._api.get<IZsMapOperation>(`/api/operations/${operationId}`, options);
      if (error || !result) return null;
      return result;
    }
  }

  public static async persistLocalOpertaion(operation: IZsMapOperation) {
    await db.localOperation.put(operation);
  }

  private static getLocalOperations(status: ZsOperationStatus) {
    return db.localOperation.where('status').equals(status).toArray();
  }

  public async loadLocal(status: ZsOperationStatus): Promise<void> {
    const localOperations = await OperationService.getLocalOperations(status);
    if (!localOperations) return;
    this.operations.next(localOperations);
  }

  public async reload(status: ZsOperationStatus): Promise<void> {
    let operations: IZsMapOperation[] = [];
    const localOperations = await OperationService.getLocalOperations(status);
    if (localOperations) {
      operations = localOperations;
    }
    if (!this._session.isWorkLocal()) {
      const { error, result: savedOperations } = await this._api.get<IZsMapOperation[]>(`/api/operations/overview?status=${status}`);
      if (!error && savedOperations != undefined) {
        operations = [...operations, ...savedOperations];
      }
      this.operations.next(operations);
    } else {
      this.operations.next(operations);
    }
  }

  public async updateMapLayers(operationId: number, data: IZSMapOperationMapLayers) {
    if (operationId < 0) {
      const operation = this._session.getOperation();
      if (operation) {
        operation.mapLayers = data;
        await OperationService.persistLocalOpertaion(operation);
      }
    } else {
      await this._api.put(`/api/operations/${operationId}/mapLayers`, { data });
    }
  }

  public async updateLocalMapState(mapState: IZsMapState) {
    const operation = this._session.getOperation();
    if (operation) {
      operation.mapState = mapState;
      await OperationService.persistLocalOpertaion(operation);
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
          status: 'active',
          eventStates: result.eventStates,
          mapState,
          mapLayers: result.mapLayers,
        };
        await this.insertOperation(operation);
      }
    });
  }

  public async exportOperation(operationId: number | undefined): Promise<void> {
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
      status: 'active',
      eventStates: [],
      mapState: this.createMapstate(),
    });
  }

  private createMapstate(): IZsMapState {
    return {
      version: 1,
      id: uuidv4(),
      center: this._session.getOrganizationLongLat(),
      name: '',
      layers: [{ id: uuidv4(), type: ZsMapLayerStateType.DRAW, name: 'Layer 1' }],
    };
  }
}
