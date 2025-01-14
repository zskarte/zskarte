import { Component, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import { I18NService } from '../state/i18n.service';
import { ZsMapStateService } from '../state/state.service';
import { Sign } from '../core/entity/sign';
import { DrawStyle } from '../map-renderer/draw-style';
import { ZsMapDrawElementState } from 'src/app/state/interfaces';
import { SelectSignDialog } from '../select-sign-dialog/select-sign-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recently-used-signs',
  templateUrl: './recently-used-signs.component.html',
  styleUrls: ['./recently-used-signs.component.scss'],
  imports: [MatButtonModule],
})
export class RecentlyUsedSignsComponent implements OnInit, OnDestroy {
  i18n = inject(I18NService);
  private sharedState = inject(ZsMapStateService);

  private _ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.sharedState
      .observableRecentlyUsedElement()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((elements: ZsMapDrawElementState[]) => {
        // const ids = elements.map((e) => e.symbolId);
        const tmp: Sign[] = [];

        for (const e of elements) {
          const sign = this.dialog().allSigns.find((s) => s.id === e.symbolId);
          if (sign) {
            tmp.push(sign);
          }
        }
        this.signsSource = tmp;
        // this.signsSource = this.dialog.allSigns.filter((s) => ids.includes(s.id));
      });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  readonly dialog = input.required<SelectSignDialog>();
  readonly selectSign = output<Sign>();

  private signsSource: Sign[] = [];

  get signs(): Sign[] {
    return this.signsSource;
  }

  doSelectSign(sign: Sign) {
    this.selectSign.emit(sign);
  }

  // skipcq: JS-0105
  getImageUrl(file: string) {
    if (file) {
      return DrawStyle.getImageUrl(file);
    }
    return null;
  }
}
