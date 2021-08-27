import { Component, Input, OnInit } from '@angular/core';
import { SharedStateService, SidebarContext } from '../shared-state.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidebar-root',
  templateUrl: './sidebar-root.component.html',
  styleUrls: ['./sidebar-root.component.css'],
})
export class SidebarRootComponent implements OnInit {
  @Input() sidenav: MatSidenav;
  private sidebarContext: SidebarContext = null;
  private sidebarOpen: boolean = false;

  constructor(private sharedState: SharedStateService) {}

  ngOnInit(): void {
    this.sharedState.sidebarContext.subscribe((context) => {
      if (context === null) {
        return;
      }
      this.sidebarOpen = this.sidebarContext !== context || !this.sidebarOpen;
      this.sidenav.toggle(this.sidebarOpen);
      this.sidebarContext = context;
    });
  }
}
