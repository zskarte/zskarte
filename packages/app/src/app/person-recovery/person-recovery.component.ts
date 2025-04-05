import { Component, DestroyRef, inject } from '@angular/core';
import { ZsMapStateService } from '../state/state.service';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaperDimensions, Sign, ZsMapDrawElementState } from '@zskarte/types';
import { AsyncPipe } from '@angular/common';
import { DrawStyle } from '../map-renderer/draw-style';
import { Signs } from '../map-renderer/signs';
import { SessionService } from '../session/session.service';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';
import { getJsPDF } from 'src/app/pdf/jsPDF.factory';

type PersonRecoverySign = Partial<Sign> & {
  text?: string;
  src?: string;
};

type PersonRecoveryRow = ZsMapDrawElementState & {
  sign: PersonRecoverySign;
}

async function svg2png(url?: string, width = 100, height = 100) {
  if (!url) {
    return '';
  }

  const img = new Image();

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  [canvas.width, canvas.height] = [width, height];

  canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/png");
}

@Component({
  selector: 'app-person-recovery',
  imports: [AsyncPipe, MatButtonModule],
  templateUrl: './person-recovery.component.html',
  styles: `
    .recovery {
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .recovery .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }

    .recovery-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
    }

    .recovery-row .text {
      flex: 1;
    }

    .recovery-row img {
      height: 30px;
      width: auto;
    }
    
    .recovery-empty {
      color: var(--mdc-dialog-supporting-text-color);
    }
  `
})
export class PersonRecoveryComponent {
  private state = inject(ZsMapStateService);
  private session = inject(SessionService);
  private destroyRef = inject(DestroyRef);
  i18n = inject(I18NService);

  private printMargin = 10;
  private dimensions = PaperDimensions['A4'];

  affectedPersons$ = this.state.observeDrawElements().pipe(
    takeUntilDestroyed(this.destroyRef),
    map(elements => elements
      .filter(e => (e.elementState?.affectedPersons ?? 0) > 0)
      .map(e => e.elementState as ZsMapDrawElementState)
      .map(state => ({ ...state, sign: this.getSign(state) }))
      .reduce((acc, next) => {
        const el = acc.find(el => el.symbolId === next.symbolId);
        if (!el) {
          return [...acc, next];
        }
        el.affectedPersons = (el.affectedPersons ?? 0) + (next.affectedPersons ?? 0);
        return acc;
      }, [] as PersonRecoveryRow[])
    ),
  );

  async print(rows: PersonRecoveryRow[]) {
    const jsPDF = await getJsPDF();
    const pdf = new jsPDF('portrait', undefined, 'A4');
    const width = this.dimensions[1] - this.printMargin * 2;

    pdf
      .setFontSize(24)
      .setFont('helvetica', 'bold')
      .text(this.i18n.get('personRecoveryOverview'), this.printMargin, this.printMargin + 12, { baseline: 'middle' })
      .setFont('helvetica', 'normal');

    const gap = 10;
    const rowHeight = 20;
    const numberWidth = 15;
    const imageWidth = 20;

    let offsetY = 36;
    for (const row of rows) {
      const textOffsetY = offsetY + rowHeight / 2;
      const imageOffsetX = this.printMargin + numberWidth + gap;
      const textOffsetX = imageOffsetX + imageWidth + gap;

      pdf
        .setFontSize(24)
        .setTextColor('red')
        .text(row.affectedPersons?.toString() ?? '', this.printMargin, textOffsetY, { maxWidth: numberWidth, baseline: 'middle' })
        .addImage(await svg2png(row.sign.src), 'PNG', imageOffsetX, offsetY, imageWidth, imageWidth)
        .setTextColor('black')
        .setFontSize(20)
        .text(row.sign.text ?? '', textOffsetX, textOffsetY, { maxWidth: width - textOffsetX, baseline: 'middle' });

      offsetY += rowHeight + gap;
    }

    pdf
      .save('recovery.pdf');
  }

  private getSign(state: ZsMapDrawElementState): PersonRecoverySign {
    const sign = Signs.getSignById(state.symbolId);

    return {
      ...sign,
      text: sign?.[this.session.getLocale()],
      src: DrawStyle.getImageUrl(sign?.src ?? ''),
    }
  }
}
