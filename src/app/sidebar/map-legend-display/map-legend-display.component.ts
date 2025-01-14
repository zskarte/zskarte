import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { GeoadminService } from '../../map-layer/geoadmin/geoadmin.service';
import { I18NService } from '../../state/i18n.service';
import { MapLayer, WMSMapLayer } from '../../map-layer/map-layer-interface';
import { WmsService } from '../../map-layer/wms/wms.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-map-legend-display',
  templateUrl: './map-legend-display.component.html',
  styleUrls: ['./map-legend-display.component.scss'],
  imports: [MatProgressSpinnerModule, MatDialogModule],
})
export class MapLegendDisplayComponent {
  data = inject<MapLayer>(MAT_DIALOG_DATA);
  i18n = inject(I18NService);

  html: string | null = null;
  constructor() {
    const data = this.data;
    const geoAdmin = inject(GeoadminService);
    const wmsService = inject(WmsService);

    if (!data.source && data.serverLayerName) {
      geoAdmin.getLegend(data.serverLayerName).subscribe((data: string) => {
        this.html = data;
      });
    } else if (data.type === 'wms') {
      wmsService.getWMSLegend(data as WMSMapLayer).subscribe((html: string | null) => {
        if (html) {
          this.html = html;
        } else {
          this.html = this.i18n.get('legendNotLoaded');
        }
      });
    } else if (data.type === 'wms_custom') {
      const html = wmsService.getWMSCustomLegend(data as WMSMapLayer);
      if (html) {
        this.html = html;
      } else {
        this.html = this.i18n.get('legendNotLoaded');
      }
    } else {
      this.html = this.i18n.get('legendNotLoaded');
    }
  }
}
