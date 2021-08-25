import {Component, OnInit} from '@angular/core';
import {SharedStateService} from "./shared-state.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'zsKarteAng';

  public constructor(
    private sharedState: SharedStateService
  ) {
    sharedState.fetchData();
  }

  ngOnInit(): void {

  }
}
