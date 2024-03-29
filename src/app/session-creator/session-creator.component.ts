import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import { I18NService, LOCALES } from '../i18n.service';
import { Session } from '../entity/session';
import { v4 as uuidv4 } from 'uuid';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { LIST_OF_ZSO, ZSO, getZSOById } from '../entity/zso';
import { PreferencesService } from '../preferences.service';
import { SessionsService } from '../sessions.service';
import { MapStoreService } from '../map-store.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-session-creator',
  templateUrl: './session-creator.component.html',
  styleUrls: ['./session-creator.component.css'],
})
export class SessionCreatorComponent implements OnInit {
  session: Session;
  hidepw = true;
  enteredPassword = '';
  enteredPasswordInvalid = false;
  mapDataOvertake = true;
  editMode: boolean;
  listOfZSO: ZSO[] = LIST_OF_ZSO;
  allSessions = null;
  locales: string[] = LOCALES;

  @ViewChild('fileInput', { static: false }) el: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedState: SharedStateService,
    public i18n: I18NService,
    private preferences: PreferencesService,
    private sessions: SessionsService,
    private mapStore: MapStoreService,
    public dialogRef: MatDialogRef<SessionCreatorComponent>,
    public dialog: MatDialog
  ) {
    this.session = data ? data.session : null;
    this.editMode = data ? data.edit : null;
    if (!this.session) {
      const defaultZSO = preferences.getZSO();
      this.session = {
        title: null,
        uuid: uuidv4(),
        zsoId: defaultZSO ? defaultZSO.id : null,
        start: new Date(),
      };
      this.editMode = false;
    }
  }

  ngOnInit(): void {
    let offDate = new Date(1, 1, 1);
    this.allSessions = this.sessions.getAllSessions().sort((a, b) => {
      let aa = a.start != null ? new Date(a.start) : offDate;
      let bb = b.start != null ? new Date(b.start) : offDate;
      return aa < bb ? 1 : aa === bb ? 0 : -1;
    });
  }

  get allSessionsButActive() {
    if (this.session) {
      return this.allSessions.filter((s) => {
        return s.uuid !== this.session.uuid;
      });
    } else {
      return this.allSessions;
    }
  }

  submit(): boolean {
    if (this.enteredPwIsValid()) {
      if (
        this.session.zsoId == 'zso_guest' &&
        this.session.uuid != '' &&
        !this.editMode
      ) {
        this.preferences.removeSessionSpecificPreferences(this.session.uuid);
        this.session.uuid = uuidv4();
        this.session.start = new Date();
      } else if (
        this.session.uuid == '' ||
        (!this.mapDataOvertake && !this.editMode)
      ) {
        // Since we're not in edit mode, we want the result to be a new map.
        this.session.uuid = uuidv4();
        this.session.start = new Date();
      }
      this.preferences.setZSO(this.session.zsoId);
      this.sessions.saveSession(this.session);
      this.sharedState.loadSession(this.session);
      this.dialogRef.close();
      return true;
    }
    return false;
  }

  enteredPwIsValid(): boolean {
    const selected: ZSO = getZSOById(this.session.zsoId);
    if (
      selected != null &&
      (selected.auth.length == 0 ||
        selected.auth == Md5.hashStr(this.enteredPassword))
    ) {
      this.enteredPasswordInvalid = false;
      return true;
    }
    this.enteredPasswordInvalid = true;
    return false;
  }

  loadSession(session: Session) {
    this.preferences.setZSO(session.zsoId);
    this.sharedState.loadSession(session);
  }

  private handleSessionImport(session: Session, payload: any) {
    delete payload['session'];
    if (payload.history) {
      this.mapStore.saveHistory(session.uuid, payload.history);
      delete payload['history'];
    }
    this.sessions.saveSession(session);
    this.mapStore.saveMap(session.uuid, payload).then(() => {
      this.loadSession(session);
      this.dialogRef.close();
    });
  }

  importSessionFromFile(): void {
    const reader = new FileReader();
    for (let index = 0; index < this.el.nativeElement.files.length; index++) {
      reader.onload = () => {
        // this 'text' is the content of the file
        const payload = JSON.parse(<string>reader.result);
        if (payload.session) {
          const s = payload.session;
          if (
            this.allSessions.filter((session) => {
              return session.uuid === s.uuid;
            }).length > 0
          ) {
            const confirm = this.dialog.open(ConfirmationDialogComponent, {
              data: this.i18n.get('importMapConflict'),
            });
            confirm.afterClosed().subscribe((result) => {
              if (!result) {
                s.uuid = uuidv4();
                s.title =
                  s.title +
                  ' ( ' +
                  this.i18n.get('copy') +
                  ' ' +
                  new Date().toISOString() +
                  ' )';
              }
              this.handleSessionImport(s, payload);
            });
          } else {
            this.handleSessionImport(s, payload);
          }
        } else {
          this.handleSessionImport(this.session, payload);
        }
      };
      reader.readAsText(this.el.nativeElement.files[index], 'UTF-8');
    }
  }
}
