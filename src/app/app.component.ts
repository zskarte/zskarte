import { Component, HostListener, OnInit } from '@angular/core';
import { SharedStateService, SidebarContext } from './shared-state.service';
import { KeyboardHandler } from './keyboard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'zsKarteAng';
  SidebarContext = SidebarContext;
  height = window.innerHeight;
  width = window.innerWidth;

  public constructor(
    public sharedState: SharedStateService,
    private keyboardHandler: KeyboardHandler
  ) {
    sharedState.fetchData();
  }

  ngOnInit(): void {
    this.setSize();
  }

  @HostListener('window:resize', ['$event'])
  setSize(): void {
    this.height = document.documentElement?.clientHeight || window.innerHeight;
    this.width = window.innerWidth;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    this.keyboardHandler.onKeyDown(e);
  }
}
