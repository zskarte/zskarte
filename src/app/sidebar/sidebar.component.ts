import { Component, OnInit } from '@angular/core';
import {SharedStateService} from "../shared-state.service";
import {I18NService} from "../i18n.service";
import { MatDialog } from '@angular/material/dialog';
import { MapLegendDisplayComponent } from '../map-legend-display/map-legend-display.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  currentMapOpenState = false;
  selectedLayersOpenState = false;
  favoriteLayersOpenState = false;
  availableLayersOpenState = false;

  layerFilter =  '';
  filteredAvailableFeatures = [];

  constructor(
    public sharedState: SharedStateService,
    public i18n: I18NService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.sharedState.availableFeatures.subscribe(features => {
      this.updateFilteredFeatures();
    });
  }

  updateFilteredFeatures() {
    this.filteredAvailableFeatures = this.layerFilter === '' ?
      this.sharedState.availableFeatures.value :
      this.sharedState.availableFeatures.value.filter(f => f.label.toLowerCase().includes(this.layerFilter.toLowerCase()));
  }

  showLegend(item) {
    this.dialog.open(MapLegendDisplayComponent, {
      data: item.serverLayerName,
    });
  }
}
