/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { DrawingtoolsComponent } from './drawingtools/drawingtools.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ToolsComponent } from './tools/tools.component';
import { LayersComponent } from './layers/layers.component';
import { CreditsComponent } from './credits/credits.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { DrawingDialogComponent } from './drawing-dialog/drawing-dialog.component';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DrawlayerComponent } from './drawlayer/drawlayer.component';
import { HistoryComponent } from './history/history.component';
import { MatSliderModule } from '@angular/material/slider';
import { FilterComponent } from './filter/filter.component';
import { MatTableModule } from '@angular/material/table';
import { ClockComponent } from './clock/clock.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { GeocoderComponent } from './geocoder/geocoder.component';
import { TextDialogComponent } from './text-dialog/text-dialog.component';
import { SelectedFeatureComponent } from './selected-feature/selected-feature.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { DBConfig, NgxIndexedDBModule } from 'ngx-indexed-db';
import { SessionCreatorComponent } from './session-creator/session-creator.component';
import { NgxMdModule } from 'ngx-md';
import { LanguageChooserComponent } from './language-chooser/language-chooser.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MapLegendDisplayComponent } from './map-legend-display/map-legend-display.component';
import { TagStateComponent } from './tag-state/tag-state.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { CustomImagesComponent } from './custom-images/custom-images.component';
import { CustomImageStoreService } from './custom-image-store.service';
import { MapStoreService } from './map-store.service';
import { EditCoordinatesComponent } from './edit-coordinates/edit-coordinates.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DetailImageViewComponent } from './detail-image-view/detail-image-view.component';
import { HelpComponent } from './help/help.component';
import { MatStepperModule } from '@angular/material/stepper';
import { registerLocaleData } from '@angular/common';
import localeDeCh from '@angular/common/locales/de-CH';

registerLocaleData(localeDeCh)

const dbConfig: DBConfig = {
  name: 'ZSKarte2-DB1.0',
  version: 2,
  objectStoresMeta: [
    {
      store: MapStoreService.STORE_MAP,
      storeConfig: { keyPath: null, autoIncrement: false },
      storeSchema: [],
    },
    {
      store: MapStoreService.STORE_HISTORY,
      storeConfig: { keyPath: null, autoIncrement: false },
      storeSchema: [],
    },
    {
      store: CustomImageStoreService.STORE_IMAGES,
      storeConfig: { keyPath: null, autoIncrement: false },
      storeSchema: [],
    },
  ],
};

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    DrawingtoolsComponent,
    ToolsComponent,
    LayersComponent,
    CreditsComponent,
    ToolbarComponent,
    DrawingDialogComponent,
    DrawlayerComponent,
    HistoryComponent,
    FilterComponent,
    ClockComponent,
    ImportDialogComponent,
    GeocoderComponent,
    TextDialogComponent,
    SelectedFeatureComponent,
    SessionCreatorComponent,
    LanguageChooserComponent,
    ConfirmationDialogComponent,
    ExportDialogComponent,
    MapLegendDisplayComponent,
    TagStateComponent,
    CustomImagesComponent,
    EditCoordinatesComponent,
    DetailImageViewComponent,
    HelpComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    HttpClientModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSliderModule,
    MatTableModule,
    MatRadioModule,
    MatListModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    NgxMdModule.forRoot(),
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatStepperModule,
  ],
  entryComponents: [
    DrawingDialogComponent,
    ImportDialogComponent,
    TextDialogComponent,
    ConfirmationDialogComponent,
    ExportDialogComponent,
    MapLegendDisplayComponent,
    TagStateComponent,
    CustomImagesComponent,
    EditCoordinatesComponent,
    DetailImageViewComponent,
    HelpComponent,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-CH'},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
