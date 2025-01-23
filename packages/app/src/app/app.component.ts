import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from "@angular/material/tabs";
import {NgFor} from "@angular/common";
import { SessionService } from './session/session.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, MatTabsModule, NgFor, AsyncPipe],
})
export class AppComponent implements OnInit {
  private _shortcut = inject(ShortcutService);
  private _session = inject(SessionService);

  operationId = this._session.observeOperationId();

  navLinks = [
    {
      label: 'Karte',
      link: '/map',
    }, {
      label: 'Journal',
      link: '/journal'
    }
  ];


  height = window.innerHeight;
  width = window.innerWidth;

  constructor() {
    this._shortcut.initialize();
  }

  ngOnInit(): void {
    this.setSize();
  }

  @HostListener('window:resize', ['$event'])
  setSize(): void {
    this.height = document.documentElement?.clientHeight || window.innerHeight;
    this.width = window.innerWidth;
  }
}
