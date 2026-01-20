import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { I18NService } from '../state/i18n.service';

interface HelpArticle {
  id: string;
  titleKey: string;
  contentKey: string;
  imageKey?: string;
  imageClass?: string;
  images?: Array<{ src: string; class?: string; alt?: string }>;
  parentId?: string;
}

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.component.html',
  styleUrls: ['./help-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
  ],
})
export class HelpPageComponent implements OnInit {
  i18n = inject(I18NService);
  private router = inject(Router);
  
  searchQuery = signal('');
  selectedArticleId = signal<string | null>(null);

  articles: HelpArticle[] = [
    {
      id: 'login',
      titleKey: 'docLoginTitle',
      contentKey: 'docLogin',
      imageKey: 'assets/doc/login.png',
      imageClass: 'responsive',
    },
    {
      id: 'create-or-load',
      titleKey: 'docCreateOrLoadTitle',
      contentKey: 'docCreateOrLoad',
      imageKey: 'assets/doc/load.png',
      imageClass: 'responsive',
    },
    {
      id: 'main-view',
      titleKey: 'docMainViewTitle',
      contentKey: 'docMainView',
      imageKey: 'assets/doc/map.png',
      imageClass: 'big no-rounding',
    },
    {
      id: 'map-menu',
      titleKey: 'docMapMenuTitle',
      contentKey: 'docMapMenu',
      imageKey: 'assets/doc/map-menu.png',
      imageClass: 'limitHeight',
    },
    {
      id: 'search',
      titleKey: 'findPlace',
      contentKey: 'docSearch',
      imageKey: 'assets/doc/search.png',
      imageClass: 'limitHeight',
    },
    {
      id: 'marker',
      titleKey: 'findPlace',
      contentKey: 'docMarker',
      imageKey: 'assets/doc/flag.png',
      imageClass: 'responsive',
    },
    {
      id: 'draw',
      titleKey: 'draw',
      contentKey: 'docDraw',
      imageKey: 'assets/doc/draw.png',
      imageClass: 'limitHeight',
    },
    {
      id: 'symbol-selection',
      titleKey: 'docSymbolSelectionTitle',
      contentKey: 'docSymbolSelection',
      imageKey: 'assets/doc/signature.png',
      imageClass: 'big no-rounding',
    },
    {
      id: 'selection',
      titleKey: 'docSelectionTitle',
      contentKey: 'docSelection',
      imageKey: 'assets/doc/select.png',
      imageClass: 'responsive',
    },
    {
      id: 'map-functions',
      titleKey: 'docMapFunctionsTitle',
      contentKey: 'docMapFunctions',
      imageKey: 'assets/doc/map-functions.png',
      imageClass: 'limitHeight',
    },
    {
      id: 'quick-functions',
      titleKey: 'docQuickFunctionsTitle',
      contentKey: 'docQuickFunctions',
      imageKey: 'assets/doc/quick-functions.png',
      imageClass: 'responsive',
    },
    {
      id: 'expert-view',
      titleKey: 'expertView',
      contentKey: 'docExpertIntro',
      imageKey: 'assets/doc/expert/view-button.png',
      imageClass: 'limitHeight',
    },
    {
      id: 'expert-view-wms-source',
      titleKey: 'docExpertWmsSourceTitle',
      contentKey: 'docExpertWmsSourceCombined',
      images: [
        { src: 'assets/doc/expert/wms-source-button.png', class: 'small' },
        { src: 'assets/doc/expert/wms-source.png', class: 'small' },
        { src: 'assets/doc/expert/wms-source-details.png', class: 'responsive' },
      ],
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-wms-layers',
      titleKey: 'docExpertWmsLayersTitle',
      contentKey: 'docExpertWmsLayersCombined',
      images: [
        { src: 'assets/doc/expert/available-layer.png', class: 'small' },
        { src: 'assets/doc/expert/selected-layers.png', class: 'small' },
        { src: 'assets/doc/expert/wms-layer.png', class: 'responsive' },
        { src: 'assets/doc/expert/wms-layer-group.png', class: 'responsive' },
      ],
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-geojson',
      titleKey: 'docExpertGeoJsonLayersTitle',
      contentKey: 'docExpertGeoJsonLayersCombined',
      images: [
        { src: 'assets/doc/expert/new-layer.png', class: 'small' },
        { src: 'assets/doc/expert/geojson-layer.png', class: 'responsive' },
      ],
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-csv',
      titleKey: 'docExpertCsvLayersTitle',
      contentKey: 'docExpertCsvLayersCombined',
      images: [
        { src: 'assets/doc/expert/csv-layer.png', class: 'responsive' },
        { src: 'assets/doc/expert/csv-layer-filter.png', class: 'responsive' },
      ],
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-search',
      titleKey: 'docExpertSucheTitle',
      contentKey: 'docExpertSuche',
      imageKey: 'assets/doc/expert/suche-layer.png',
      imageClass: 'responsive',
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-persist',
      titleKey: 'docExpertPersistLayersTitle',
      contentKey: 'docExpertPersistLayers',
      imageKey: 'assets/doc/expert/persist-layers.png',
      imageClass: 'small',
      parentId: 'expert-view',
    },
    {
      id: 'expert-view-org-defaults',
      titleKey: 'docExpertOrganisationDefaultsTitle',
      contentKey: 'docExpertOrganisationDefaultsCombined',
      images: [
        { src: 'assets/doc/expert/organisation-defaults-button.png', class: 'small' },
        { src: 'assets/doc/expert/organisation-defaults.png', class: 'responsive' },
      ],
      parentId: 'expert-view',
    },
  ];
  
  ngOnInit(): void {
    // Check for article ID in route query params
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');
    if (articleId) {
      const article = this.articles.find((a) => a.id === articleId);
      if (article) {
        this.selectedArticleId.set(articleId);
        return;
      }
    }
    // Auto-select first article on load
    if (this.articles.length > 0) {
      this.selectedArticleId.set(this.articles[0].id);
    }
  }

  filteredArticles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.articles;
    }
    return this.articles.filter((article) => {
      const title = this.i18n.get(article.titleKey).toLowerCase();
      const content = this.i18n.get(article.contentKey).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  });

  topLevelArticles = computed(() => {
    return this.filteredArticles().filter((article) => !article.parentId);
  });

  getChildArticles(parentId: string): HelpArticle[] {
    return this.filteredArticles().filter((article) => article.parentId === parentId);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    const filtered = this.filteredArticles();
    if (filtered.length > 0) {
      const currentId = this.selectedArticleId();
      if (!currentId || !filtered.find(a => a.id === currentId)) {
        this.selectedArticleId.set(filtered[0].id);
      }
    }
  }

  selectArticle(articleId: string): void {
    this.selectedArticleId.set(articleId);
  }

  getSelectedArticle(): HelpArticle | undefined {
    const selectedId = this.selectedArticleId();
    if (!selectedId) {
      return this.filteredArticles()[0];
    }
    return this.articles.find((a) => a.id === selectedId);
  }

  navigateToMap(): void {
    this.router.navigate(['/main/map']);
  }
}
