import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  private _shortcut = inject(ShortcutService);

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
