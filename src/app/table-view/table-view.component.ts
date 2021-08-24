import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';
import { getCenter } from 'ol/extent';
import Feature from 'ol/Feature';

import { Session } from '../entity/session';
import { MapStoreService } from '../map-store.service';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { DrawStyle } from '../drawlayer/draw-style';

import { mercatorProjection, swissProjection } from '../projections';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';

type TableRow = {
  label?: string;
  type?: string;
  src?: string;
  coordinates?: Number[];
}

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.css']
})
export class TableViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() closeTable = new EventEmitter();
  @ViewChild(MatSort) sort: MatSort;


  private onDestroy = new Subject();
  dataSource = new MatTableDataSource<TableRow>([]);
  displayedColumns = ['image', 'type', 'label', 'coordinates'];

  constructor(private sharedState: SharedStateService, private mapStore: MapStoreService, public i18n: I18NService) { }

  ngOnInit(): void {
    combineLatest([ this.sharedState.session, this.i18n.currentLocale ])
      .pipe(takeUntil(this.onDestroy))
      .subscribe(([session]) => this.loadTable(session));
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async loadTable(session: Session) {
    if (!session?.uuid) {
      return;
    }

    const map: GeoJSON = await this.mapStore.getMap(session.uuid);

    if (!map) {
      return;
    }

    const geoJSON = new GeoJSON({ defaultDataProjection: 'EPSG:3857' });
    const features: Feature[] = geoJSON.readFeatures(map);
    const data = features
      // only allow features with coordinates
      .filter(feature => Boolean(feature?.getGeometry()))
      .map((feature) => ({
        type: feature.getProperties()?.sig?.[this.i18n.locale],
        label: feature.getProperties()?.sig?.label,
        src: feature.getProperties()?.sig?.src ? DrawStyle.getImageUrl(feature.getProperties().sig.src) : null,
        coordinates: this.mapCoordinates(feature)
      }));

    this.dataSource.data = data;
  }

  mapCoordinates(feature: Feature): number[]  {
    const center = getCenter(feature.getGeometry().getExtent());
    return transform(
      center,
      mercatorProjection,
      swissProjection
    );
  }

  closeClick() {
    this.closeTable.emit(null);
  }

  applyFilter(event: KeyboardEvent) {
    this.dataSource.filter = (event.target as HTMLInputElement).value;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
