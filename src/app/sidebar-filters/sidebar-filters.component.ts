import { Component, Input, OnInit } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';
import { DisplayMode } from '../entity/displayMode';
import { CustomImageStoreService } from '../custom-image-store.service';
import { I18NService } from '../i18n.service';
import { signCategories } from '../entity/sign';
import capitalizeFirstLetter from '../lib/capitalizeFirstLetter';

@Component({
  selector: 'app-sidebar-filters',
  templateUrl: './sidebar-filters.component.html',
  styleUrls: ['./sidebar-filters.component.css'],
})
export class SidebarFiltersComponent implements OnInit {
  filterSymbols: any[];
  historyMode: boolean;
  filterKeys: any[];
  @Input() drawLayer: DrawlayerComponent;

  filtersOpenState = false;
  filtersGeneralOpenState = false;
  signCategories = [...signCategories.values()];
  filteredCategories: string[] = [];
  capitalizeFirstLetter = capitalizeFirstLetter;

  constructor(
    public i18n: I18NService,
    private sharedState: SharedStateService
  ) {}

  ngOnInit(): void {
    this.sharedState.showMapLoader.subscribe((l) => {
      if (!l) {
        // The loader has been hidden -> we should check if we have new symbols for filters.
        this.updateFilterSymbols();
      }
    });

    this.sharedState.drawingManipulated.subscribe((updated) => {
      if (updated) {
        this.updateFilterSymbols();
      }
    });

    this.sharedState.displayMode.subscribe((mode) => {
      this.historyMode = mode === DisplayMode.HISTORY;
    });
  }

  updateFilterSymbols() {
    const symbols = {};
    if (this.drawLayer && this.drawLayer.source) {
      this.drawLayer.source
        .getFeatures()
        .forEach((f) => this.extractSymbol(f, symbols));
      if (this.historyMode) {
        this.drawLayer.clusterSource
          .getFeatures()
          .forEach((f) => this.extractSymbol(f, symbols));
      }
      this.filterKeys = Object.keys(symbols);

      this.filterSymbols = Object.values(symbols).sort((a: any, b: any) =>
        a.label.localeCompare(b.label)
      );
    }
  }

  extractSymbol(f, symbols) {
    const sig = f.get('sig');
    if (sig) {
      if (sig.src) {
        if (!symbols[sig.src]) {
          const dataUrl = CustomImageStoreService.getImageDataUrl(sig.src);
          symbols[sig.src] = {
            label: this.i18n.getLabelForSign(sig),
            origSrc: sig.src,
            src: dataUrl ? dataUrl : 'assets/img/signs/' + sig.src,
            kat: sig.kat,
          };
        }
      } else if (sig.type === 'Polygon' && !sig.src) {
        symbols['not_labeled_polygon'] = {
          type: 'Polygon',
          label: this.i18n.get('polygon'),
          filterValue: 'not_labeled_polygon',
          icon: 'widgets',
        };
      } else if (sig.type === 'LineString' && sig.text) {
        symbols['text_element'] = {
          type: 'LineString',
          label: this.i18n.get('text'),
          filterValue: 'text_element',
          icon: 'font_download',
        };
      } else if (sig.type === 'LineString' && sig.freehand) {
        symbols['free_hand_element'] = {
          type: 'LineString',
          label: this.i18n.get('freeHand'),
          filterValue: 'free_hand_element',
          icon: 'gesture',
        };
      } else if (sig.type === 'LineString' && !sig.src) {
        symbols['not_labeled_line'] = {
          type: 'LineString',
          label: this.i18n.get('line'),
          filterValue: 'not_labeled_line',
          icon: 'show_chart',
        };
      }
    }
  }

  public filterAll(active: boolean) {
    this.drawLayer.toggleFilters(this.filterKeys, active);
  }

  public filterCategory(category: string) {
    const index = this.filteredCategories.findIndex((c) => c === category);
    if (index !== -1) {
      this.filteredCategories.splice(index, 1);
    } else {
      this.filteredCategories.push(category);
    }

    const signs = this.filterSymbols.filter((s) => s.kat === category);
    this.drawLayer.toggleFilters(signs, index === -1);
  }

  public isCategoryFiltered(category: string): boolean {
    const i = this.filteredCategories.findIndex((c) => c === category) !== -1;
    console.log(i);

    return i;
  }
}
