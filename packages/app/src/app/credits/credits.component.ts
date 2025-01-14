import { Component, inject } from '@angular/core';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  imports: [MatIconModule],
})
export class CreditsComponent {
  i18n = inject(I18NService);
  session = inject(SessionService);

  public operationName = '';
  public logo = '';
  public workLocal = false;

  constructor() {
    const session = this.session;

    this.operationName = session.getOperationName() ?? '';
    this.logo = session.getLogo() ?? '';
    this.workLocal = session.isWorkLocal();
  }
}
