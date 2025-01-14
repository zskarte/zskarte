import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
  imports: [CommonModule],
})
export class StackComponent implements OnInit {
  @Input() spacing = 1;

  ngOnInit(): void {
    this.spacing = this.spacing * 4;
  }
}
