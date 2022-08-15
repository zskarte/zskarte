import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { I18NService } from '../i18n.service';
import { SharedStateService } from '../shared-state.service';
import { DrawStyle } from '../drawlayer/draw-style';
import { CustomImageStoreService } from '../custom-image-store.service';
import { Sign } from '../entity/sign';
import Feature from 'ol/Feature';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';

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
      this.signsSource = s;
    });
  }

  @Input() drawLayer: DrawlayerComponent;
  @Output() selectSign: EventEmitter<Sign> = new EventEmitter<Sign>();

  private signsSource: Sign[] = [];

  get signs(): Sign[] {
    return this.signsSource;
  }

  fetchSigns() {
    if (this.drawLayer && this.drawLayer.source) {
      this.drawLayer.source.getFeatures().forEach((f) => {
        const symbol = this.extractSymbol(f);

        this.sharedState.addRecentlyUsedSign(symbol);
      });
    }
  }

  doSelectSign(sign: Sign) {
    this.selectSign.emit(sign);
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
