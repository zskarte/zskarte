import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { ChangesetService } from '../changeset.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { ZsMapStateService } from 'src/app/state/state.service';

@Component({
  selector: 'app-changeset-overlay',
  templateUrl: './changeset-overlay.component.html',
  styleUrl: './changeset-overlay.component.scss',
  imports: [MatIconModule, MatButtonModule, MatBadge],
})
export class ChangesetOverlayComponent {
  @ViewChild('progressRing', { static: false }) progressRing!: ElementRef<SVGCircleElement>;
  private _state = inject(ZsMapStateService);
  changesetService = inject(ChangesetService);

  private timeoutId: any;
  private progressElement: SVGCircleElement | null = null;

  progress = 0; // 0 = voll, 100 = leer
  circumference = 2 * Math.PI * 20; // Umfang des Rings (r=20)
  dashOffset = 0;

  constructor() {
    effect(() => {
      const val = this.changesetService.timeout();
      if (val === null) {
        this.stopProgressTimer();
      } else {
        this.startProgressTimer(val);
      }
    });
  }
  ngAfterViewInit() {
    this.progressElement = this.progressRing?.nativeElement;
  }

  newChangeset() {
    this.changesetService.newChangeset(undefined, true);
  }

  makeManual() {
    this.changesetService.markManual();
  }

  finishChangeset(byTimer = false) {
    this.stopProgressTimer();
    this._state.finishCurrentChangeset(!byTimer);
  }

  resolveConflicts() {
    this.changesetService.openChangesetMergeView();
  }

  retrySubmit() {
    this.changesetService.submitOutgoing();
  }

  private startProgressTimer(totalTime: number): void {
    this.stopProgressTimer();

    this.progress = 0;
    this.updateRing();

    const interval = 250;
    const steps = totalTime / interval;

    let step = 0;
    this.timeoutId = setInterval(() => {
      step++;
      this.progress = (step / steps) * 100;
      this.updateRing();

      if (step >= steps) {
        this.stopProgressTimer();
        if (!this.changesetService.saving() && !this.changesetService.inconsistent()) {
          this.finishChangeset(true);
        }
      }
    }, interval);
  }

  private updateRing(): void {
    // Von voll (dashOffset=0) nach leer (dashOffset=circumference)
    this.dashOffset = (this.progress / 100) * this.circumference;
    if (this.progressElement) {
      this.progressElement.style.strokeDashoffset = this.dashOffset.toString();
    }
  }

  private stopProgressTimer(): void {
    if (this.timeoutId) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
      this.progress = 0;
      this.updateRing();
    }
  }

  ngOnDestroy(): void {
    this.stopProgressTimer();
  }
}
