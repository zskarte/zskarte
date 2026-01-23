import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-empty-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-header.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyHeaderComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-empty-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-media.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyMediaComponent {
  @Input() variant: 'default' | 'icon' = 'default';
  @Input() className = '';
  
  get mediaClasses(): string {
    const base = 'empty-media';
    const variantClass = this.variant === 'icon' ? 'empty-media-icon' : 'empty-media-default';
    return [base, variantClass, this.className].filter(Boolean).join(' ');
  }
}

@Component({
  selector: 'app-empty-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-title.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyTitleComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-empty-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-description.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyDescriptionComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-empty-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-content.component.html',
  styleUrls: ['./empty.component.scss'],
})
export class EmptyContentComponent {
  @Input() className = '';
}
