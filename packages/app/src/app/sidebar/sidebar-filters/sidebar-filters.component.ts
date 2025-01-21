/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { combineLatest, Subject } from 'rxjs';
import { I18NService } from 'src/app/state/i18n.service';
import capitalizeFirstLetter from 'src/app/helper/capitalizeFirstLetter';
import { Sign, signCategories, SignCategory } from '@zskarte/types';
import { ZsMapStateService } from 'src/app/state/state.service';
import { ZsMapBaseDrawElement } from 'src/app/map-renderer/elements/base/base-draw-element';
import { FeatureLike } from 'ol/Feature';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-sidebar-filters',
  templateUrl: './sidebar-filters.component.html',
  styleUrls: ['./sidebar-filters.component.scss'],
  imports: [
    MatAccordion,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDividerModule,
    AsyncPipe,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
})
export class SidebarFiltersComponent implements OnInit, OnDestroy {
  i18n = inject(I18NService);
  private mapState = inject(ZsMapStateService);

  filterSymbols: any[] = [];
  signCategories: any[] = [...signCategories.values()];
  hiddenSymbols$: Observable<number[]>;
  hiddenFeatureTypes$: Observable<string[]>;
  enableClustering$: Observable<boolean>;
  filtersOpenState = false;
  filtersGeneralOpenState = false;
  capitalizeFirstLetter = capitalizeFirstLetter;
  private _ngUnsubscribe = new Subject<void>();

  constructor() {
    this.hiddenSymbols$ = this.mapState.observeHiddenSymbols().pipe(takeUntil(this._ngUnsubscribe));
    this.hiddenFeatureTypes$ = this.mapState.observeHiddenFeatureTypes().pipe(takeUntil(this._ngUnsubscribe));
    this.enableClustering$ = this.mapState.observeEnableClustering().pipe(takeUntil(this._ngUnsubscribe));
  }

  ngOnInit(): void {
    combineLatest([this.mapState.observeDrawElements(), this.mapState.observeHiddenSymbols(), this.mapState.observeHiddenFeatureTypes()])
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(([drawElements, hiddenSymbols, hiddenFeatureTypes]) => {
        this.updateFilterSymbolsAndFeatureTypes(drawElements, hiddenSymbols, hiddenFeatureTypes);
      });
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  updateFilterSymbolsAndFeatureTypes(elements: ZsMapBaseDrawElement[], hiddenSymbols: number[], hiddenFeatureTypes: string[]) {
    const symbols = {};
    if (elements && elements.length > 0) {
      elements.forEach((element) => {
        this.extractSymbol(element.getOlFeature(), symbols);
      });
    }
    this.filterSymbols = Object.values(symbols)
      .sort((a: any, b: any) => a.label.localeCompare(b.label))
      .map((symbol: any) => ({ ...symbol, hidden: hiddenSymbols.includes(symbol.id) || hiddenFeatureTypes.includes(symbol.filterValue) }));

    const availableKats = Object.values(symbols).map((s: any) => s.kat);
    const catObjects = [...signCategories.values()].filter((s) => availableKats.includes(s.name));
    catObjects.forEach((category: any) => {
      const categorySymbols = this.filterSymbols.filter((symbol: any) => symbol.kat === category.name);

      const allHidden = categorySymbols.every((symbol: any) => symbol.hidden);
      const someHidden = categorySymbols.some((symbol: any) => symbol.hidden);

      category.isVisible = !allHidden && !someHidden;
      category.isPartiallyVisible = !allHidden && someHidden;
    });
    this.signCategories = catObjects;
  }

  extractSymbol(f: FeatureLike, symbols: Record<string, any>) {
    const sig = f.get('sig');
    if (sig) {
      if (sig.src) {
        if (!symbols[sig.src]) {
          const dataUrl = null; //CustomImageStoreService.getImageDataUrl(sig.src);
          symbols[sig.src] = {
            label: this.i18n.getLabelForSign(sig),
            origSrc: sig.src,
            src: dataUrl ? dataUrl : `assets/img/signs/${sig.src}`,
            kat: sig.kat,
            id: sig.id,
          };
        }
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'Polygon' && !sig.src) {
        symbols['not_labeled_polygon'] = {
          type: 'Polygon',
          label: this.i18n.get('polygon'),
          filterValue: 'polygon',
          icon: 'widgets',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && sig.text) {
        symbols['text_element'] = {
          type: 'LineString',
          label: this.i18n.get('text'),
          filterValue: 'text',
          icon: 'font_download',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && sig.freehand) {
        symbols['free_hand_element'] = {
          type: 'LineString',
          label: this.i18n.get('freeHand'),
          filterValue: 'line',
          icon: 'gesture',
        };
      } else if (sig.type === undefined && f?.getGeometry()?.getType() === 'LineString' && !sig.src) {
        symbols['not_labeled_line'] = {
          type: 'LineString',
          label: this.i18n.get('line'),
          filterValue: 'line',
          icon: 'show_chart',
        };
      }
    }
  }

  public filterAll(active: boolean) {
    this.mapState.filterAll(
      active,
      this.filterSymbols.map((symbol) => symbol.filterValue),
    );
  }

  public toggleSymbolOrFeatureFilter(symbol: Sign) {
    if (symbol.type === '' || symbol.type === undefined) {
      this.mapState.toggleSymbol(symbol.id);
    } else {
      if (symbol.filterValue !== '' || symbol.filterValue !== undefined) this.mapState.toggleFeatureType(symbol.filterValue as string);
    }
  }

  public toggleCategoryFilter($event: MatCheckboxChange, category: SignCategory) {
    const categorySymbols = this.filterSymbols.filter((symbol: Sign) => symbol.kat === category.name);

    if ($event.checked) {
      categorySymbols.forEach((symbol: any) => {
        if (symbol.hidden) {
          this.toggleSymbolOrFeatureFilter(symbol);
        }
      });
    } else {
      categorySymbols.forEach((symbol: any) => {
        if (!symbol.hidden) {
          this.toggleSymbolOrFeatureFilter(symbol);
        }
      });
    }
  }

  public toggleClustering() {
    this.mapState.toggleClustering();
  }
}
