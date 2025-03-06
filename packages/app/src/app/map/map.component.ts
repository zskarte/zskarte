import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FloatingUIComponent } from '../floating-ui/floating-ui.component';
import { MapRendererComponent } from '../map-renderer/map-renderer.component';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { SidebarService } from '../sidebar/sidebar.service';
import { SidebarContext } from '../sidebar/sidebar.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FloatingUIComponent, MapRendererComponent],
})
export class MapComponent implements OnInit, OnDestroy {
  private fragmentSubscription: Subscription | undefined;
  private router = inject(Router);
  private sidebar = inject(SidebarService);

  ngOnInit() {
    this.fragmentSubscription = this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => {
          const urlTree = this.router.parseUrl(event.urlAfterRedirects);
          return urlTree.fragment;
        }),
      )
      .subscribe((fragment) => {
        if (fragment?.startsWith('message=')) {
          this.sidebar.open(SidebarContext.Journal);
        }
      });
  }

  ngOnDestroy() {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }
}
