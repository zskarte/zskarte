import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  
  searchQuery = signal('');
  selectedArticleId = signal<string | null>(null);
  expandedParents = signal<Set<string>>(new Set());

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
      id: 'find-place',
      titleKey: 'findPlace',
      contentKey: 'docSearch',
      images: [
        { src: 'assets/doc/search.png', class: 'limitHeight' },
        { src: 'assets/doc/flag.png', class: 'responsive' },
      ],
    },
    {
      id: 'find-place-marker',
      titleKey: 'marker',
      contentKey: 'docMarker',
      imageKey: 'assets/doc/flag.png',
      imageClass: 'responsive',
      parentId: 'find-place',
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
    this.route.params.subscribe(params => {
      const { parentSlug, childSlug, slug } = params;
      
      let article: HelpArticle | undefined;
      
      if (parentSlug && childSlug) {
        const parentArticle = this.articles.find((a) => !a.parentId && this.getSlugFromId(a.id) === parentSlug);
        if (parentArticle) {
          article = this.articles.find((a) => a.id === `${parentArticle.id}-${childSlug}` && a.parentId === parentArticle.id);
        }
      } else if (slug) {
        article = this.articles.find((a) => this.getSlugFromId(a.id) === slug);
      }
      
      if (article) {
        this.selectArticle(article.id);
        return;
      }
      
      if (this.articles.length > 0) {
        this.navigateToArticle(this.articles[0].id);
      }
    });
  }

  getSlugFromId(id: string): string {
    return id;
  }

  getChildSlugFromId(id: string, parentId: string): string {
    return id.startsWith(`${parentId}-`) ? id.substring(parentId.length + 1) : id;
  }

  navigateToArticle(articleId: string): void {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;
    
    if (article.parentId) {
      const parentArticle = this.articles.find(a => a.id === article.parentId);
      if (parentArticle) {
        this.router.navigate(['/help', this.getSlugFromId(parentArticle.id), this.getChildSlugFromId(article.id, article.parentId)]);
      }
    } else {
      this.router.navigate(['/help', this.getSlugFromId(article.id)]);
    }
  }

  filteredArticles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.articles;
    }
    
    const matchingArticles = this.articles.filter((article) => {
      const title = this.i18n.get(article.titleKey).toLowerCase();
      const content = this.i18n.get(article.contentKey).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
    
    const parentIds = new Set(matchingArticles.map(a => a.parentId).filter(Boolean) as string[]);
    const allMatching = [...matchingArticles];
    
    parentIds.forEach(parentId => {
      const parent = this.articles.find(a => a.id === parentId);
      if (parent && !allMatching.some(a => a.id === parentId)) {
        allMatching.push(parent);
      }
    });
    
    return allMatching;
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
    
    if (query) {
      const expanded = new Set<string>();
      filtered.forEach(article => {
        if (article.parentId) {
          expanded.add(article.parentId);
        }
      });
      this.expandedParents.set(expanded);
    }
    
    if (filtered.length > 0) {
      const currentId = this.selectedArticleId();
      if (!currentId || !filtered.some(a => a.id === currentId)) {
        this.selectArticle(filtered[0].id);
      }
    }
  }

  selectArticle(articleId: string, shouldExpand = true): void {
    this.navigateToArticle(articleId);
    this.selectedArticleId.set(articleId);
    
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;
    
    const expanded = new Set(this.expandedParents());
    
    if (article.parentId) {
      expanded.add(article.parentId);
    }
    
    if (shouldExpand && this.getChildArticles(article.id).length > 0) {
      expanded.add(article.id);
    }
    
    this.expandedParents.set(expanded);
  }

  getSelectedArticle(): HelpArticle | undefined {
    const selectedId = this.selectedArticleId();
    return selectedId 
      ? this.articles.find((a) => a.id === selectedId)
      : this.filteredArticles()[0];
  }

  navigateToMap(): void {
    this.router.navigate(['/main/map']);
  }

  toggleExpand(parentId: string): void {
    const expanded = new Set(this.expandedParents());
    if (expanded.has(parentId)) {
      expanded.delete(parentId);
    } else {
      expanded.add(parentId);
    }
    this.expandedParents.set(expanded);
  }

  isExpanded(parentId: string): boolean {
    return this.expandedParents().has(parentId);
  }

  handleParentClick(articleId: string): void {
    if (this.getChildArticles(articleId).length > 0) {
      this.toggleExpand(articleId);
      this.selectArticle(articleId, false);
    } else {
      this.selectArticle(articleId);
    }
  }
}
