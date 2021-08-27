import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';

@Component({
  selector: 'app-geocoder',
  templateUrl: './geocoder.component.html',
  styleUrls: ['./geocoder.component.css'],
})
export class GeocoderComponent {
  @ViewChild('searchField', { static: false }) el: ElementRef;
  @Input() drawLayer: DrawlayerComponent;
  geocoderUrl =
    'https://api3.geo.admin.ch/rest/services/api/SearchServer?type=locations&searchText=';
  foundLocations = [];
  inputText: string = undefined;
  selected = null;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Only handle global events (to prevent input elements to be considered)
    const globalEvent = event.target instanceof HTMLBodyElement;
    if (
      globalEvent &&
      !this.sharedState.featureSource.getValue() &&
      !event.altKey &&
      event.code != 'Escape'
    ) {
      this.el.nativeElement.focus();
      this.el.nativeElement.dispatchEvent(
        new KeyboardEvent('keydown', { key: event.key })
      );
    }
  }

  constructor(
    private http: HttpClient,
    private sharedState: SharedStateService,
    public i18n: I18NService
  ) {
    this.sharedState.session.subscribe((s) => {
      this.selected = null;
    });
  }

  private getCoordinate(geometry) {
    switch (geometry.getType()) {
      case 'Point':
        return geometry.getCoordinates();
      case 'LineString':
        return geometry.getCoordinates()[0];
      case 'Polygon':
        return geometry.getCoordinates()[0][0];
    }
    return null;
  }

  private mapFeatureForSearch(f) {
    const sig = f.get('sig');
    const sign = this.i18n.getLabelForSign(sig);
    let label = '';
    if (sign) {
      label += '<i>' + sign + '</i> ';
    }
    if (sig.label) {
      label += sig.label;
    }
    const normalizedLabel = label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const words = this.inputText.toLowerCase().split(' ');
    let allHits = true;

    words.forEach((word) => {
      if (
        !normalizedLabel
          .toLowerCase()
          .includes(word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
      ) {
        allHits = false;
      }
    });
    const coordinates = this.getCoordinate(f.getGeometry());
    return {
      attrs: {
        label: label,
        normalizedLabel: normalizedLabel,
        mercatorCoordinates: coordinates,
        hit: coordinates ? allHits : false,
        feature: f,
      },
      uuid: f.getId(),
    };
  }

  geoCodeLoad() {
    if (this.inputText.length > 1) {
      const originalInput = this.inputText;
      this.http.get(this.geocoderUrl + this.inputText).subscribe((result) => {
        if (this.inputText === originalInput) {
          this.foundLocations = [];
          this.drawLayer.source
            .getFeatures()
            .map((f) => this.mapFeatureForSearch(f))
            .filter((f) => {
              return f.attrs.hit;
            })
            .forEach((f) => {
              this.foundLocations.push(f);
            });
          this.drawLayer.clusterSource
            .getFeatures()
            .map((f) => this.mapFeatureForSearch(f))
            .filter((f) => {
              return f.attrs.hit;
            })
            .forEach((f) => {
              this.foundLocations.push(f);
            });

          result['results'].forEach((r) => this.foundLocations.push(r));
        }
      });
    } else {
      this.foundLocations = [];
      this.sharedState.gotoCoordinate(null);
    }
  }

  getLabel(selected) {
    return selected ? selected.label.replace(/<[^>]*>/g, '') : undefined;
  }

  geoCodeSelected(event) {
    this.selected = event.option.value;
    this.goToCoordinate(true);
    this.inputText = null;
  }

  previewCoordinate(element) {
    this.doGoToCoordinate(element, false, false);
  }

  private doGoToCoordinate(element, center, select) {
    if (element) {
      if (element.mercatorCoordinates) {
        if (select) {
          this.sharedState.selectFeature(element.feature);
        }
        this.sharedState.gotoCoordinate({
          lat: element.mercatorCoordinates[1],
          lon: element.mercatorCoordinates[0],
          mercator: true,
          center: center,
        });
      } else {
        this.sharedState.gotoCoordinate({
          lat: element.lat,
          lon: element.lon,
          mercator: false,
          center: center,
        });
      }
    } else {
      this.sharedState.gotoCoordinate(null);
    }
  }

  goToCoordinate(center: boolean) {
    this.doGoToCoordinate(this.selected, center, true);
  }

  removeSelectedLocation() {
    this.selected = null;
    this.sharedState.gotoCoordinate(null);
  }
}
