import { Component, OnInit } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { getZSOById, ZSO } from '../entity/zso';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'],
})
export class CreditsComponent implements OnInit {
  constructor(
    public i18n: I18NService,
    private sharedState: SharedStateService
  ) {}

  zso: ZSO = null;

  ngOnInit() {
    this.sharedState.session.subscribe((s) => {
      if (s) {
        this.zso = getZSOById(s.zsoId);
      }
    });
  }
}
