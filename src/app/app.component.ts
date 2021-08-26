import {Component, OnInit} from '@angular/core';
import {SharedStateService, SidebarContext} from "./shared-state.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'zsKarteAng';

  SidebarContext = SidebarContext;

  public constructor(
    public sharedState: SharedStateService
  ) {
    sharedState.fetchData();
  }

  ngOnInit(): void {

  }
}
