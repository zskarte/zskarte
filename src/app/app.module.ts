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
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import { SidebarComponent } from './sidebar/sidebar.component';

registerLocaleData(localeDeCh)

const dbConfig: DBConfig = {
  name: 'zskarte-db1',
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
    ConfirmationDialogComponent,
    ExportDialogComponent,
    MapLegendDisplayComponent,
    TagStateComponent,
    CustomImagesComponent,
    EditCoordinatesComponent,
    DetailImageViewComponent,
    HelpComponent,
    SidebarComponent,
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
    MatIconModule,
    MatSidenavModule,
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
