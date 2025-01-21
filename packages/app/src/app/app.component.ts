import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from "@angular/material/tabs";
import {NgFor} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, MatTabsModule, NgFor],
})
export class AppComponent implements OnInit {
  private _shortcut = inject(ShortcutService);


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

  constructor(private router: Router) {
    this._shortcut.initialize();
  }

  ngOnInit(): void {
    this.setSize();
    /*this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });*/
  }

  @HostListener('window:resize', ['$event'])
  setSize(): void {
    this.height = document.documentElement?.clientHeight || window.innerHeight;
    this.width = window.innerWidth;
  }
}
