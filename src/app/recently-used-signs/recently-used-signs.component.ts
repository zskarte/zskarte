import { Component, Input, OnInit } from '@angular/core';
import { I18NService } from '../i18n.service';
import { SharedStateService } from '../shared-state.service';
import { DrawStyle } from '../drawlayer/draw-style';
import { CustomImageStoreService } from '../custom-image-store.service';
import { Sign } from '../entity/sign';
import Feature from 'ol/Feature';

@Component({
  selector: 'app-recently-used-signs',
  templateUrl: './recently-used-signs.component.html',
  styleUrls: ['./recently-used-signs.component.css'],
})
export class RecentlyUsedSignsComponent implements OnInit {
  constructor(
    public i18n: I18NService,
    private sharedState: SharedStateService
  ) {}

  ngOnInit() {
    this.sharedState.lastUsedSigns.subscribe((s) => {
      this.addSign(s);
    });
    this.sharedState.showMapLoader.subscribe(() => {
      this.fetchSigns();
    });
  }

  @Input() featureSource: any;

  private signsSource: Sign[] = [];
  private readonly signsMaxLength = 10;

  get signs(): Sign[] {
    return this.signsSource;
  }

  addSign(sign: Sign) {
    if (!sign) {
      return;
    }

    //compare the src, because src should be unique
    const index = this.signsSource.findIndex((s) => s.src === sign.src);

    if (index !== -1) {
      //Remove the sign to push it at the beginning
      this.signsSource.splice(index, 1);
    } else {
      //Limit the signs to 10 items.
      this.signsSource.splice(
        9,
        this.signsSource.length - (this.signsMaxLength - 1)
      );
    }

    //deep copy
    sign = JSON.parse(JSON.stringify(sign));
    this.signsSource.unshift(sign);
  }

  fetchSigns() {
    if (this.featureSource) {
      this.featureSource.getFeatures().forEach((f) => {
        var symbol = this.extractSymbol(f);

        if (!symbol) {
          return;
        }

        if (this.signs.findIndex((s) => s.src === symbol.src) !== -1) {
          return;
        }

        //Deep copy
        symbol = JSON.parse(JSON.stringify(symbol));
        this.signsSource.push(symbol);
      });

      this.signsSource = this.signsSource.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); //it has to be new Date. probably because createdAt is nullable
      });
      this.signsSource.splice(9, this.signsSource.length - this.signsMaxLength);
    }
  }

  selectSign(sign: Sign) {
    this.sharedState.disableFreeHandDraw();
    this.sharedState.selectSign(sign);
  }

  extractSymbol(f: Feature): Sign {
    const sig = f?.get('sig') as Sign;
    if (!sig || !sig.src) {
      return null;
    }

    return sig;
  }

  getImageUrl(file: string) {
    if (file) {
      const customImageDataUrl = CustomImageStoreService.getImageDataUrl(file);
      if (customImageDataUrl) {
        return customImageDataUrl;
      }
      return DrawStyle.getImageUrl(file);
    }
    return null;
  }
}
