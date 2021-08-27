import { Component, OnInit } from '@angular/core';
import {SharedStateService} from "../shared-state.service";
import {I18NService} from "../i18n.service";
import { MatDialog } from '@angular/material/dialog';
import { MapLegendDisplayComponent } from '../map-legend-display/map-legend-display.component';
import { Layer } from '../layers/layer';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import findOfflineHost from '../lib/findOfflineHost';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  currentMapOpenState = false;
  selectedLayersOpenState = false;
  favoriteLayersOpenState = false;
  availableLayersOpenState = false;

  layerFilter = '';
  filteredAvailableFeatures = [];

  constructor(
    public sharedState: SharedStateService,
    public i18n: I18NService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.sharedState.availableFeatures.subscribe((features) => {
      this.updateFilteredFeatures();
    });
  }

  switchLayer(layer: Layer) {
    if (layer.name == 'Offline') {
      const offlineHost = findOfflineHost();
      this.http.get(offlineHost).subscribe(
        () => this.sharedState.switchToLayer(layer),
        (error) => {
          if (error.status === 200) {
            this.sharedState.switchToLayer(layer);
          } else {
            console.log(error);
            this.snackBar.open(
              this.i18n
                .get('docOfflineMap')
                .replace('${offlineHost}', offlineHost),
              this.i18n.get('close'),
              {
                duration: 6000,
              }
            );
          }
        }
      );
    } else {
      this.sharedState.switchToLayer(layer);
    }
  }

  updateFilteredFeatures() {
    this.filteredAvailableFeatures =
      this.layerFilter === ''
        ? this.sharedState.availableFeatures.value
        : this.sharedState.availableFeatures.value.filter((f) =>
            f.label.toLowerCase().includes(this.layerFilter.toLowerCase())
          );
  }

  showLegend(item) {
    this.dialog.open(MapLegendDisplayComponent, {
      data: item.serverLayerName,
    });
  }
}
