import { ChangeDetectorRef, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { I18NService } from '../../state/i18n.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HelpComponent } from '../../help/help.component';
import { ZsMapStateService } from '../../state/state.service';
import { BehaviorSubject } from 'rxjs';
import { SessionService } from '../../session/session.service';
import { ZsMapBaseDrawElement } from '../../map-renderer/elements/base/base-draw-element';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { exportProtocolExcel, mapProtocolEntry, ProtocolEntry } from '../../helper/protocolEntry';
import { ProtocolTableComponent } from '../../protocol-table/protocol-table.component';
import { ShareDialogComponent } from '../../session/share-dialog/share-dialog.component';
import { RevokeShareDialogComponent } from '../../session/revoke-share-dialog/revoke-share-dialog.component';
import { OperationService } from '../../session/operations/operation.service';
import { first } from 'rxjs/operators';
import { ChangeType, ProjectionSelectionComponent } from '../../projection-selection/projection-selection.component';
import { SidebarContext } from '../sidebar.interfaces';
import { SidebarService } from '../sidebar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { IncidentSelectComponent } from '../../incident-select/incident-select.component';
import { MatMenuModule } from '@angular/material/menu';
import { Locale, LOCALES, PermissionType, AccessTokenType } from '@zskarte/types';
import { PersonRecoveryComponent } from "../../person-recovery/person-recovery.component";
import { ExpertViewHelpComponent } from 'src/app/map-layer/expert-view-help/expert-view-help.component';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    IncidentSelectComponent,
    MatMenuModule,
    AsyncPipe,
    CommonModule,
    MatDialogModule,
    ProjectionSelectionComponent,
    MatButtonModule,
],
})
export class SidebarMenuComponent {
  i18n = inject(I18NService);
  private cdr = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  zsMapStateService = inject(ZsMapStateService);
  session = inject(SessionService);
  private datePipe = inject(DatePipe);
  private _dialog = inject(MatDialog);
  private _operation = inject(OperationService);
  sidebar = inject(SidebarService);

  readonly projectionSelectionTemplate = viewChild.required<TemplateRef<unknown>>('projectionSelectionTemplate');

  locales: Locale[] = LOCALES;
  protocolEntries: ProtocolEntry[] = [];
  public incidents = new BehaviorSubject<number[]>([]);
  public hasWritePermission = false;
  public isArchived = true;
  public workLocal = false;

  constructor() {
    this.incidents.next(this.session.getOperationEventStates() || []);
    this.hasWritePermission = this.session.hasWritePermission();
    this.isArchived = this.session.isArchived();
    this.workLocal = this.session.isWorkLocal()
  }

  async updateIncidents(incidents: number[]): Promise<void> {
    const operation = this.session.getOperation();
    if (operation) {
      if (operation.eventStates.toString() !== incidents.toString()) {
        operation.eventStates = incidents;
        await this._operation.updateMeta(operation);
      }
    }
  }

  toggleHistory(): void {
    this.zsMapStateService.toggleDisplayMode();
  }

  help(): void {
    this.dialog.open(HelpComponent, { data: false });
  }

  showExpertViewHelp(){
    this.dialog.open(ExpertViewHelpComponent);
  }

  protocolTable(): void {
    this.dialog.open(ProtocolTableComponent, { data: false });
  }

  personRecovery(): void {
    this.dialog.open(PersonRecoveryComponent);
  }

  protocolExcelExport(): void {
    const projectionDialog = this.dialog.open(this.projectionSelectionTemplate(), {
      width: '450px',
      data: {
        projectionFormatIndex: 0,
        numerical: true,
      } as ChangeType,
    });
    projectionDialog.afterClosed().subscribe((result: ChangeType | undefined) => {
      if (result) {
        this.zsMapStateService
          .observeDrawElements()
          .pipe(first())
          .subscribe((elements: ZsMapBaseDrawElement[]) => {
            this.protocolEntries = mapProtocolEntry(
              elements,
              this.datePipe,
              this.i18n,
              this.session.getLocale() === undefined ? 'de' : this.session.getLocale(),
              result.projectionFormatIndex ?? 0,
              result.numerical ?? true,
            );
            exportProtocolExcel(this.protocolEntries, this.i18n);
          });
      }
    });
  }

  print(): void {
    this.sidebar.toggle(SidebarContext.Print);
  }

  setLocale(locale: Locale) {
    this.session.setLocale(locale);
  }

  navigateEvents() {
    this.session.setOperation(undefined);
  }

  async generateShareLink(readOnly: boolean, isOneWayLink: boolean) {
    const joinCode = await this.session.generateShareLink(
      readOnly ? PermissionType.READ : PermissionType.WRITE,
      isOneWayLink ? AccessTokenType.SHORT : AccessTokenType.LONG,
    );
    this._dialog.open(ShareDialogComponent, {
      data: joinCode,
    });
  }

  showRevokeShareDialog() {
    this._dialog.open(RevokeShareDialogComponent);
  }
}
