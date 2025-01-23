import { Component, OnDestroy, inject } from '@angular/core';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { SessionService } from '../session.service';
import { IZsMapOperation, ZsOperationPhase } from '@zskarte/types';
import { I18NService } from '../../state/i18n.service';
import { OperationService } from './operation.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { IncidentSelectComponent } from '../../incident-select/incident-select.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
  imports: [
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    AsyncPipe,
    DatePipe,
    MatActionList,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    MatListItem,
    IncidentSelectComponent,
    MatButtonModule,
    MatInputModule,
  ],
})
export class OperationsComponent implements OnDestroy {
  private _session = inject(SessionService);
  i18n = inject(I18NService);
  operationService = inject(OperationService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  private _ngUnsubscribe = new Subject<void>();
  public showOpPhase: ZsOperationPhase = 'active';

  constructor() {
    const route = this.route;

    this.operationService.loadLocal(this.showOpPhase);
    this._session
      .observeOrganizationId()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(async (organizationId) => {
        if (organizationId) {
          await this.operationService.reload(this.showOpPhase);
        }
      });
    //select operationId if set as parameter and have access to
    firstValueFrom(route.queryParams).then((queryParams) => {
      if (queryParams['operationId']) {
        try {
          const operationId = parseInt(queryParams['operationId']);
          this.operationService.operations.pipe(takeUntil(this._ngUnsubscribe)).subscribe((operations) => {
            const operation = operations.find((o) => o.id === operationId);
            if (operation) {
              this.selectOperation(operation);
            }
          });
        } catch {
          //ignore invalid operationId param
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  public selectOperation(operation: IZsMapOperation) {
    if (operation.documentId) {
      this._session.setOperation(operation);
    }
  }

  public deleteOperation(operation: IZsMapOperation) {
    const confirm = this.dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('deleteOperationConfirm'),
    });
    confirm.afterClosed().subscribe((r) => {
      this.operationService.deleteOperation(operation);
    });
  }

  public async logout(): Promise<void> {
    await this._session.logout('logout');
  }

  public async showActiveScenarios(): Promise<void> {
    this.showOpPhase = 'active';
    await this.operationService.reload(this.showOpPhase);
  }

  public async showArchivedScenarios(): Promise<void> {
    this.showOpPhase = 'archived';
    await this.operationService.reload(this.showOpPhase);
  }
}
